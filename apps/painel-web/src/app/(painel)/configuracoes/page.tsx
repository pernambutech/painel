// Página de Configurações
// Abas: Conta, Organização, Preferências, Segurança

'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, KeyRound, LockKeyhole, Save, Settings, Shield, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { autenticacaoApi, organizacoesApi } from '@/lib/api';
import { ITENS_POR_PAGINA_OPCOES } from '@/lib/constantes';

// ===========================================
// CONSTANTES
// ===========================================

const abas = [
  { chave: 'conta', rotulo: 'Conta', icone: UserRound },
  { chave: 'organizacao', rotulo: 'Organização', icone: Building2 },
  { chave: 'preferencias', rotulo: 'Preferências', icone: Settings },
  { chave: 'seguranca', rotulo: 'Segurança', icone: Shield },
] as const;

type AbaChave = (typeof abas)[number]['chave'];

// ===========================================
// COMPONENTE
// ===========================================

export default function ConfiguracoesPage() {
  const { usuario, organizacao, recarregarOrganizacao } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<AbaChave>('conta');

  // ── Estado da conta ──
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

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
    setNome(usuario?.nome || '');
    setEmail(usuario?.email || '');
    setNomeOrganizacao(organizacao?.nome || '');
    setItensPagina(localStorage.getItem('preferencia_itens_pagina') || '20');
    setAtualizacaoAutomatica(localStorage.getItem('preferencia_atualizacao_automatica') !== 'false');
  }, [usuario, organizacao]);

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

  const salvarConta = () =>
    executar(async () => {
      const atualizado = await autenticacaoApi.atualizarPerfil({ nome, email });
      localStorage.setItem('usuario_painel', JSON.stringify(atualizado));
    });

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
      {/* ABA: CONTA */}
      {/* ========================================= */}
      {abaAtiva === 'conta' && (
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="font-semibold text-zinc-100">Perfil</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Informações da conta */}
          <div className="mt-5 rounded-lg p-4" style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <span style={{ color: '#6e6e7a' }}>Papel</span>
                <p className="mt-0.5 font-medium text-zinc-200 capitalize">{organizacao?.papel || 'membro'}</p>
              </div>
              <div>
                <span style={{ color: '#6e6e7a' }}>Membro desde</span>
                <p className="mt-0.5 font-medium text-zinc-200">
                  {organizacao?.criadoEm
                    ? new Date(organizacao.criadoEm).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div>
                <span style={{ color: '#6e6e7a' }}>ID do usuário</span>
                <p className="mt-0.5 font-mono text-xs text-zinc-400">{usuario?.id?.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          <Button className="mt-5" onClick={salvarConta} carregando={salvando}>
            <Save className="h-4 w-4" />
            Salvar perfil
          </Button>
        </Card>
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
