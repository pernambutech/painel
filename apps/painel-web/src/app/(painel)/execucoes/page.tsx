// Página de execuções
// Tabela de ações executadas com Tipo, Projeto, Serviço, Ambiente, Status, Início, Duração

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { execucoesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { ACAO_LABELS } from '@/lib/constantes';
import type { Execucao } from '@/types';

const ITENS_POR_PAGINA_OPCOES = [10, 25, 50, 100];

export default function ExecucoesPage() {
  const { organizacao } = useAuth();
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const carregar = useCallback(async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados = await execucoesApi.listarPorOrganizacao(organizacao.id, itensPorPagina, pagina);
      setExecucoes(dados.dados || []);
      setTotalItens(dados.total || 0);
      setTotalPaginas(dados.paginas || 0);
    } catch {
      setErro('Erro ao carregar execuções.');
    } finally {
      setCarregando(false);
    }
  }, [organizacao, pagina, itensPorPagina]);

  useEffect(() => {
    if (organizacao) carregar();
  }, [organizacao, carregar]);

  // Resetar para página 1 ao mudar itens por página
  useEffect(() => {
    setPagina(1);
  }, [itensPorPagina]);

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calcularDuracao = (exec: Execucao) => {
    if (exec.status === 'pendente') return '—';
    const inicio = new Date(exec.criadoEm).getTime();
    const fim = new Date(exec.atualizadoEm).getTime();
    const segundos = Math.floor((fim - inicio) / 1000);
    if (segundos < 1) return '<1s';
    if (segundos < 60) return `${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    const segResto = segundos % 60;
    return `${minutos}m ${segResto}s`;
  };

  const corStatus = (status: string) => {
    switch (status) {
      case 'sucesso': return '#3dd68c';
      case 'falhou': return '#f87171';
      case 'pendente': return '#fbbf24';
      default: return '#6e6e7a';
    }
  };

  const labelStatus = (status: string) => {
    switch (status) {
      case 'sucesso': return 'SUCESSO';
      case 'falhou': return 'FALHOU';
      case 'pendente': return 'EM EXECUÇÃO';
      default: return status.toUpperCase();
    }
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Execuções</h1>
          <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Acompanhe ações em tempo real.</p>
        </div>
        {/* Seletor de itens por página */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#6e6e7a' }}>Itens por página:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => setItensPorPagina(Number(e.target.value))}
            className="rounded-md border border-[#2a2a32] bg-[#1e1e24] px-2 py-1 text-xs text-zinc-300 focus:outline-none"
          >
            {ITENS_POR_PAGINA_OPCOES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20" style={{ marginBottom: '16px' }}>
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] overflow-x-auto">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Spinner tamanho="medio" />
          </div>
        ) : execucoes.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhuma execução registrada.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse text-left" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e1e24', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#6e6e7a' }}>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Tipo</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Projeto</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Serviço</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Ambiente</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Status</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Início</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Duração</th>
              </tr>
            </thead>
            <tbody>
              {execucoes.map((exec) => (
                <tr
                  key={exec.id}
                  className="border-b border-[#2a2a32] transition-colors"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#28282f'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <td style={{ padding: '14px 18px', color: '#ececf0', borderBottom: '1px solid #2a2a32', fontFamily: 'monospace', fontSize: '12px' }}>
                    {ACAO_LABELS[exec.acao] || exec.acao}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                    {exec.projeto?.nome || '—'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                    {exec.servico?.nome || '—'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                    {exec.ambiente?.nome || '—'}
                  </td>
                  <td style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a32' }}>
                    <span style={{ color: corStatus(exec.status), fontWeight: 500 }}>
                      {labelStatus(exec.status)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#6e6e7a', borderBottom: '1px solid #2a2a32' }}>
                    {formatarHora(exec.criadoEm)}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#6e6e7a', borderBottom: '1px solid #2a2a32' }}>
                    {calcularDuracao(exec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {!carregando && totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-xs" style={{ color: '#6e6e7a' }}>
            {totalItens} execução(ões) — Página {pagina} de {totalPaginas}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina(1)}
              disabled={pagina === 1}
              className="px-2 py-1 text-xs rounded border border-[#2a2a32] text-zinc-400 hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-2 py-1 text-xs rounded border border-[#2a2a32] text-zinc-400 hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              let numPagina: number;
              if (totalPaginas <= 5) {
                numPagina = i + 1;
              } else if (pagina <= 3) {
                numPagina = i + 1;
              } else if (pagina >= totalPaginas - 2) {
                numPagina = totalPaginas - 4 + i;
              } else {
                numPagina = pagina - 2 + i;
              }
              return (
                <button
                  key={numPagina}
                  onClick={() => setPagina(numPagina)}
                  className="px-2 py-1 text-xs rounded border text-zinc-400 hover:bg-[#1e1e24]"
                  style={{
                    borderColor: numPagina === pagina ? '#5b7cfa' : '#2a2a32',
                    color: numPagina === pagina ? '#5b7cfa' : undefined,
                    background: numPagina === pagina ? '#5b7cfa10' : undefined,
                  }}
                >
                  {numPagina}
                </button>
              );
            })}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-2 py-1 text-xs rounded border border-[#2a2a32] text-zinc-400 hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setPagina(totalPaginas)}
              disabled={pagina === totalPaginas}
              className="px-2 py-1 text-xs rounded border border-[#2a2a32] text-zinc-400 hover:bg-[#1e1e24] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
