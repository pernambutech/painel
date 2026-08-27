// Página global de serviços
// Lista todos os serviços da organização agrupados por projeto

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { BadgeSimples } from '@/components/ui/Badge';
import { Server, FolderKanban, Terminal, Network, HardDrive } from 'lucide-react';
import type { Servico } from '@/types';

const tipoLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  api: 'API',
  worker: 'Worker',
  bot: 'Bot',
  custom: 'Personalizado',
};

const tipoVariante: Record<string, 'info' | 'aviso' | 'neutro' | 'online'> = {
  frontend: 'info',
  backend: 'aviso',
  api: 'online',
  worker: 'neutro',
  bot: 'neutro',
  custom: 'neutro',
};

export default function ServicosPage() {
  const { organizacao } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (organizacao) carregar();
  }, [organizacao]);

  const carregar = async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados = await servicosApi.listarTodos(organizacao.id);
      setServicos(dados || []);
    } catch {
      setErro('Erro ao carregar serviços.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Serviços</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Todos os serviços cadastrados nos seus projetos
        </p>
      </div>

      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {servicos.length === 0 && !erro && (
        <Card>
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Acesse um projeto e adicione serviços para começar a gerenciar suas aplicações.
            </p>
            <Link
              href="/projetos"
              className="inline-flex mt-4 rounded-lg bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f8cff]"
            >
              Ver projetos
            </Link>
          </div>
        </Card>
      )}

      {servicos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicos.map((servico) => (
            <Card
              key={servico.id}
              className="group transition-colors hover:border-zinc-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e24]">
                    <Server className="w-5 h-5 text-[#8ca2ff]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-100 group-hover:text-white">
                      {servico.nome}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <FolderKanban className="w-3 h-3" />
                      Projeto
                    </p>
                  </div>
                </div>
                <BadgeSimples variante={tipoVariante[servico.tipo] || 'neutro'}>
                  {tipoLabels[servico.tipo] || servico.tipo}
                </BadgeSimples>
              </div>

              <div className="space-y-2 text-xs text-zinc-500">
                {servico.diretorio && (
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3 h-3 shrink-0" />
                    <span className="truncate">{servico.diretorio}</span>
                  </div>
                )}
                {servico.comando && (
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 shrink-0" />
                    <span className="truncate font-mono">{servico.comando}</span>
                  </div>
                )}
                {servico.porta && (
                  <div className="flex items-center gap-1.5">
                    <Network className="w-3 h-3 shrink-0" />
                    <span>Porta {servico.porta}</span>
                  </div>
                )}
                {servico.ambiente && (
                  <div className="flex items-center gap-1.5">
                    <span>Ambiente: {servico.ambiente.nome}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
