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
import { Monitor, Plus, Server } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Ambientes</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie suas máquinas e servidores</p>
        </div>
        <Link href="/ambientes/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Ambiente
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambientes.map((ambiente) => (
            <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
                <div className="flex flex-col h-full">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{obterIconeSO(ambiente.sistemaOperacional)}</div>
                      <div>
                        <h3 className="font-medium text-zinc-100">{ambiente.nome}</h3>
                        <p className="text-xs text-zinc-500">{ambiente.sistemaOperacional}</p>
                      </div>
                    </div>
                    <Badge variante="offline">Offline</Badge>
                  </div>

                  {/* Informações */}
                  <div className="mt-auto pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span>{ambiente.tipo}</span>
                      </div>
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
