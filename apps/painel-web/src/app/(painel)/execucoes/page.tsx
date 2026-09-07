// Página de execuções
// Tabela de ações executadas com Tipo, Projeto, Serviço, Ambiente, Status, Início, Duração

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { execucoesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { ACAO_LABELS } from '@/lib/constantes';
import type { Execucao } from '@/types';

export default function ExecucoesPage() {
  const { organizacao } = useAuth();
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados = await execucoesApi.listarPorOrganizacao(organizacao.id, 50);
      setExecucoes(dados.dados || []);
    } catch {
      setErro('Erro ao carregar execuções.');
    } finally {
      setCarregando(false);
    }
  }, [organizacao]);

  useEffect(() => {
    if (organizacao) carregar();
  }, [organizacao, carregar]);

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Execuções</h1>
        <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Acompanhe ações em tempo real.</p>
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
    </div>
  );
}
