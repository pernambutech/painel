// Página de Ajuda — Guia completo de uso do Painel

'use client';

import { useState } from 'react';
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
  Zap,
  Database,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ===========================================
// PASSOS RÁPIDOS
// ===========================================

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

// ===========================================
// CONCEITOS IMPORTANTES
// ===========================================

const conceitos = [
  {
    titulo: 'Organização',
    descricao: 'Empresa, equipe ou grupo que agrupa todos os recursos. Tudo o que você cria pertence a uma organização.',
    icone: Database,
    cor: 'text-[#8ca2ff]',
  },
  {
    titulo: 'Ambiente',
    descricao: 'Uma máquina ou servidor onde seus projetos rodam. Pode ser seu notebook, um VPS, um servidor de produção, etc.',
    icone: Monitor,
    cor: 'text-emerald-400',
  },
  {
    titulo: 'Agente',
    descricao: 'Software instalado no ambiente que permite ao painel executar comandos remotamente. Comunica-se via WebSocket.',
    icone: Zap,
    cor: 'text-amber-400',
  },
  {
    titulo: 'Projeto',
    descricao: 'Agrupamento lógico de serviços. Exemplo: "Sistema de Chamados" pode ter frontend + backend + worker.',
    icone: FolderKanban,
    cor: 'text-purple-400',
  },
  {
    titulo: 'Serviço',
    descricao: 'Uma aplicação ou processo executável. Pode ser um frontend React, um backend Node.js, um bot, etc.',
    icone: Server,
    cor: 'text-rose-400',
  },
  {
    titulo: 'PM2',
    descricao: 'Gerenciador de processos que mantém suas aplicações rodando, reinicia em caso de erro e gerencia múltiplos processos.',
    icone: Terminal,
    cor: 'text-cyan-400',
  },
];

// ===========================================
// PERGUNTAS FREQUENTES
// ===========================================

const perguntas = [
  {
    pergunta: 'O que é necessário para começar?',
    resposta: 'Você precisa de: 1) Uma conta no painel, 2) Uma máquina com Node.js instalado, 3) O agente rodando na máquina. A partir disso, crie ambientes, projetos e serviços.',
  },
  {
    pergunta: 'Quantos projetos e serviços posso criar?',
    resposta: 'Não há limite. Crie quantos projetos e serviços precisar. Cada projeto pode ter múltiplos serviços, e cada serviço pode rodar em um ambiente diferente.',
  },
  {
    pergunta: 'O que acontece se o agente ficar offline?',
    resposta: 'Você não conseguirá executar ações nos serviços daquele ambiente (iniciar, parar, reiniciar). Os dados permanecem salvos. Basta reconectar o agente para retomar o controle.',
  },
  {
    pergunta: 'Posso ter o mesmo serviço em ambientes diferentes?',
    resposta: 'Sim! É comum ter um serviço em ambiente de desenvolvimento e outro em produção. Crie o serviço em cada ambiente com suas configurações específicas.',
  },
  {
    pergunta: 'Como atualizo o código do meu projeto?',
    resposta: 'Use o modal Git dentro do projeto: 1) Clique no serviço, 2) Clique em "Git", 3) Clique em "Pull". O código será atualizado automaticamente.',
  },
  {
    pergunta: 'O que fazer quando um serviço fica com erro?',
    resposta: 'Verifique os logs (clique em "Logs" no serviço). Geralmente o erro está no comando de inicialização, diretório incorreto ou porta em uso. Corrija e reinicie.',
  },
  {
    pergunta: 'Posso gerenciar serviços de múltiplas máquinas?',
    resposta: 'Sim! Crie um ambiente para cada máquina, conecte um agente em cada uma, e gerencie tudo por um único painel.',
  },
  {
    pergunta: 'O que é "Salvar PM2"?',
    resposta: 'Salva a lista atual de processos do PM2. Isso faz com que os processos sejam automaticamente reiniciados quando a máquina reiniciar. Use depois de iniciar todos os serviços.',
  },
  {
    pergunta: 'Como funciona a segurança?',
    resposta: 'O agente apenas aceita comandos pré-definidos (whitelist). Você pode restringir quais diretórios o agente acessa. Comandos perigosos são bloqueados automaticamente.',
  },
  {
    pergunta: 'Posso usar com Python, Go ou outras linguagens?',
    resposta: 'Sim! O tipo "Personalizado" aceita qualquer comando. Configure o diretório e o comando correto (ex: python main.py, go run main.go).',
  },
];

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================

export default function AjudaPage() {
  const [perguntaAberta, setPerguntaAberta] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ========================================= */}
      {/* CABEÇALHO */}
      {/* ========================================= */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-[#8ca2ff]" />
          <h1 className="text-2xl font-bold text-zinc-100">
            Guia de uso do Painel
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          Aprenda a usar a plataforma de gerenciamento centralizado de projetos e serviços.
        </p>
      </header>

      {/* ========================================= */}
      {/* PASSOS RÁPIDOS */}
      {/* ========================================= */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Primeiros passos</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Siga estes 5 passos para começar a gerenciar seus projetos.
        </p>

        <div className="space-y-4">
          {passos.map((passo) => {
            const Icone = passo.icone;
            return (
              <Card key={passo.numero}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e1e24]">
                    <span className="text-sm font-bold text-[#8ca2ff]">{passo.numero}</span>
                  </div>

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
      </section>

      {/* ========================================= */}
      {/* DICAS IMPORTANTES */}
      {/* ========================================= */}
      <section>
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
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              Use a página de <strong className="text-zinc-200">serviços</strong> (/servicos) para ver e controlar todos os serviços de uma vez.
            </li>
          </ul>
        </Card>
      </section>

      {/* ========================================= */}
      {/* CONCEITOS IMPORTANTES */}
      {/* ========================================= */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Conceitos importantes</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Entenda as principais entidades do sistema antes de começar.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {conceitos.map((conceito) => {
            const Icone = conceito.icone;
            return (
              <Card key={conceito.titulo}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1e1e24]">
                    <Icone className={`h-4 w-4 ${conceito.cor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-100 text-sm">{conceito.titulo}</h3>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{conceito.descricao}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Diagrama de relação */}
        <Card className="mt-4">
          <h3 className="font-medium text-zinc-100 text-sm mb-3">Como se relacionam</h3>
          <div className="rounded-lg bg-[#0d0d0f] p-4 font-mono text-xs text-zinc-400 space-y-1">
            <p><span className="text-[#8ca2ff]">Organização</span></p>
            <p className="pl-4">├── <span className="text-emerald-400">Ambiente</span> (máquina)</p>
            <p className="pl-8">└── <span className="text-amber-400">Agente</span> (conectado)</p>
            <p className="pl-4">├── <span className="text-purple-400">Projeto</span></p>
            <p className="pl-8">├── <span className="text-rose-400">Serviço</span> (Frontend)</p>
            <p className="pl-8">├── <span className="text-rose-400">Serviço</span> (Backend)</p>
            <p className="pl-8">└── <span className="text-rose-400">Serviço</span> (Worker)</p>
          </div>
        </Card>
      </section>

      {/* ========================================= */}
      {/* PERGUNTAS FREQUENTES */}
      {/* ========================================= */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-[#8ca2ff]" />
          <h2 className="text-lg font-semibold text-zinc-100">Perguntas frequentes</h2>
        </div>

        <div className="space-y-2">
          {perguntas.map((item, idx) => (
            <Card key={idx} padding="nenhum">
              <button
                type="button"
                onClick={() => setPerguntaAberta(perguntaAberta === idx ? null : idx)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-zinc-200">{item.pergunta}</span>
                {perguntaAberta === idx ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </button>
              {perguntaAberta === idx && (
                <div className="border-t border-[#2a2a32] px-4 py-3">
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.resposta}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================= */}
      {/* GUIA COMPLETO */}
      {/* ========================================= */}
      <section id="guia-completo">
        <Card className="border-[#5b7cfa]/30 bg-[#5b7cfa]/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5b7cfa]/20">
              <BookOpen className="h-5 w-5 text-[#8ca2ff]" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-100">Guia completo de uso</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Documento detalhado com todas as funcionalidades, fluxos de trabalho exemplos,
                solução de problemas e glossário completo.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                <li>• Dashboard, Projetos, Serviços, Ambientes</li>
                <li>• Logs, Git, Histórico, Configurações</li>
                <li>• Segurança e Diretórios Autorizados</li>
                <li>• Fluxos de trabalho para freelancers e equipes</li>
                <li>• Solução de problemas (FAQ técnico)</li>
              </ul>
              <p className="mt-3 text-xs text-zinc-600">
                Arquivo: <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-400">docs/02 - GUIA DE USO DO PAINEL.md</code>
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
