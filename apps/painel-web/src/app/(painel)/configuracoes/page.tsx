'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, LockKeyhole, Save, Settings, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { autenticacaoApi, organizacoesApi } from '@/lib/api';

export default function ConfiguracoesPage() {
  const { usuario, organizacao, recarregarOrganizacao } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nomeOrganizacao, setNomeOrganizacao] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [itensPagina, setItensPagina] = useState('20');
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(true);
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
    try { setSalvando(true); setErro(''); setMensagem(''); await acao(); setMensagem('Alterações salvas.'); }
    catch (err: any) { setErro(err?.response?.data?.message || 'Não foi possível salvar as alterações.'); }
    finally { setSalvando(false); }
  };

  const salvarConta = () => executar(async () => {
    const atualizado = await autenticacaoApi.atualizarPerfil({ nome, email });
    localStorage.setItem('usuario_painel', JSON.stringify(atualizado));
    if (novaSenha) {
      if (novaSenha !== confirmacao) throw new Error('As senhas não conferem.');
      await autenticacaoApi.alterarSenha({ senhaAtual, novaSenha });
      setSenhaAtual(''); setNovaSenha(''); setConfirmacao('');
    }
  });

  const salvarOrganizacao = () => executar(async () => {
    if (!organizacao) return;
    await organizacoesApi.atualizar(organizacao.id, { nome: nomeOrganizacao });
    await recarregarOrganizacao();
  });

  const salvarPreferencias = () => {
    localStorage.setItem('preferencia_itens_pagina', itensPagina);
    localStorage.setItem('preferencia_atualizacao_automatica', String(atualizacaoAutomatica));
    setMensagem('Preferências salvas.'); setErro('');
  };

  return <div className="mx-auto max-w-[1000px] space-y-7"><header><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Configurações</h1><p className="mt-1 text-sm text-zinc-400">Gerencie sua conta, organização e preferências do painel.</p></header>{mensagem && <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"><Check className="h-4 w-4" />{mensagem}</div>}{erro && <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{erro}</div>}<Card><div className="mb-5 flex items-center gap-2"><UserRound className="h-4 w-4 text-[#8ca2ff]" /><h2 className="font-semibold text-zinc-100">Minha conta</h2></div><div className="grid gap-4 md:grid-cols-2"><Input rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} /><Input rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="mt-5 flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#8ca2ff]" /><h3 className="text-sm font-medium text-zinc-200">Alterar senha</h3></div><div className="mt-3 grid gap-4 md:grid-cols-3"><Input rotulo="Senha atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /><Input rotulo="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} /><Input rotulo="Confirmar nova senha" type="password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} /></div><Button className="mt-5" onClick={salvarConta} carregando={salvando}><Save className="h-4 w-4" />Salvar conta</Button></Card><Card><div className="mb-5 flex items-center gap-2"><Building2 className="h-4 w-4 text-[#8ca2ff]" /><h2 className="font-semibold text-zinc-100">Organização</h2></div><div className="grid gap-4 md:grid-cols-2"><Input rotulo="Nome da organização" value={nomeOrganizacao} onChange={(e) => setNomeOrganizacao(e.target.value)} /><Input rotulo="Slug" value={organizacao?.slug || ''} disabled dica="O slug identifica a organização nas integrações." /></div><Button className="mt-5" onClick={salvarOrganizacao} carregando={salvando}><Save className="h-4 w-4" />Salvar organização</Button></Card><Card><div className="mb-5 flex items-center gap-2"><Settings className="h-4 w-4 text-[#8ca2ff]" /><h2 className="font-semibold text-zinc-100">Preferências do painel</h2></div><div className="grid gap-5 md:grid-cols-2"><label className="text-sm text-zinc-300">Itens por página<select value={itensPagina} onChange={(e) => setItensPagina(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#2a2a32] bg-[#1e1e24] px-4 py-2.5 text-zinc-100"><option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></label><label className="flex items-center gap-3 pt-7 text-sm text-zinc-300"><input type="checkbox" checked={atualizacaoAutomatica} onChange={(e) => setAtualizacaoAutomatica(e.target.checked)} className="h-4 w-4 accent-[#5b7cfa]" />Atualizar status automaticamente</label></div><Button className="mt-5" onClick={salvarPreferencias}><Save className="h-4 w-4" />Salvar preferências</Button></Card></div>;
}
