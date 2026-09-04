// Página de Configurações
// Gerencia conta, organização e preferências do usuário

'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, LockKeyhole, Save, Settings, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { autenticacaoApi, organizacoesApi } from '@/lib/api';
import { ITENS_POR_PAGINA_OPCOES } from '@/lib/constantes';

export default function ConfiguracoesPage() {
  const { usuario, organizacao, recarregarOrganizacao } = useAuth();

  // Estado da conta
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  // Estado da organização
  const [nomeOrganizacao, setNomeOrganizacao] = useState('');

  // Preferências
  const [itensPagina, setItensPagina] = useState('20');
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(true);

  // UI
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(usuario?.nome || '');
    setEmail(usuario?.email || '');
    setNomeOrganizacao(organizacao?.nome || '');
    setItensPagina(localStorage.getItem('preferencia_itens_pagina') || '20');
    setAtualizacaoAutomatica(localStorage.getItem('preferencia_atualizacao_automatica') !== 'false');
  }, [usuario, organizacao]);

  const executar = async (acao: () => Promise<void>) => {
    try {
      setSalvando(true);
      setErro('');
      setMensagem('');
      await acao();
      setMensagem('Alterações salvas.');
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
      if (novaSenha || senhaAtual || confirmacao) {
        if (!senhaAtual) throw new Error('Informe a senha atual para alterar a senha.');
        if (novaSenha.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
        if (novaSenha !== confirmacao) throw new Error('As senhas não conferem.');
        await autenticacaoApi.alterarSenha({ senhaAtual, novaSenha });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmacao('');
      }
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

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-bold text-zinc-100">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gerencie sua conta, organização e preferências do painel.
        </p>
      </header>

      {/* Mensagens */}
      {mensagem && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <Check className="h-4 w-4" />
          {mensagem}
        </div>
      )}
      {erro && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      {/* ========================================= */}
      {/* MINHA CONTA */}
      {/* ========================================= */}
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#8ca2ff]" />
          <h2 className="font-semibold text-zinc-100">Minha conta</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-[#8ca2ff]" />
          <h3 className="text-sm font-medium text-zinc-200">Alterar senha</h3>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-3">
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

        <Button className="mt-5" onClick={salvarConta} carregando={salvando}>
          <Save className="h-4 w-4" />
          Salvar conta
        </Button>
      </Card>

      {/* ========================================= */}
      {/* ORGANIZAÇÃO */}
      {/* ========================================= */}
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

        <Button className="mt-5" onClick={salvarOrganizacao} carregando={salvando}>
          <Save className="h-4 w-4" />
          Salvar organização
        </Button>
      </Card>

      {/* ========================================= */}
      {/* PREFERÊNCIAS */}
      {/* ========================================= */}
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <Settings className="h-4 w-4 text-[#8ca2ff]" />
          <h2 className="font-semibold text-zinc-100">Preferências do Painel</h2>
        </div>

        <div className="space-y-4">
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
    </div>
  );
}
