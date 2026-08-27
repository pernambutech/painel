// DTOs para execuções / histórico

// ===========================================
// RESPOSTA DE EXECUÇÃO
// ===========================================

export interface RespostaExecucao {
  id: string;
  organizacaoId: string;
  projetoId: string | null;
  servicoId: string;
  ambienteId: string | null;
  acao: string; // iniciar, parar, reiniciar
  status: string; // pendente, sucesso, falhou
  resultado?: Record<string, unknown> | null;
  erro?: string | null;
  usuarioId: string;
  criadoEm: Date;
  atualizadoEm: Date;
  // Dados relacionados (quando incluídos)
  usuario?: { id: string; nome: string; email: string };
  servico?: { id: string; nome: string; tipo: string };
  projeto?: { id: string; nome: string } | null;
  ambiente?: { id: string; nome: string } | null;
}
