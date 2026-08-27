// Dashboard principal
// Página inicial do painel (após login)

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Monitor, FolderOpen, Server, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Visão Geral</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Bem-vindo(a), {usuario?.nome}. Aqui está o resumo da sua plataforma.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/ambientes">
          <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Monitor className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">0</p>
                <p className="text-xs text-zinc-500">Ambientes</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/projetos">
          <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <FolderOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">0</p>
                <p className="text-xs text-zinc-500">Projetos</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/servicos">
          <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-500/10">
                <Server className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">0</p>
                <p className="text-xs text-zinc-500">Serviços Online</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">0</p>
              <p className="text-xs text-zinc-500">Com Erro</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Estado vazio */}
      <Card>
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Bem-vindo ao Painel</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Comece adicionando um ambiente para conectar suas máquinas e gerenciar seus serviços.
          </p>
          <Link
            href="/ambientes/novo"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Adicionar primeiro ambiente
          </Link>
        </div>
      </Card>
    </div>
  );
}
