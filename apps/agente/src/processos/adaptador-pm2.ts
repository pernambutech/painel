import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import pm2 from 'pm2';
import type {
  ConfiguracaoServico,
  IAdaptadorProcessos,
  LogProcesso,
  OpcoesLogs,
  ResultadoProcesso,
  StatusProcesso,
} from '@painel/contratos/adaptador-processos';

interface ProcessoPm2 {
  name?: string;
  pm_id?: number;
  pid?: number;
  monit?: { cpu?: number; memory?: number };
  pm2_env?: {
    status?: string;
    pm_cwd?: string;
    env?: Record<string, string | undefined>;
    pm_uptime?: number;
    restart_time?: number;
    pm_out_log_path?: string;
    pm_err_log_path?: string;
  };
}

// ===========================================
// CONSTANTES
// ===========================================

/** Nome da tarefa agendada do Windows para auto-start do PM2 */
const NOME_TAREFA_STARTUP = 'PainelPM2';

/**
 * Busca o diretório raiz do projeto procurando por ecosystem.config.js.
 * Sobe a partir do diretório fornecido até encontrar o arquivo.
 */
function encontrarRaizProjeto(caminhoInicial: string): string | null {
  let dir = caminhoInicial;
  for (let i = 0; i < 10; i++) {
    if (fsSync.existsSync(path.join(dir, 'ecosystem.config.js'))) {
      return dir;
    }
    const pai = path.dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  return null;
}

/**
 * Resolve o caminho do PM2 local no projeto.
 * Prioriza node_modules/.bin/pm2.cmd (Windows) ou pm2 (Linux/macOS).
 */
function resolverCaminhoPm2Local(raizProjeto: string): string | null {
  const extensao = os.platform() === 'win32' ? '.cmd' : '';
  const caminho = path.join(raizProjeto, 'node_modules', '.bin', `pm2${extensao}`);
  if (fsSync.existsSync(caminho)) return caminho;
  return null;
}

export function obterComandoStartup(plataforma: NodeJS.Platform = process.platform): string {
  if (plataforma === 'win32') return `schtasks /create /tn "${NOME_TAREFA_STARTUP}"`;
  return 'pm2 startup';
}

export class AdaptadorPm2 implements IAdaptadorProcessos {
  private conectado = false;

  async inicializar(): Promise<void> {
    if (this.conectado) return;

    await new Promise<void>((resolve, reject) => {
      pm2.connect((erro) => {
        if (erro) {
          reject(new Error(`Não foi possível conectar ao PM2: ${erro.message}`));
          return;
        }
        this.conectado = true;
        resolve();
      });
    });
  }

  async finalizar(): Promise<void> {
    if (!this.conectado) return;
    pm2.disconnect();
    this.conectado = false;
  }

  async iniciar(configuracao: ConfiguracaoServico): Promise<ResultadoProcesso> {
    try {
      await this.inicializar();
      const nome = configuracao.nomePm2 || configuracao.id;
      const nomeExistente = await this.encontrarNome(configuracao);
      if (nomeExistente) {
        const existente = (await this.descrever(nomeExistente))[0];
        // Reutiliza somente se o processo já estiver ONLINE.
        // Processos parados/erro caem no fluxo de criação abaixo, que deleta e
        // recria com o comando/ambiente/logs atuais — pm2.start(nome) apenas
        // reativaria a configuração antiga (ex.: sem redirecionamento de logs).
        if (existente?.pm2_env?.status === 'online') {
          return {
            sucesso: true,
            processoId: configuracao.id,
            pid: existente?.pid,
            dados: { nomePm2: nomeExistente, reutilizado: true },
          };
        }
      }
      const ehWindows = os.platform() === 'win32';

      // Caminhos de log: no Windows o PM2 NÃO captura a saída de processos
      // iniciados via cmd.exe (os arquivos de log padrão ficam vazios), e o
      // redirecionamento na linha de comando ("<comando> 1> arquivo") é frágil
      // dentro do PM2. Por isso o comando é executado por um runner Node
      // (processo "node" direto, cuja saída o PM2 captura normalmente) que
      // aponta o stdout/stderr para os arquivos da pasta de logs do painel
      // (~/.painel/logs), separada da pasta de logs do PM2.
      const caminhoOut = this.caminhoLog(nome, 'out');
      const caminhoErro = this.caminhoLog(nome, 'error');

      // Garante que a pasta de logs do painel exista antes do runner escrever.
      await fs.mkdir(path.dirname(caminhoOut), { recursive: true });

      const comandoCompleto = [configuracao.comando, ...(configuracao.argumentos || [])].join(' ');

      // Em TODAS as plataformas, usa o runner Node que adiciona timestamps
      // reais ([YYYY-MM-DD HH:mm:ss]) em cada linha de log. No Linux o PM2
      // sozinha grava logs sem formato parseável, causando timestamp "agora".
      const script = 'node';
      // O runner-comando.js precisa SEMPRE estar no dist/, pois o PM2 executa
      // com "node" (não tsx). Quando o agente roda em dev via tsx, __dirname
      // aponta para src/processos/, mas o .js compilado está em dist/processos/.
      const raizAgente = path.resolve(__dirname, '..', '..');
      const argumentos = [
        path.join(raizAgente, 'dist', 'processos', 'runner-comando.js'),
        caminhoOut,
        caminhoErro,
        comandoCompleto,
      ];
      // Injetar a porta indicada no painel como variável de ambiente
      // Cobre tanto convenção em inglês (PORT) quanto em português (PORTA)
      // ex: Pernambutech usa process.env.PORTA, Next.js/Nest padrão usa PORT
      const variaveisFornecidas = configuracao.variaveisAmbiente || {};

      // Define explicitamente o NODE_ENV do processo iniciado.
      // Motivo: o PM2 herda o ambiente do daemon (e do agente), que roda com
      // NODE_ENV=production. Se esse valor vazar para um comando de
      // desenvolvimento (ex.: "next dev"), o Next.js entra em modo híbrido
      // inconsistente e quebra (ex.: erro ENOENT do prerender-manifest.js).
      // Prioridade:
      //   1. NODE_ENV informado nas variáveis de ambiente do serviço;
      //   2. Derivação pelo comando (dev/watch → development, senão production).
      const nodeEnvFornecido = variaveisFornecidas.NODE_ENV?.trim();
      const nodeEnv = nodeEnvFornecido
        ? nodeEnvFornecido
        : /\bdev\b|start:dev|--watch|tsx watch|--inspect/.test(configuracao.comando)
          ? 'development'
          : 'production';

      const env = {
        // Variáveis fornecidas pelo usuário no cadastro do serviço
        ...variaveisFornecidas,
        NODE_ENV: nodeEnv,
        ...(configuracao.porta
          ? {
              PORT: String(configuracao.porta),
              PORTA: String(configuracao.porta),
              APP_PORT: String(configuracao.porta),
            }
          : {}),
        // Marca os arquivos de log controlados pelo painel (redirecionamento
        // no Windows) para o obterLogs localizá-los com precisão. Processos
        // iniciados fora do painel não possuem essas variáveis.
        ...(ehWindows
          ? { PAINEL_LOG_OUT: caminhoOut, PAINEL_LOG_ERRO: caminhoErro }
          : {}),
        // ============================================================
        // BLOQUEIO DE VAZAMENTO DE ENV DO DAEMON PM2
        // O PM2 herda variáveis do daemon (agente/painel). Variáveis
        // NEXT_PUBLIC_* do painel NÃO devem vazar para serviços de
        // terceiros (ex: frontend Pernambutech apontando para API errada).
        // Definir como vazio para sobrescrever o valor do daemon.
        // ============================================================
        NEXT_PUBLIC_API_URL: variaveisFornecidas.NEXT_PUBLIC_API_URL ?? '',
        AGENT_API_URL: variaveisFornecidas.AGENT_API_URL ?? '',
        AGENT_TOKEN: variaveisFornecidas.AGENT_TOKEN ?? '',
      };

      // Deletar processo existente antes de recriar para garantir
      // que variáveis de ambiente (PORT, PORTA, APP_PORT) sejam atualizadas.
      // pm2.start em processo existente NÃO atualiza o env.
      await this.deletarSeExistir(nome);

      const processo = await this.executar<ProcessoPm2>((concluir) => {
        pm2.start(
          {
            name: nome,
            script,
            args: argumentos,
            cwd: configuracao.diretorio,
            env,
            autorestart: true,
            max_restarts: configuracao.maxReinicios,
            restart_delay: configuracao.restartDelay,
          },
          concluir,
        );
      });

      const persistencia = await this.salvar();
      if (!persistencia.sucesso) {
        return {
          sucesso: false,
          processoId: configuracao.id,
          pid: processo?.pid,
          erro: persistencia.erro || 'Falha ao salvar processo no PM2 para reinicialização automática',
        };
      }

      return {
        sucesso: true,
        processoId: configuracao.id,
        pid: processo?.pid,
        dados: { nomePm2: nome, persistido: true },
      };
    } catch (erro) {
      return { sucesso: false, erro: this.mensagemErro(erro) };
    }
  }

  async parar(id: string): Promise<ResultadoProcesso> {
    return this.operar(id, (nome, concluir) => pm2.stop(nome, concluir));
  }

  async reiniciar(id: string): Promise<ResultadoProcesso> {
    return this.operar(id, (nome, concluir) => pm2.restart(nome, concluir));
  }

  async salvar(): Promise<ResultadoProcesso> {
    try {
      await this.inicializar();
      await this.executar<void>((concluir) => {
        const pm2Any = pm2 as any;
        if (typeof pm2Any.save === 'function') {
          pm2Any.save(concluir);
          return;
        }
        if (typeof pm2Any.dump === 'function') {
          pm2Any.dump(concluir);
          return;
        }
        concluir(new Error('PM2 não possui método de persistência disponível.'));
      });
      return { sucesso: true, dados: { comando: obterComandoStartup() } };
    } catch (erro) {
      return { sucesso: false, erro: this.mensagemErro(erro) };
    }
  }

  /**
   * Verifica se o PM2 startup está configurado no sistema.
   * Retorna { configurado: true/false, comando?: string, mensagem?: string }.
   */
  async verificarStartup(): Promise<ResultadoProcesso> {
    try {
      const plataforma = os.platform();
      let configurado = false;
      let detalhes = '';

      if (plataforma === 'win32') {
        // No Windows, verifica se a tarefa agendada PainelPM2 existe
        try {
          const saida = execSync(`schtasks /query /tn "${NOME_TAREFA_STARTUP}"`, {
            encoding: 'utf-8',
            timeout: 5000,
            windowsHide: true,
          });
          configurado = saida.includes(NOME_TAREFA_STARTUP);
          detalhes = configurado ? 'Tarefa agendada encontrada' : 'Tarefa agendada nao encontrada';
        } catch {
          configurado = false;
          detalhes = 'Tarefa agendada nao encontrada';
        }
      } else {
        // No Linux/macOS, verifica se existe script de init
        try {
          const saida = execSync('pm2 startup 2>&1 | head -5', {
            encoding: 'utf-8',
            timeout: 5000,
          });
          // Se já está configurado, o PM2 mostra "Already installed" ou o caminho do script
          configurado = saida.includes('already installed') || saida.includes('systemd');
          detalhes = saida.trim();
        } catch (erro: any) {
          configurado = false;
          detalhes = erro.stdout || erro.message || 'Não configurado';
        }
      }

      return {
        sucesso: true,
        dados: {
          configurado,
          plataforma,
          detalhes,
          comando: obterComandoStartup(plataforma),
        },
      };
    } catch (erro) {
      return { sucesso: false, erro: this.mensagemErro(erro) };
    }
  }

  /**
   * Configura o PM2 startup no sistema.
   * No Linux, executa o comando completo de startup.
   * No Windows, cria um script .bat de resurrect + tarefa agendada no logon.
   */
  async configurarStartup(): Promise<ResultadoProcesso> {
    try {
      const plataforma = os.platform();
      let saida = '';

      if (plataforma === 'win32') {
        // =============================================
        // WINDOWS: criar script .bat + tarefa agendada
        // O PM2 não possui pm2 startup nativo no Windows.
        // O mecanismo correto é:
        //   1. Criar um .bat que executa `pm2 resurrect`
        //   2. Criar tarefa agendada que executa esse .bat no logon
        // =============================================

        // 1. Encontrar raiz do projeto e PM2 local
        const raizProjeto = this.obterRaizProjeto();
        const caminhoPm2 = resolverCaminhoPm2Local(raizProjeto);
        if (!caminhoPm2) {
          throw new Error(
            'PM2 local nao encontrado. Execute npm install primeiro.',
          );
        }

        // 2. Criar script .bat de resurrect
        const caminhoBat = path.join(raizProjeto, 'pm2-startup.bat');
        const conteudoBat = [
          '@echo off',
          'REM ============================================',
          'REM Painel - PM2 Auto-Restore (gerenciado pelo agente)',
          'REM Este arquivo e gerenciado automaticamente.',
          'REM Nao edite manualmente.',
          'REM ============================================',
          `cd /d "${raizProjeto}"`,
          `"${caminhoPm2}" resurrect`,
        ].join('\r\n');
        await fs.writeFile(caminhoBat, conteudoBat, 'utf8');

        // 3. Criar tarefa agendada que executa o .bat no logon
        //    /sc onlogon = executa ao fazer login
        //    /rl highest = com permissoes elevadas
        //    /f = forca recriacao se ja existir (idempotente)
        const cmdSchtasks = `schtasks /create /tn "${NOME_TAREFA_STARTUP}" /tr "\\"${caminhoBat}\\"" /sc onlogon /rl highest /f`;
        try {
          saida = execSync(cmdSchtasks, {
            encoding: 'utf-8',
            timeout: 10000,
            windowsHide: true,
          });
        } catch (erro: any) {
          throw new Error(
            `Falha ao criar tarefa agendada: ${erro.stderr || erro.message}`,
          );
        }

        // 4. Salvar estado atual do PM2 para o resurrect funcionar
        await this.salvar();
        saida = `Script de startup criado: ${caminhoBat}\n${saida}`;
      } else {
        // No Linux/macOS, o pm2 startup retorna o comando completo com sudo
        const resultado = execSync('pm2 startup -u $USER 2>&1', {
          encoding: 'utf-8',
          timeout: 15000,
        });
        saida = resultado;

        // Tentar extrair e executar o comando de systemd
        const matchComando = resultado.match(/sudo\s+.+/);
        if (matchComando) {
          try {
            execSync(matchComando[0], { encoding: 'utf-8', timeout: 15000 });
            saida += '\nComando de init executado com sucesso';
          } catch (erro: any) {
            saida += `\nExecute manualmente: ${matchComando[0]}`;
          }
        }
      }

      return {
        sucesso: true,
        dados: {
          mensagem: 'PM2 startup configurado',
          plataforma,
          saida: saida.trim(),
        },
      };
    } catch (erro) {
      return { sucesso: false, erro: this.mensagemErro(erro) };
    }
  }

  /**
   * Remove o PM2 startup do sistema.
   * No Linux, executa pm2 unstartup.
   * No Windows, remove a tarefa agendada e o script .bat.
   * NÃO remove o dump.pm2 (processos podem ser restaurados manualmente).
   */
  async removerStartup(): Promise<ResultadoProcesso> {
    try {
      const plataforma = os.platform();
      let saida = '';

      if (plataforma === 'win32') {
        // 1. Remover tarefa agendada
        try {
          saida = execSync(`schtasks /delete /tn "${NOME_TAREFA_STARTUP}" /f`, {
            encoding: 'utf-8',
            timeout: 5000,
            windowsHide: true,
          });
        } catch {
          saida = 'Tarefa agendada nao encontrada ou ja removida';
        }

        // 2. Remover script .bat de startup (se existir)
        try {
          const raizProjeto = this.obterRaizProjeto();
          const caminhoBat = path.join(raizProjeto, 'pm2-startup.bat');
          await fs.unlink(caminhoBat).catch(() => {});
          saida += '\nScript pm2-startup.bat removido';
        } catch {
          // Ignorar erro ao remover .bat
        }

        // NÃO remover dump.pm2 — processos podem ser restaurados manualmente
      } else {
        saida = execSync('pm2 unstartup -f 2>&1', {
          encoding: 'utf-8',
          timeout: 10000,
        });
      }

      return {
        sucesso: true,
        dados: {
          mensagem: 'PM2 startup removido',
          plataforma,
          saida: saida.trim(),
        },
      };
    } catch (erro) {
      return { sucesso: false, erro: this.mensagemErro(erro) };
    }
  }

  async obterStatus(id: string): Promise<StatusProcesso> {
    await this.inicializar();
    const processos = (await this.listarProcessos()).filter((processo) => processo.name === id);
    const processo = processos[0];
    if (!processo) {
      return { processoId: id, nome: id, status: 'desconhecido', reinicios: 0 };
    }
    return this.mapearStatus(id, processo);
  }

  async resolverNome(configuracao: {
    nomePm2?: string;
    diretorio?: string;
    porta?: number;
  }): Promise<string> {
    return (await this.encontrarNome(configuracao)) || configuracao.nomePm2 || '';
  }

  async obterTodosStatus(): Promise<StatusProcesso[]> {
    await this.inicializar();
    const processos = await this.executar<ProcessoPm2[]>((concluir) => pm2.list(concluir));
    return (processos || []).map((processo) =>
      this.mapearStatus(processo.name || String(processo.pm_id), processo),
    );
  }

  /** Retorna lista bruta de processos PM2 (usado pelo dashboard). */
  async listarProcessos(): Promise<ProcessoPm2[]> {
    await this.inicializar();
    return (await this.executar<ProcessoPm2[]>((concluir) => pm2.list(concluir))) || [];
  }

  async obterLogs(id: string, opcoes: OpcoesLogs = {}): Promise<LogProcesso[]> {
    await this.inicializar();
    const processo = (await this.listarProcessos()).find((item) => item.name === id);
    if (!processo?.pm2_env) return [];

    const linhas = opcoes.linhas || 100;
    const entradas: LogProcesso[] = [];

    // Resolve o arquivo de log de uma fonte (stdout/stderr) escolhendo o
    // primeiro candidato existente, na ordem:
    //   1. Variável de ambiente definida pelo painel (PAINEL_LOG_OUT/ERRO) —
    //      processo criado pelo adaptador com redirecionamento no Windows;
    //   2. Arquivo da pasta de logs do painel (processo redirecionado);
    //   3. Caminho padrão do PM2 (processos iniciados fora do painel, ex.: o
    //      próprio painel, cuja saída o PM2 captura normalmente).
    const ambientes = processo.pm2_env;
    const ambiente = ambientes?.env || {};
    const nomeProcesso = processo.name || id;
    const selecionarCaminho = async (fonte: 'stdout' | 'stderr'): Promise<string | undefined> => {
      const candidatos = [
        ambiente[fonte === 'stdout' ? 'PAINEL_LOG_OUT' : 'PAINEL_LOG_ERRO'],
        this.caminhoLog(nomeProcesso, fonte === 'stdout' ? 'out' : 'error'),
        fonte === 'stdout' ? ambientes.pm_out_log_path : ambientes.pm_err_log_path,
      ];
      for (const candidato of candidatos) {
        if (!candidato) continue;
        try {
          await fs.access(candidato, fs.constants.F_OK);
          return candidato;
        } catch {
          // Arquivo não existe — tenta o próximo candidato.
        }
      }
      return undefined;
    };

    const caminhoOut = await selecionarCaminho('stdout');
    const caminhoErro = await selecionarCaminho('stderr');
    const arquivos =
      opcoes.tipo === 'stderr'
        ? [['stderr', caminhoErro]]
        : opcoes.tipo === 'stdout'
          ? [['stdout', caminhoOut]]
          : [
              ['stdout', caminhoOut],
              ['stderr', caminhoErro],
            ];

    // ── Remove códigos ANSI (cores do terminal) ────────────────────
    // PM2 grava com cores: [32m, [39m, [38;5;3m, etc.
    const stripAnsi = (str: string): string =>
      str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').replace(/\[[\d;]*m/g, '');

    // ── Expressões regulares para extrair timestamps reais ──────────
    // Runner grava:        [2026-09-01 12:30:45] mensagem
    // PM2 Linux grava:     2026-09-01T12:30:45.123Z › msg
    // PM2 NestJS grava:    28/08/2026, 17:25:54  LOG ...
    // Formato ISO puro:    2026-09-01 12:30:45 msg
    const regexsTimestamp = [
      /^\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]\s*(.*)/,
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?)\s*[›|]\s*(.*)/,
      /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.*)/,
      // PM2 NestJS: " - 28/08/2026, 17:25:54   LOG  msg"
      /\d+\s*-\s*(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2}:\d{2})\s+\w+\s+(.*)/,
    ];

    const extrairTimestamp = (linhaLimpa: string): { timestamp: string; mensagem: string } => {
      for (const regex of regexsTimestamp) {
        const match = regex.exec(linhaLimpa);
        if (match) {
          try {
            let data: Date;
            if (match[1].includes('/')) {
              // Formato DD/MM/YYYY, HH:MM:SS
              const [dataParte, horaParte] = match[1].includes(',') ? match[1].split(',') : [match[1], match[2]];
              const [dia, mes, ano] = dataParte.trim().split('/');
              const hora = horaParte ? horaParte.trim() : (match[2] || '00:00:00');
              data = new Date(`${ano}-${mes}-${dia}T${hora}`);
              if (!isNaN(data.getTime())) {
                return { timestamp: data.toISOString(), mensagem: match[3] || match[2] };
              }
            } else {
              data = new Date(match[1].replace(' ', 'T'));
              if (!isNaN(data.getTime())) {
                return { timestamp: data.toISOString(), mensagem: match[2] };
              }
            }
          } catch { /* tenta próxima regex */ }
        }
      }
      return { timestamp: '', mensagem: linhaLimpa };
    };

    // Detecta nível real do log pela mensagem em vez de só pela fonte.
    // Muitos processos Node.js (Next.js, Webpack) escrevem tudo no stderr,
    // mas nem tudo é erro — é saída normal do dev server.
    const detectarNivel = (mensagem: string, fonte: string): LogProcesso['nivel'] => {
      const msg = mensagem.toLowerCase();
      if (/\b(error|err|fatal|crash|exception|fail(ed)?)\b/.test(msg)) return 'error';
      if (/\b(warn(ing)?|alerta)\b/.test(msg)) return 'warn';
      if (/\b(debug|trace|verbose)\b/.test(msg)) return 'debug';
      // Se a mensagem parece saída normal (info), usa info mesmo vindo de stderr
      if (/\b(info|started|listening|ready|connected|iniciado|rodando|servidor)\b/.test(msg)) return 'info';
      // Último recurso: confia na fonte
      return fonte === 'stderr' ? 'error' : 'info';
    };

    for (const [fonte, caminho] of arquivos) {
      if (!fonte || !caminho) continue;
      try {
        const conteudo = await fs.readFile(caminho, 'utf8');
        const linhasArquivo = conteudo.split(/\r?\n/).filter(Boolean);

        // Usa mtime do arquivo como referência temporal para fallback
        let mtimeIso = new Date().toISOString();
        try {
          const stat = await fs.stat(caminho);
          mtimeIso = stat.mtime.toISOString();
        } catch { /* usa data atual como último recurso */ }

        for (const linha of linhasArquivo.slice(-linhas)) {
          // Remove códigos ANSI antes de processar
          const linhaLimpa = stripAnsi(linha);
          const { timestamp, mensagem } = extrairTimestamp(linhaLimpa);

          entradas.push({
            timestamp: timestamp || mtimeIso,
            nivel: detectarNivel(mensagem, fonte),
            mensagem,
            fonte: fonte as 'stdout' | 'stderr',
          });
        }
      } catch {
        // Arquivo pode não existir para processo recém-iniciado.
      }
    }

    // Ordena por timestamp crescente antes de limitar
    entradas.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return entradas.slice(-linhas);
  }

  /**
   * Deleta um processo PM2 pelo nome se ele existir.
   * Necessário porque pm2.start em processo existente não atualiza env.
   */
  private async deletarSeExistir(nome: string): Promise<void> {
    try {
      await this.inicializar();
      await this.executar<void>((concluir) => pm2.delete(nome, concluir as any));
    } catch {
      // Processo não existia — ok, prosseguir com start
    }
  }

  private async operar(
    id: string,
    acao: (nome: string, concluir: (erro: Error | null, processo?: ProcessoPm2) => void) => void,
  ): Promise<ResultadoProcesso> {
    try {
      await this.inicializar();
      await this.executar<ProcessoPm2>((concluir) => acao(id, concluir));
      return { sucesso: true, processoId: id };
    } catch (erro) {
      return { sucesso: false, processoId: id, erro: this.mensagemErro(erro) };
    }
  }

  /**
   * Pasta de logs do painel, separada da pasta de logs do PM2: no Windows o
   * PM2 mantém arquivos próprios (vazios para processos via runner/cmd) e o
   * painel grava os logs úteis aqui, sem disputa de escrita com o PM2.
   */
  private pastaLogs(): string {
    return process.env.PAINEL_LOGS_DIR || path.join(os.homedir(), '.painel', 'logs');
  }

  /**
   * Resolve o diretório raiz do projeto procurando por ecosystem.config.js.
   * Começa a partir do diretório de trabalho do processo atual (cwd) e sobe
   * até encontrar o arquivo de configuração do PM2.
   */
  private obterRaizProjeto(): string {
    const candidatos = [
      process.cwd(),
      path.resolve(__dirname, '..', '..', '..'),
      path.resolve(__dirname, '..', '..'),
    ];
    for (const candidato of candidatos) {
      const raiz = encontrarRaizProjeto(candidato);
      if (raiz) return raiz;
    }
    // Último recurso: diretório de trabalho atual
    return process.cwd();
  }

  /**
   * Caminho do arquivo de log de um processo, na pasta de logs do painel.
   * No Windows o PM2 NÃO captura a saída de processos iniciados via cmd.exe;
   * por isso o comando é executado por um runner Node (runner-comando.js) que
   * grava nesses arquivos, e o obterLogs lê exatamente deles.
   */
  private caminhoLog(nome: string, tipo: 'out' | 'error'): string {
    const nomeSeguro = nome.replace(/[^a-zA-Z0-9._-]+/g, '-');
    return path.join(this.pastaLogs(), `${nomeSeguro}-${tipo}.log`);
  }

  private async descrever(id: string): Promise<ProcessoPm2[]> {
    return (await this.executar<ProcessoPm2[]>((concluir) => pm2.describe(id, concluir))) || [];
  }

  private async encontrarNome(configuracao: {
    nomePm2?: string;
    diretorio?: string;
    porta?: number;
  }): Promise<string | null> {
    const processos = await this.executar<ProcessoPm2[]>((concluir) => pm2.list(concluir));
    const normalizar = (valor: string) => valor.replace(/[\\/]+/g, '/').toLowerCase().replace(/\/$/, '');
    const diretorio = configuracao.diretorio ? normalizar(configuracao.diretorio) : '';
    const correspondente = processos.find((processo) => {
      if (!processo.name || !diretorio || normalizar(processo.pm2_env?.pm_cwd || '') !== diretorio) {
        return false;
      }
      if (processo.pm2_env?.status !== 'online') return false;
      if (!configuracao.porta) return true;
      const ambiente = processo.pm2_env?.env || {};
      return [ambiente.PORT, ambiente.PORTA, ambiente.APP_PORT].includes(String(configuracao.porta));
    });
    if (correspondente?.name) return correspondente.name;

    // Busca por porta: só é confiável quando não há diretório informado.
    // Com diretório presente, a busca por porta já foi tentada acima (casa a
    // porta dentro do diretório). Casar porta sozinha seria ambíguo: dois
    // processos podem expor a mesma porta (ex.: o próprio agente que herda uma
    // variável PORT), retornando o processo errado.
    if (configuracao.porta && !diretorio) {
      const processoPorPorta = processos.find((processo) => {
        if (!processo.name || processo.pm2_env?.status !== 'online') return false;
        const ambiente = processo.pm2_env?.env || {};
        return [ambiente.PORT, ambiente.PORTA, ambiente.APP_PORT].includes(String(configuracao.porta));
      });
      if (processoPorPorta?.name) return processoPorPorta.name;
    }

    const nome = processos.find((processo) => processo.name === configuracao.nomePm2);
    return nome?.name || null;
  }

  private executar<T>(
    acao: (concluir: (erro: Error | null, resultado?: T) => void) => void,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      acao((erro, resultado) => {
        if (erro) reject(erro);
        else resolve(resultado as T);
      });
    });
  }

  private mapearStatus(id: string, processo: ProcessoPm2): StatusProcesso {
    const ambiente = processo.pm2_env;
    const pm2Status = ambiente?.status || 'desconhecido';
    // Mapear estados do PM2 para estados expandidos do painel
    const status =
      pm2Status === 'online'
        ? 'online'
        : pm2Status === 'stopped'
          ? 'offline'
          : pm2Status === 'errored'
            ? 'erro'
            : pm2Status === 'launching'
              ? 'iniciando'
              : pm2Status === 'stopping'
                ? 'parando'
                : 'desconhecido';
    const inicio = ambiente?.pm_uptime ? new Date(ambiente.pm_uptime).toISOString() : undefined;
    return {
      processoId: id,
      pid: processo.pid,
      nome: processo.name || id,
      status,
      inicioEm: inicio,
      uptimeMs: ambiente?.pm_uptime ? Date.now() - ambiente.pm_uptime : undefined,
      reinicios: ambiente?.restart_time || 0,
      usoCpu: processo.monit?.cpu,
      memoriaMb: processo.monit?.memory
        ? Math.round(processo.monit.memory / 1024 / 1024)
        : undefined,
    };
  }

  private mensagemErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : String(erro);
  }
}
