// Serviço de comandos
// Gerencia envio de comandos ao agente com timeout e resultado

import { Injectable, Logger, GatewayTimeoutException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ComunicacaoGateway } from '../comunicacao/comunicacao.gateway';
import { v4 as uuidv4 } from 'uuid';

// ===========================================
// TIPOS DE COMANDOS SUPORTADOS
// ===========================================

export type TipoComando =
  | 'OBTER_INFORMACOES_SISTEMA'
  | 'OBTER_STATUS'
  | 'LISTAR_SERVICOS'
  | 'LISTAR_PORTAS'
  | 'EXECUTAR_COMANDO'
  | 'INICIAR_SERVICO'
  | 'PARAR_SERVICO'
  | 'REINICIAR_SERVICO'
  | 'OBTER_STATUS_SERVICO'
  | 'OBTER_LOGS_SERVICO'
  | 'OBTER_TODOS_PROCESSOS'
  | 'GIT_STATUS'
  | 'GIT_BRANCH'
  | 'GIT_PULL';

// ===========================================
// STATUS DO COMANDO
// ===========================================

export type StatusComando = 'pendente' | 'enviado' | 'processando' | 'concluido' | 'falhou' | 'expirado';

// ===========================================
// INTERFACE DO COMANDO
// ===========================================

export interface Comando {
  id: string;
  agenteId: string;
  tipo: TipoComando;
  dados?: Record<string, unknown>;
  status: StatusComando;
  resultado?: Record<string, unknown>;
  erro?: string;
  criadoEm: Date;
  enviadoEm?: Date;
  finalizadoEm?: Date;
}

// ===========================================
// INTERFACE DA REQUISIÇÃO DE COMANDO
// ===========================================

export interface EnviarComandoDto {
  agenteId: string;
  tipo: TipoComando;
  dados?: Record<string, unknown>;
  timeoutMs?: number;
}

// ===========================================
// SERVIÇO
// ===========================================

@Injectable()
export class ComandosServico {
  private readonly logger = new Logger(ComandosServico.name);

  // Comandos pendentes (comandoId → dados)
  private comandosPendentes = new Map<string, Comando>();

  // Timeout padrão: 30 segundos
  private readonly TIMEOUT_PADRAO_MS = 30000;

  // Mapa de promessas para aguardar resultado
  private aguardandoResultado = new Map<string, {
    resolve: (comando: Comando) => void;
    reject: (erro: Error) => void;
    timer: NodeJS.Timeout;
  }>();

  constructor(
    @Inject(forwardRef(() => ComunicacaoGateway))
    private comunicacaoGateway: ComunicacaoGateway,
  ) {}

  // ===========================================
  // ENVIAR COMANDO
  // ===========================================

  async enviarComando(dto: EnviarComandoDto): Promise<Comando> {
    // Verificar se o agente está conectado
    if (!this.comunicacaoGateway.agenteConectado(dto.agenteId)) {
      throw new NotFoundException('Agente não está conectado');
    }

    // Criar registro do comando
    const comando: Comando = {
      id: uuidv4(),
      agenteId: dto.agenteId,
      tipo: dto.tipo,
      dados: dto.dados,
      status: 'pendente',
      criadoEm: new Date(),
    };

    this.comandosPendentes.set(comando.id, comando);

    // Enviar comando via WebSocket
    const enviado = await this.comunicacaoGateway.enviarComando(dto.agenteId, {
      id: comando.id,
      tipo: dto.tipo,
      dados: dto.dados,
    });

    if (!enviado) {
      comando.status = 'falhou';
      comando.erro = 'Falha ao enviar comando via WebSocket';
      comando.finalizadoEm = new Date();
      throw new Error('Falha ao enviar comando');
    }

    // Atualizar status
    comando.status = 'enviado';
    comando.enviadoEm = new Date();

    this.logger.log(`Comando enviado: ${comando.tipo} (${comando.id}) → agente ${dto.agenteId}`);

    return comando;
  }

  // ===========================================
  // ENVIAR COMANDO E AGUARDAR RESULTADO
  // ===========================================

  async enviarEAguardar(dto: EnviarComandoDto): Promise<Comando> {
    const timeoutMs = dto.timeoutMs || this.TIMEOUT_PADRAO_MS;

    // Enviar comando
    const comando = await this.enviarComando(dto);

    // Criar promessa com timeout
    return new Promise<Comando>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Timeout: marcar como expirado
        comando.status = 'expirado';
        comando.erro = `Comando expirou após ${timeoutMs}ms`;
        comando.finalizadoEm = new Date();
        this.aguardandoResultado.delete(comando.id);
        this.logger.warn(`Comando expirado: ${comando.id}`);
        reject(new GatewayTimeoutException(`Comando expirou após ${timeoutMs}ms`));
      }, timeoutMs);

      this.aguardandoResultado.set(comando.id, {
        resolve: (c) => {
          clearTimeout(timer);
          resolve(c);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
        timer,
      });
    });
  }

  // ===========================================
  // PROCESSAR RESPOSTA DO AGENTE
  // ===========================================

  processarResposta(dados: {
    comandoId: string;
    status: string;
    dados?: Record<string, unknown>;
    erro?: string;
  }): void {
    const comando = this.comandosPendentes.get(dados.comandoId);
    if (!comando) {
      this.logger.warn(`Resposta para comando desconhecido: ${dados.comandoId}`);
      return;
    }

    // Atualizar comando
    if (dados.status === 'sucesso') {
      comando.status = 'concluido';
      comando.resultado = dados.dados;
    } else {
      comando.status = 'falhou';
      comando.erro = dados.erro || 'Erro desconhecido';
    }
    comando.finalizadoEm = new Date();

    this.logger.log(`Comando finalizado: ${comando.tipo} (${comando.id}) → ${comando.status}`);

    // Resolver promessa pendente se existir
    const pendencia = this.aguardandoResultado.get(dados.comandoId);
    if (pendencia) {
      this.aguardandoResultado.delete(dados.comandoId);
      pendencia.resolve(comando);
    }
  }

  // ===========================================
  // CONSULTAR STATUS DO COMANDO
  // ===========================================

  obterComando(comandoId: string): Comando | null {
    return this.comandosPendentes.get(comandoId) || null;
  }

  // ===========================================
  // LISTAR COMANDOS DE UM AGENTE
  // ===========================================

  listarPorAgente(agenteId: string): Comando[] {
    return Array.from(this.comandosPendentes.values())
      .filter((c) => c.agenteId === agenteId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  }

  // ===========================================
  // LIMPAR COMANDOS ANTIGOS
  // ===========================================

  limparAntigos(maxIdadeMs: number = 3600000): number {
    const agora = new Date();
    let removidos = 0;

    for (const [id, comando] of this.comandosPendentes) {
      const idade = agora.getTime() - comando.criadoEm.getTime();
      if (idade > maxIdadeMs) {
        this.comandosPendentes.delete(id);
        removidos++;
      }
    }

    return removidos;
  }
}
