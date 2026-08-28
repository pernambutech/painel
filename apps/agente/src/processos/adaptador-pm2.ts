import * as fs from 'fs/promises';
import * as os from 'os';
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
    pm_uptime?: number;
    restart_time?: number;
    pm_out_log_path?: string;
    pm_err_log_path?: string;
  };
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
      const shell = os.platform() === 'win32' ? 'cmd.exe' : 'sh';
      const argumentosShell =
        os.platform() === 'win32'
          ? ['/d', '/s', '/c', configuracao.comando, ...(configuracao.argumentos || [])]
          : ['-lc', [configuracao.comando, ...(configuracao.argumentos || [])].join(' ')];
      // Injetar a porta indicada no painel como variável de ambiente
      // Cobre tanto convenção em inglês (PORT) quanto em português (PORTA)
      // ex: Pernambutech usa process.env.PORTA, Next.js/Nest padrão usa PORT
      const env = {
        ...(configuracao.variaveisAmbiente || {}),
        ...(configuracao.porta
          ? {
              PORT: String(configuracao.porta),
              PORTA: String(configuracao.porta),
              APP_PORT: String(configuracao.porta),
            }
          : {}),
      };
      const processo = await this.executar<ProcessoPm2>((concluir) => {
        pm2.start(
          {
            name: nome,
            script: shell,
            args: argumentosShell,
            cwd: configuracao.diretorio,
            env,
            autorestart: true,
            max_restarts: configuracao.maxReinicios,
            restart_delay: configuracao.restartDelay,
          },
          concluir,
        );
      });

      return {
        sucesso: true,
        processoId: configuracao.id,
        pid: processo?.pid,
        dados: { nomePm2: nome },
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

  async obterStatus(id: string): Promise<StatusProcesso> {
    await this.inicializar();
    const processos = await this.descrever(id);
    const processo = processos[0];
    if (!processo) {
      return { processoId: id, nome: id, status: 'desconhecido', reinicios: 0 };
    }
    return this.mapearStatus(id, processo);
  }

  async obterTodosStatus(): Promise<StatusProcesso[]> {
    await this.inicializar();
    const processos = await this.executar<ProcessoPm2[]>((concluir) => pm2.list(concluir));
    return (processos || []).map((processo) =>
      this.mapearStatus(processo.name || String(processo.pm_id), processo),
    );
  }

  async obterLogs(id: string, opcoes: OpcoesLogs = {}): Promise<LogProcesso[]> {
    await this.inicializar();
    const processo = (await this.descrever(id))[0];
    if (!processo?.pm2_env) return [];

    const linhas = opcoes.linhas || 100;
    const entradas: LogProcesso[] = [];
    const arquivos =
      opcoes.tipo === 'stderr'
        ? [['stderr', processo.pm2_env.pm_err_log_path]]
        : opcoes.tipo === 'stdout'
          ? [['stdout', processo.pm2_env.pm_out_log_path]]
          : [
              ['stdout', processo.pm2_env.pm_out_log_path],
              ['stderr', processo.pm2_env.pm_err_log_path],
            ];

    for (const [fonte, caminho] of arquivos) {
      if (!caminho) continue;
      try {
        const conteudo = await fs.readFile(caminho, 'utf8');
        for (const mensagem of conteudo.split(/\r?\n/).filter(Boolean).slice(-linhas)) {
          entradas.push({
            timestamp: new Date().toISOString(),
            nivel: fonte === 'stderr' ? 'error' : 'info',
            mensagem,
            fonte: fonte as 'stdout' | 'stderr',
          });
        }
      } catch {
        // O arquivo pode ainda não existir para um processo recém-iniciado.
      }
    }

    return entradas.slice(-linhas);
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

  private async descrever(id: string): Promise<ProcessoPm2[]> {
    return (await this.executar<ProcessoPm2[]>((concluir) => pm2.describe(id, concluir))) || [];
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
    const status =
      ambiente?.status === 'online'
        ? 'online'
        : ambiente?.status === 'stopped'
          ? 'offline'
          : ambiente?.status === 'errored'
            ? 'erro'
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
