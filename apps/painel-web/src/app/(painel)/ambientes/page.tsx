// Página de listagem de ambientes

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Monitor, Plus, Server, Wifi, WifiOff } from 'lucide-react';
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
    } catch (err) {
      setErro('Erro ao carregar ambientes.');
    } finally {
      setCarregando(false);
    }
  };

  const obterIconeSO = (so: string) => {
    switch (so.toLowerCase()) {
      case 'windows':
        return '🪟';
      case 'linux':
        return '🐧';
      case 'macos':
        return '🍎';
      default:
        return '💻';
    }
  };

  const obterVarianteAgente = (agente: Ambiente['agente']) => {
    if (!agente) return 'neutro';
    switch (agente.status) {
      case 'online':
        return 'online';
      case 'offline':
        return 'offline';
      case 'manutencao':
        return 'aviso';
      default:
        return 'neutro';
    }
  };

  const obterTextoAgente = (agente: Ambiente['agente']) => {
    if (!agente) return 'Agente não instalado';
    switch (agente.status) {
      case 'online':
        return 'Conectado';
      case 'offline':
        return 'Desconectado';
      case 'manutencao':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  };

  const obterTempoHeartbeat = (agente: Ambiente['agente']) => {
    if (!agente?.ultimoHeartbeat) return null;
    const agora = new Date();
    const heartbeat = new Date(agente.ultimoHeartbeat);
    const diferencaSegundos = Math.floor((agora.getTime() - heartbeat.getTime()) / 1000);

    if (diferencaSegundos < 60) {
      return `Há ${diferencaSegundos}s`;
    } else if (diferencaSegundos < 3600) {
      return `Há ${Math.floor(diferencaSegundos / 60)}min`;
    } else {
      return `Há ${Math.floor(diferencaSegundos / 3600)}h`;
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando ambientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Ambientes</h1>
        <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Máquinas, servidores e agentes.</p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
        <Link href="/ambientes/novo" className="rounded-full bg-[#5b7cfa] px-6 py-2 text-sm font-medium text-white hover:bg-[#6f8cff] transition-colors">
          + Novo Ambiente
        </Link>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erro}</p>
          <Button variante="fantasma" tamanho="pequeno" onClick={carregarAmbientes}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && ambientes.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhum ambiente cadastrado</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Conecte uma máquina para começar a gerenciar seus serviços.
            </p>
            <Link href="/ambientes/novo" className="inline-flex mt-4">
              <Button>
                <Plus className="w-4 h-4" />
                Adicionar ambiente
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Lista de ambientes */}
      {ambientes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ambientes.map((ambiente) => (
            <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`}>
              <Card className="group h-full cursor-pointer transition-colors hover:border-zinc-600">
                <div className="flex flex-col h-full">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e24] text-xl">{obterIconeSO(ambiente.sistemaOperacional)}</div>
                      <div>
                        <h3 className="font-medium text-zinc-100 group-hover:text-white">{ambiente.nome}</h3>
                        <p className="text-xs text-zinc-500">{ambiente.sistemaOperacional}</p>
                      </div>
                    </div>
                    <Badge variante={obterVarianteAgente(ambiente.agente)}>
                      {obterTextoAgente(ambiente.agente)}
                    </Badge>
                  </div>

                  {/* Informações do agente */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      {ambiente.agente?.status === 'online' ? (
                        <Wifi className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-zinc-500" />
                      )}
                      <span className="text-zinc-400">{obterTextoAgente(ambiente.agente)}</span>
                      {ambiente.agente?.status === 'online' &&
                        obterTempoHeartbeat(ambiente.agente) && (
                          <span className="text-zinc-600">
                            • {obterTempoHeartbeat(ambiente.agente)}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="mt-auto pt-4 border-t border-[#2a2a32]">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span>{ambiente.tipo}</span>
                      </div>
                      {ambiente.agente?.versao && <span>v{ambiente.agente.versao}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
