// Página de listagem de projetos

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi } from '@/lib/api';
import { StatusBadgeTabela } from '@/components/ui/StatusBadgeTabela';
import { Spinner } from '@/components/ui/Spinner';
import { FolderKanban } from 'lucide-react';
import type { Projeto } from '@/types';

export default function ProjetosPage() {
  const { organizacao } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarProjetos();
  }, [organizacao, mostrarArquivados]);

  const carregarProjetos = async () => {
    if (!organizacao) return;

    try {
      setCarregando(true);
      const dados = await projetosApi.listar(organizacao.id, mostrarArquivados);
      setProjetos(dados || []);
    } catch {
      setErro('Erro ao carregar projetos.');
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const projetosFiltrados = useMemo(() => {
    if (!busca.trim()) return projetos;
    const termo = busca.toLowerCase();
    return projetos.filter((p) =>
      p.nome.toLowerCase().includes(termo) ||
      (p.descricao && p.descricao.toLowerCase().includes(termo))
    );
  }, [projetos, busca]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm" style={{ color: '#6e6e7a' }}>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Projetos</h1>
        <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Gerencie todos os seus projetos e serviços.</p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20" style={{ marginBottom: '16px' }}>
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Barra de busca + botão novo */}
      <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar projeto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 rounded-full border border-[#2a2a32] bg-[#16161a] px-5 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-[#5b7cfa]"
          style={{ minWidth: '180px' }}
        />
        <Link
          href="/projetos/novo"
          className="shrink-0 rounded-full bg-[#5b7cfa] px-6 py-2 text-sm font-medium text-white hover:bg-[#6f8cff] transition-colors"
        >
          + Novo Projeto
        </Link>
      </div>

      {/* Toggle arquivados */}
      <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setMostrarArquivados((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            borderColor: mostrarArquivados ? '#5b7cfa' : '#2a2a32',
            background: mostrarArquivados ? 'rgba(91,124,250,0.1)' : 'transparent',
            color: mostrarArquivados ? '#8ca2ff' : '#6e6e7a',
          }}
        >
          {mostrarArquivados ? 'Ocultando arquivados' : 'Mostrar arquivados'}
        </button>
      </div>

      {/* Tabela de projetos */}
      <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] overflow-x-auto">
        {projetos.length === 0 && !erro ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <FolderKanban className="mb-3 h-8 w-8" style={{ color: '#3a3a44' }} />
            <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum projeto cadastrado.</p>
            <Link href="/projetos/novo" className="mt-2 text-xs font-medium" style={{ color: '#5b7cfa' }}>
              Criar projeto
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[700px] border-collapse text-left" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e1e24', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#6e6e7a' }}>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Projeto</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Descrição</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Serviços</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Ambiente</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Status</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {projetosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '40px 18px', color: '#6e6e7a' }}>
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              ) : (
                projetosFiltrados.map((projeto) => (
                  <tr
                    key={projeto.id}
                    className="border-b border-[#2a2a32] transition-colors"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#28282f'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a32' }}>
                      <Link
                        href={`/projetos/${projeto.id}`}
                        className="font-medium transition-colors"
                        style={{ color: '#ececf0' }}
                      >
                        {projeto.nome}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                      {projeto.descricao || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                      {projeto.totalServicos ?? 0}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>
                      —
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a32' }}>
                      <StatusBadgeTabela variante={projeto.ativo ? 'online' : 'atencao'}>
                        {projeto.ativo ? 'Ativo' : 'Arquivado'}
                      </StatusBadgeTabela>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6e6e7a', borderBottom: '1px solid #2a2a32' }}>
                      {formatarData(projeto.atualizadoEm || projeto.criadoEm)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
