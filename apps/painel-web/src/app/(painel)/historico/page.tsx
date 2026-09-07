// Página de histórico
// Lista simples de eventos: hora + descrição

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { execucoesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { ACAO_LABELS } from '@/lib/constantes';
import type { Execucao } from '@/types';

export default function HistoricoPage() {
  const { organizacao } = useAuth();
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados = await execucoesApi.listarPorOrganizacao(organizacao.id, 30);
      setExecucoes(dados.dados || []);
    } catch {
      setErro('Erro ao carregar histórico.');
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
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Histórico</h1>
        <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Linha do tempo de eventos.</p>
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
                  <span style={{ color: '#6e6e7a', fontSize: '12px', width: '56px', flexShrink: 0 }}>
                    {formatarHora(exec.criadoEm)}
                  </span>
                  <span style={{ color: '#a8a8b3' }}>
                    <strong style={{ color: '#ececf0', fontWeight: 500 }}>{nomeUsuario}</strong>
                    {' '}
                    {partes.map((parte, i) => {
                      // Partes que são nomes (serviço, projeto) ficam em bold
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
    </div>
  );
}
