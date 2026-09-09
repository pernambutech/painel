// Página de listagem de ambientes
// Cards no estilo da referência HTML: Nome + Status | SO · Versão | Último contato | Badges

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Plus } from 'lucide-react';
import type { Ambiente } from '@/types';

export default function AmbientesPage() {
  const { organizacao } = useAuth();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarAmbientes();
  }, [organizacao]);

  const carregarAmbientes = async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados = await ambientesApi.listar(organizacao.id);
      setAmbientes(dados || []);
    } catch {
      setErro('Erro ao carregar ambientes.');
    } finally {
      setCarregando(false);
    }
  };

  const obterTempoHeartbeat = (agente: Ambiente['agente']) => {
    if (!agente?.ultimoHeartbeat) return null;
    const agora = new Date();
    const heartbeat = new Date(agente.ultimoHeartbeat);
    const diferencaSegundos = Math.floor((agora.getTime() - heartbeat.getTime()) / 1000);

    if (diferencaSegundos < 60) return `Há ${diferencaSegundos}s`;
    if (diferencaSegundos < 3600) return `Há ${Math.floor(diferencaSegundos / 60)}min`;
    return `Há ${Math.floor(diferencaSegundos / 3600)}h`;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm" style={{ color: '#6e6e7a' }}>Carregando ambientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Ambientes</h1>
          <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Máquinas, servidores e agentes.</p>
        </div>
        <Link
          href="/ambientes/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#5b7cfa' }}
        >
          <Plus className="h-4 w-4" />
          Novo Ambiente
        </Link>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20" style={{ marginBottom: '16px' }}>
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Grid de ambientes */}
      {ambientes.length === 0 && !erro ? (
        <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
          <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum ambiente cadastrado.</p>
          <Link href="/ambientes/novo" className="mt-2 text-xs font-medium" style={{ color: '#5b7cfa' }}>
            Adicionar ambiente
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {ambientes.map((ambiente) => {
            const online = ambiente.agente?.status === 'online';
            const corStatus = online ? '#3dd68c' : '#f87171';
            const textoStatus = online ? 'ONLINE' : 'OFFLINE';
            const tempoContato = obterTempoHeartbeat(ambiente.agente);
            const isOffline = !online;

            return (
              <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`}>
                <div
                  className="transition-colors"
                  style={{
                    background: '#16161a',
                    border: '1px solid #2a2a32',
                    borderRadius: '12px',
                    padding: '18px',
                    opacity: isOffline ? 0.7 : 1,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a4a'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2a32'; }}
                >
                  {/* Nome + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#ececf0' }}>{ambiente.nome}</span>
                    <span style={{ color: corStatus, fontSize: '13px', fontWeight: 500 }}>
                      ● {textoStatus}
                    </span>
                  </div>

                  {/* SO · Versão */}
                  <div style={{ fontSize: '13px', color: '#a8a8b3', marginTop: '8px' }}>
                    {ambiente.sistemaOperacional}{ambiente.agente?.versao ? ` · Agente v${ambiente.agente.versao}` : ''}
                  </div>

                  {/* Último contato */}
                  {tempoContato && (
                    <div style={{ fontSize: '13px', color: '#6e6e7a', marginTop: '4px' }}>
                      Último contato: {tempoContato}
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(ambiente as any).totalProjetos !== undefined && (
                      <span style={{ background: '#1e1e24', padding: '2px 12px', borderRadius: '20px', fontSize: '12px', color: '#a8a8b3' }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(ambiente as any).totalProjetos} projetos
                      </span>
                    )}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(ambiente as any).totalServicos !== undefined && (
                      <span style={{ background: '#1e1e24', padding: '2px 12px', borderRadius: '20px', fontSize: '12px', color: '#a8a8b3' }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(ambiente as any).totalServicos} serviços
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
