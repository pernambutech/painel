// Página de histórico
// Lista simples de eventos: hora + descrição

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { execucoesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { ACAO_LABELS } from '@/lib/constantes';
import type { Execucao } from '@/types';

const ITENS_POR_PAGINA_OPCOES = [10, 25, 50, 100];

export default function HistoricoPage() {
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
      setErro('Erro ao carregar histórico.');
    } finally {
      setCarregando(false);
    }
  }, [organizacao, pagina, itensPorPagina]);

  useEffect(() => {
    if (organizacao) carregar();
  }, [organizacao, carregar]);

  useEffect(() => {
    setPagina(1);
  }, [itensPorPagina]);

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const montarDescricao = (exec: Execucao) => {
    const nomeUsuario = exec.usuario?.nome || 'Sistema';
    const nomeServico = exec.servico?.nome;
    const nomeProjeto = exec.projeto?.nome;
    const labelAcao = ACAO_LABELS[exec.acao] || exec.acao.toLowerCase().replace(/_/g, ' ');

    let partes: string[] = [];

    if (exec.status === 'sucesso') {
      if (nomeServico && nomeProjeto) {
        partes = [labelAcao, nomeServico, `(${nomeProjeto})`];
      } else if (nomeServico) {
        partes = [labelAcao, nomeServico];
      } else if (nomeProjeto) {
        partes = [labelAcao, nomeProjeto];
      } else {
        partes = [labelAcao];
      }
    } else if (exec.status === 'falhou') {
      if (nomeServico && nomeProjeto) {
        partes = [nomeServico, 'apresentou erro', `(${nomeProjeto})`];
      } else {
        partes = [labelAcao, 'falhou'];
      }
    } else {
      partes = [labelAcao];
    }

    return { nomeUsuario, partes };
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Histórico</h1>
          <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Linha do tempo de eventos.</p>
        </div>
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

      {/* Lista */}
      <div className="rounded-xl border border-[#2a2a32] bg-[#16161a]" style={{ padding: '16px' }}>
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Spinner tamanho="medio" />
          </div>
        ) : execucoes.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum evento registrado.</p>
          </div>
        ) : (
          <div>
            {execucoes.map((exec, index) => {
              const { nomeUsuario, partes } = montarDescricao(exec);
              const ehUltimo = index === execucoes.length - 1;

              return (
                <div
                  key={exec.id}
                  className="flex items-center"
                  style={{
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: ehUltimo ? 'none' : '1px solid #2a2a32',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: '#6e6e7a', fontSize: '12px', width: '120px', flexShrink: 0 }}>
                    {formatarHora(exec.criadoEm)}
                  </span>
                  <span style={{ color: '#a8a8b3' }}>
                    <strong style={{ color: '#ececf0', fontWeight: 500 }}>{nomeUsuario}</strong>
                    {' '}
                    {partes.map((parte, i) => {
                      const ehNome = i === 1 && partes.length > 1 && !parte.startsWith('(') && !parte.startsWith('apresentou') && !parte.startsWith('falhou');
                      const ehProjeto = parte.startsWith('(');
                      if (ehNome || (i === 2 && ehProjeto)) {
                        return <strong key={i} style={{ color: '#ececf0', fontWeight: 500 }}>{parte} </strong>;
                      }
                      return <span key={i}>{parte} </span>;
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginação */}
      {!carregando && totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-xs" style={{ color: '#6e6e7a' }}>
            {totalItens} evento(s) — Página {pagina} de {totalPaginas}
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
