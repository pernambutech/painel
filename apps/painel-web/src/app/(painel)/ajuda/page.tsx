// Página de Ajuda — Guia rápido de uso do Painel

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  BookOpen,
  Monitor,
  FolderKanban,
  Play,
  FileText,
  ChevronRight,
  Server,
  Terminal,
} from 'lucide-react';

const passos = [
  {
    numero: 1,
    titulo: 'Criar um ambiente',
    descricao: 'Representa uma máquina ou servidor onde seus projetos rodam.',
    icone: Monitor,
    href: '/ambientes/novo',
    cor: 'text-[#8ca2ff]',
    detalhes: [
      'Dê um nome descritivo (ex: "Meu Notebook", "VPS Produção")',
      'Selecione o tipo: local, desenvolvimento ou produção',
      'Selecione o sistema operacional',
    ],
  },
  {
    numero: 2,
    titulo: 'Conectar o agente',
    descricao: 'Instale e configure o agente na máquina para que o painel possa gerenciar.',
    icone: Server,
    href: '/ambientes',
    cor: 'text-amber-400',
    detalhes: [
      'Gere um token na página do ambiente',
      'Instale o agente na máquina alvo',
      'Configure o token e a URL da API',
      'O agente deve aparecer como "Conectado" no painel',
    ],
  },
  {
    numero: 3,
    titulo: 'Criar um projeto',
    descricao: 'Agrupe os serviços de uma aplicação (frontend, backend, worker, etc).',
    icone: FolderKanban,
    href: '/projetos/novo',
    cor: 'text-emerald-400',
    detalhes: [
      'Dê um nome ao projeto',
      'Adicione uma descrição opcional',
      'Cada projeto pode ter vários serviços',
    ],
  },
  {
    numero: 4,
    titulo: 'Adicionar serviços',
    descricao: 'Cadastre cada aplicação do projeto (frontend, backend, API, bot, etc).',
    icone: Terminal,
    href: '/projetos',
    cor: 'text-purple-400',
    detalhes: [
      'Defina o nome e tipo do serviço',
      'Configure o diretório do projeto na máquina',
      'Configure o comando de inicialização (ex: npm run dev)',
      'Defina a porta (se aplicável)',
      'Associe ao ambiente onde o agente está rodando',
    ],
  },
  {
    numero: 5,
    titulo: 'Iniciar e monitorar',
    descricao: 'Use o painel para iniciar, parar e monitorar seus serviços.',
    icone: Play,
    href: '/projetos',
    cor: 'text-rose-400',
    detalhes: [
      'Clique no botão ▶ para iniciar um serviço',
      'O status aparece em tempo real (online/parado/erro)',
      'Visualize logs em tempo real na aba de logs',
      'Verifique o histórico de ações executadas',
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-[800px] space-y-8">
      {/* Cabeçalho */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-[#8ca2ff]" />
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">
            Guia rápido de uso
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          Siga estes passos para começar a gerenciar seus projetos e serviços pelo painel.
        </p>
      </header>

      {/* Passos */}
      <div className="space-y-4">
        {passos.map((passo) => {
          const Icone = passo.icone;
          return (
            <Card key={passo.numero}>
              <div className="flex gap-4">
                {/* Número do passo */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e1e24]">
                  <span className="text-sm font-bold text-[#8ca2ff]">{passo.numero}</span>
                </div>

                {/* Conteúdo */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icone className={`h-4 w-4 ${passo.cor}`} />
                    <h3 className="font-medium text-zinc-100">{passo.titulo}</h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{passo.descricao}</p>

                  <ul className="mt-3 space-y-1.5">
                    {passo.detalhes.map((detalhe, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-500">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                        {detalhe}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={passo.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#8ca2ff] hover:text-white transition-colors"
                  >
                    Ir para esta seção →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dicas */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-amber-400" />
          <h3 className="font-medium text-zinc-100">Dicas importantes</h3>
        </div>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Cada <strong className="text-zinc-200">ambiente</strong> representa uma máquina física ou virtual. Vários projetos podem rodar no mesmo ambiente.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            O <strong className="text-zinc-200">agente</strong> deve estar online para que o painel possa executar ações nos serviços.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Para cadastrar um serviço, preencha o <strong className="text-zinc-200">diretório</strong> completo onde o código está na máquina (ex: C:\Projetos\meu-app\backend).
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            O <strong className="text-zinc-200">comando</strong> deve ser o mesmo que você usaria no terminal (ex: npm run dev, npm start, python main.py).
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            Use a página de <strong className="text-zinc-200">logs</strong> para acompanhar a saída dos serviços em tempo real.
          </li>
        </ul>
      </Card>
    </div>
  );
}
