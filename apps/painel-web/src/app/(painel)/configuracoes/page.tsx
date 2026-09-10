// Página de Configurações
// Abas: Conta, Organização, Preferências, Aparência, Segurança

'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, Eye, KeyRound, LockKeyhole, Palette, Save, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAparencia } from '@/lib/hooks/useAparencia';
import { autenticacaoApi, organizacoesApi } from '@/lib/api';
import { ITENS_POR_PAGINA_OPCOES } from '@/lib/constantes';

// ===========================================
// CONSTANTES
// ===========================================

const abas = [
  { chave: 'organizacao', rotulo: 'Organização', icone: Building2 },
  { chave: 'preferencias', rotulo: 'Preferências', icone: Settings },
  { chave: 'aparencia', rotulo: 'Aparência', icone: Palette },
  { chave: 'seguranca', rotulo: 'Segurança', icone: Shield },
] as const;

type AbaChave = (typeof abas)[number]['chave'];

// Cores predefinidas para escolha rápida
const coresPreDefinidas = [
  { nome: 'Azul', valor: '#5b7cfa' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Verde', valor: '#3dd68c' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Ciano', valor: '#06b6d4' },
  { nome: 'Amarelo', valor: '#eab308' },
  { nome: 'Vermelho', valor: '#ef4444' },
];

// Ícones disponíveis para o logo
import {
  Box, Code2, Cpu, Database, Globe, Hammer, Layers, Layout,
  Monitor, Rocket, Server, ShieldCheck, Terminal, Wrench, Zap
} from 'lucide-react';

const opcoesIcones = [
  { nome: 'Box', icone: Box },
  { nome: 'Code2', icone: Code2 },
  { nome: 'Cpu', icone: Cpu },
  { nome: 'Database', icone: Database },
  { nome: 'Globe', icone: Globe },
  { nome: 'Hammer', icone: Hammer },
  { nome: 'Layers', icone: Layers },
  { nome: 'Layout', icone: Layout },
  { nome: 'Monitor', icone: Monitor },
  { nome: 'Rocket', icone: Rocket },
  { nome: 'Server', icone: Server },
  { nome: 'ShieldCheck', icone: ShieldCheck },
  { nome: 'Terminal', icone: Terminal },
  { nome: 'Wrench', icone: Wrench },
  { nome: 'Zap', icone: Zap },
];

// ===========================================
// COMPONENTE
// ===========================================

export default function ConfiguracoesPage() {
  const { organizacao, recarregarOrganizacao } = useAuth();
  const { prefs, temAlteracoesPendentes, salvandoPreferencias, atualizarRascunho, confirmar, cancelar, redefinir } = useAparencia();
  const [abaAtiva, setAbaAtiva] = useState<AbaChave>('organizacao');

  // ── Estado da organização ──
  const [nomeOrganizacao, setNomeOrganizacao] = useState('');

  // ── Preferências ──
  const [itensPagina, setItensPagina] = useState('20');
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(true);

  // ── Segurança ──
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  // ── UI ──
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // ===========================================
  // EFEITOS
  // ===========================================

  useEffect(() => {
    setNomeOrganizacao(organizacao?.nome || '');
    setItensPagina(localStorage.getItem('preferencia_itens_pagina') || '20');
    setAtualizacaoAutomatica(localStorage.getItem('preferencia_atualizacao_automatica') !== 'false');
  }, [organizacao]);

  // Limpa mensagens ao trocar de aba
  useEffect(() => {
    setMensagem('');
    setErro('');
  }, [abaAtiva]);

  // ===========================================
  // FUNÇÕES
  // ===========================================

  const executar = async (acao: () => Promise<void>) => {
    try {
      setSalvando(true);
      setErro('');
      setMensagem('');
      await acao();
      setMensagem('Alterações salvas com sucesso.');
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarOrganizacao = () =>
    executar(async () => {
      if (!organizacao) return;
      await organizacoesApi.atualizar(organizacao.id, { nome: nomeOrganizacao });
      await recarregarOrganizacao();
    });

  const salvarPreferencias = () => {
    localStorage.setItem('preferencia_itens_pagina', itensPagina);
    localStorage.setItem('preferencia_atualizacao_automatica', String(atualizacaoAutomatica));
    setMensagem('Preferências salvas.');
    setErro('');
  };

  const alterarSenha = () =>
    executar(async () => {
      if (!senhaAtual) throw new Error('Informe a senha atual.');
      if (novaSenha.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
      if (novaSenha !== confirmacao) throw new Error('As senhas não conferem.');
      await autenticacaoApi.alterarSenha({ senhaAtual, novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
    });

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Configurações</h1>
        <p className="mt-1 text-sm" style={{ color: '#a8a8b3' }}>Gerencie sua conta, organização e preferências.</p>
      </header>

      {/* Abas */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: '#16161a', border: '1px solid #2a2a32' }}
      >
        {abas.map((aba) => {
          const Icone = aba.icone;
          const ativa = abaAtiva === aba.chave;
          return (
            <button
              key={aba.chave}
              type="button"
              onClick={() => setAbaAtiva(aba.chave)}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: ativa ? '#5b7cfa' : 'transparent',
                color: ativa ? '#fff' : '#a8a8b3',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <Icone className="h-4 w-4" />
              <span className="hidden sm:inline">{aba.rotulo}</span>
            </button>
          );
        })}
      </div>

      {/* Mensagens */}
      {mensagem && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(61, 214, 140, 0.1)', border: '1px solid rgba(61, 214, 140, 0.2)', color: '#3dd68c' }}
        >
          <Check className="h-4 w-4" />
          {mensagem}
        </div>
      )}
      {erro && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171' }}
        >
          {erro}
        </div>
      )}

      {/* ========================================= */}
      {/* ABA: ORGANIZAÇÃO */}
      {/* ========================================= */}
      {abaAtiva === 'organizacao' && (
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="font-semibold text-zinc-100">Organização</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              rotulo="Nome da organização"
              value={nomeOrganizacao}
              onChange={(e) => setNomeOrganizacao(e.target.value)}
            />
            <Input
              rotulo="Slug"
              value={organizacao?.slug || ''}
              disabled
              dica="Identificador único (não editável)"
            />
          </div>

          {/* Informações da organização */}
          <div className="mt-5 rounded-lg p-4" style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span style={{ color: '#6e6e7a' }}>Criada em</span>
                <p className="mt-0.5 font-medium text-zinc-200">
                  {organizacao?.criadoEm
                    ? new Date(organizacao.criadoEm).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div>
                <span style={{ color: '#6e6e7a' }}>ID</span>
                <p className="mt-0.5 font-mono text-xs text-zinc-400">{organizacao?.id?.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          <Button className="mt-5" onClick={salvarOrganizacao} carregando={salvando}>
            <Save className="h-4 w-4" />
            Salvar organização
          </Button>
        </Card>
      )}

      {/* ========================================= */}
      {/* ABA: PREFERÊNCIAS */}
      {/* ========================================= */}
      {abaAtiva === 'preferencias' && (
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Settings className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="font-semibold text-zinc-100">Preferências do Painel</h2>
          </div>

          <div className="space-y-5">
            {/* Itens por página */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Itens por página</label>
              <select
                value={itensPagina}
                onChange={(e) => setItensPagina(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa]"
              >
                {ITENS_POR_PAGINA_OPCOES.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Atualização automática */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAtualizacaoAutomatica(!atualizacaoAutomatica)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  atualizacaoAutomatica ? 'bg-[#5b7cfa]' : 'bg-zinc-700'
                }`}
                role="switch"
                aria-checked={atualizacaoAutomatica}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    atualizacaoAutomatica ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-zinc-200">Atualizar dados automaticamente</p>
                <p className="text-xs text-zinc-500">Atualiza o dashboard a cada 15 segundos</p>
              </div>
            </div>
          </div>

          <Button className="mt-5" onClick={salvarPreferencias}>
            <Save className="h-4 w-4" />
            Salvar preferências
          </Button>
        </Card>
      )}

      {/* ========================================= */}
      {/* ABA: APARÊNCIA */}
      {/* ========================================= */}
      {abaAtiva === 'aparencia' && (
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="font-semibold text-zinc-100">Aparência</h2>
          </div>

          <div className="space-y-6">
            {/* Nome do sistema */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Nome do sistema</label>
              <Input
                value={prefs.nomeAplicacao}
                onChange={(e) => atualizarRascunho({ nomeAplicacao: e.target.value })}
                dica="Exibido no topo da sidebar"
              />
            </div>

            {/* Ícone do logo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Ícone do logo</label>
              <p className="text-xs" style={{ color: '#6e6e7a' }}>
                {prefs.iconeLogo ? 'Ícone selecionado — aparece na sidebar e no topo' : 'Nenhum ícone — usa a primeira letra do nome'}
              </p>
              <div className="flex flex-wrap gap-2">
                {opcoesIcones.map((opcao) => {
                  const Icone = opcao.icone;
                  const selecionado = prefs.iconeLogo === opcao.nome;
                  return (
                    <button
                      key={opcao.nome}
                      type="button"
                      onClick={() => atualizarRascunho({ iconeLogo: selecionado ? '' : opcao.nome })}
                      className="group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all"
                      style={{
                        background: selecionado ? prefs.corDestaque + '22' : '#1e1e24',
                        border: `1px solid ${selecionado ? prefs.corDestaque : '#2a2a32'}`,
                      }}
                      title={opcao.nome}
                    >
                      <Icone
                        className="h-4 w-4"
                        style={{ color: selecionado ? prefs.corDestaque : '#a8a8b3' }}
                      />
                    </button>
                  );
                })}
              </div>
              {prefs.iconeLogo && (
                <button
                  type="button"
                  onClick={() => atualizarRascunho({ iconeLogo: '' })}
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: '#6e6e7a' }}
                >
                  Remover ícone
                </button>
              )}
            </div>

            {/* Cor de destaque */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Cor de destaque</label>
              <p className="text-xs" style={{ color: '#6e6e7a' }}>Usada no logo, botões ativos e links.</p>

              {/* Cores predefinidas */}
              <div className="flex flex-wrap gap-2">
                {coresPreDefinidas.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => atualizarRascunho({ corDestaque: cor.valor })}
                    className="group relative h-9 w-9 rounded-lg transition-transform hover:scale-110"
                    style={{ background: cor.valor }}
                    title={cor.nome}
                  >
                    {prefs.corDestaque === cor.valor && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Input manual */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.corDestaque}
                  onChange={(e) => atualizarRascunho({ corDestaque: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <Input
                  value={prefs.corDestaque}
                  onChange={(e) => atualizarRascunho({ corDestaque: e.target.value })}
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>

            {/* Cor de fundo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Cor de fundo</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.corFundo}
                  onChange={(e) => atualizarRascunho({ corFundo: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <Input
                  value={prefs.corFundo}
                  onChange={(e) => atualizarRascunho({ corFundo: e.target.value })}
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>

            {/* Cor de superfície */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Cor de superfície</label>
              <p className="text-xs" style={{ color: '#6e6e7a' }}>Cards, sidebar e elementos elevados.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.corFundoSuperior}
                  onChange={(e) => atualizarRascunho({ corFundoSuperior: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <Input
                  value={prefs.corFundoSuperior}
                  onChange={(e) => atualizarRascunho({ corFundoSuperior: e.target.value })}
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>

            {/* Cor do texto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Cor do texto</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.corTexto}
                  onChange={(e) => atualizarRascunho({ corTexto: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <Input
                  value={prefs.corTexto}
                  onChange={(e) => atualizarRascunho({ corTexto: e.target.value })}
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>

            {/* Cor da borda */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Cor das bordas</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.corBorda}
                  onChange={(e) => atualizarRascunho({ corBorda: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <Input
                  value={prefs.corBorda}
                  onChange={(e) => atualizarRascunho({ corBorda: e.target.value })}
                  style={{ maxWidth: '140px' }}
                />
              </div>
            </div>

            {/* Preview do logo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Preview</label>
              <div
                className="flex items-center gap-3 rounded-lg p-4 border"
                style={{ backgroundColor: prefs.corFundo, borderColor: prefs.corBorda }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${prefs.corDestaque}20` }}
                >
                  {prefs.iconeLogo && (() => {
                    const opcao = opcoesIcones.find(o => o.nome === prefs.iconeLogo);
                    if (opcao) {
                      const Icone = opcao.icone;
                      return <Icone className="h-5 w-5" style={{ color: prefs.corDestaque }} />;
                    }
                    return (
                      <span className="text-sm font-bold" style={{ color: prefs.corDestaque }}>
                        {prefs.nomeAplicacao.charAt(0).toUpperCase()}
                      </span>
                    );
                  })()}
                  {!prefs.iconeLogo && (
                    <span className="text-sm font-bold" style={{ color: prefs.corDestaque }}>
                      {prefs.nomeAplicacao.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#ececf0' }}>{prefs.nomeAplicacao}</p>
                  <p className="text-xs" style={{ color: '#6e6e7a' }}>Gerenciamento Centralizado</p>
                </div>
              </div>
            </div>

            {/* Aviso: preview é a página inteira */}
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-3" style={{ borderColor: prefs.corDestaque + '55', background: prefs.corDestaque + '08' }}>
              <Eye className="h-4 w-4 shrink-0" style={{ color: prefs.corDestaque }} />
              <p className="text-xs" style={{ color: '#a8a8b3' }}>
                As alterações são aplicadas em tempo real em toda a página. Sidebar, topbar, cards e fundo refletem imediatamente as cores escolhidas.
              </p>
            </div>

            {/* Redefinir */}
            <button
              type="button"
              onClick={redefinir}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: '#6e6e7a' }}
            >
              Restaurar aparência padrão
            </button>

            {/* Barra de ações - sempre visível */}
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{
                background: temAlteracoesPendentes ? '#1a1520' : '#1e1e24',
                border: `1px solid ${temAlteracoesPendentes ? prefs.corDestaque + '44' : '#2a2a32'}`,
                transition: 'all 0.2s',
              }}
            >
              <span className="text-xs" style={{ color: temAlteracoesPendentes ? '#d4d4d8' : '#6e6e7a' }}>
                {temAlteracoesPendentes ? 'Alterações não salvas' : 'Nenhuma alteração pendente'}
              </span>
              <div className="ml-auto flex gap-2">
                {temAlteracoesPendentes && (
                  <Button
                    variante="fantasma"
                    onClick={cancelar}
                    className="h-8 px-3 text-xs"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  onClick={confirmar}
                  carregando={salvandoPreferencias}
                  disabled={!temAlteracoesPendentes}
                  className="h-8 px-3 text-xs"
                >
                  <Save className="h-3 w-3" />
                  {temAlteracoesPendentes ? 'Confirmar alterações' : 'Nada a salvar'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================= */}
      {/* ABA: SEGURANÇA */}
      {/* ========================================= */}
      {abaAtiva === 'seguranca' && (
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="font-semibold text-zinc-100">Alterar Senha</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              rotulo="Senha atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
            <Input
              rotulo="Nova senha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <Input
              rotulo="Confirmar nova senha"
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          </div>

          <div className="mt-4 rounded-lg p-4" style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}>
            <div className="flex items-start gap-2">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#6e6e7a' }} />
              <div className="text-xs" style={{ color: '#6e6e7a' }}>
                <p>A senha deve ter pelo menos 6 caracteres.</p>
                <p className="mt-1">Após alterar, você precisará fazer login novamente em outros dispositivos.</p>
              </div>
            </div>
          </div>

          <Button className="mt-5" onClick={alterarSenha} carregando={salvando}>
            <Shield className="h-4 w-4" />
            Alterar senha
          </Button>
        </Card>
      )}
    </div>
  );
}
