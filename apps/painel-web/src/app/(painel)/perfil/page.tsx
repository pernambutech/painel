// Página de Perfil do Usuário
// Informações pessoais, avatar, cargo, timezone e dados da conta

'use client';

import { useEffect, useState } from 'react';
import { Check, Save, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { autenticacaoApi } from '@/lib/api';

// ===========================================
// COMPONENTE
// ===========================================

export default function PerfilPage() {
  const { usuario, organizacao, recarregarPerfil } = useAuth();

  // ── Estado do perfil ──
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');

  // ── UI ──
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // ===========================================
  // EFEITOS
  // ===========================================

  useEffect(() => {
    setNome(usuario?.nome || '');
    setSobrenome(usuario?.sobrenome || '');
    setEmail(usuario?.email || '');
    setCargo(usuario?.cargo || '');
    setTimezone(usuario?.timezone || 'America/Sao_Paulo');
  }, [usuario]);

  // ===========================================
  // FUNÇÕES
  // ===========================================

  const salvarPerfil = async () => {
    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const atualizado = await autenticacaoApi.atualizarPerfil({
        nome,
        sobrenome: sobrenome || undefined,
        email,
        cargo: cargo || undefined,
        timezone,
      });

      localStorage.setItem('usuario_painel', JSON.stringify(atualizado));
      await recarregarPerfil();
      setMensagem('Perfil atualizado com sucesso.');
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Não foi possível salvar as alterações.';
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Perfil</h1>
        <p className="mt-1 text-sm" style={{ color: '#a8a8b3' }}>Gerencie suas informações pessoais.</p>
      </header>

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

      {/* Card principal */}
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#8ca2ff]" />
          <h2 className="font-semibold text-zinc-100">Dados pessoais</h2>
        </div>

        {/* Avatar + nome */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shrink-0"
            style={{
              background: `linear-gradient(135deg, #5b7cfa 0%, #8b5cf6 100%)`,
              color: '#fff',
            }}
          >
            {usuario?.nome?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-zinc-100 truncate">
              {usuario?.nome} {usuario?.sobrenome || ''}
            </p>
            <p className="text-sm truncate" style={{ color: '#a8a8b3' }}>
              {usuario?.email}
            </p>
            {usuario?.cargo && (
              <p className="text-xs mt-0.5" style={{ color: '#6e6e7a' }}>
                {usuario.cargo}
              </p>
            )}
          </div>
        </div>

        {/* Campos editáveis */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            rotulo="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            placeholder="Opcional"
          />
          <Input rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            rotulo="Cargo / Função"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ex: Desenvolvedor, Admin"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa]"
            >
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/Manaus">Manaus (GMT-4)</option>
              <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
              <option value="America/Santarem">Santarém (GMT-3)</option>
              <option value="America/Belem">Belém (GMT-3)</option>
              <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
              <option value="America/Bahia">Salvador (GMT-3)</option>
              <option value="America/Recife">Recife (GMT-3)</option>
              <option value="America/Nuuk">Groenlândia (GMT-3)</option>
              <option value="America/Maceio">Maceió (GMT-3)</option>
              <option value="America/Aracaju">Aracaju (GMT-3)</option>
              <option value="America/Cuiaba">Cuiabá (GMT-4)</option>
              <option value="America/Campo_Grande">Campo Grande (GMT-4)</option>
              <option value="America/Porto_Velho">Porto Velho (GMT-4)</option>
              <option value="America/Boa_Vista">Boa Vista (GMT-4)</option>
              <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <Button className="mt-5" onClick={salvarPerfil} carregando={salvando}>
          <Save className="h-4 w-4" />
          Salvar perfil
        </Button>
      </Card>

      {/* Informações da conta */}
      <Card>
        <div className="mb-4">
          <h2 className="font-semibold text-zinc-100">Informações da conta</h2>
        </div>

        <div className="rounded-lg p-4" style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}>
          <div className="grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span style={{ color: '#6e6e7a' }}>Papel</span>
              <p className="mt-0.5 font-medium text-zinc-200 capitalize">{organizacao?.papel || 'membro'}</p>
            </div>
            <div>
              <span style={{ color: '#6e6e7a' }}>Conta criada</span>
              <p className="mt-0.5 font-medium text-zinc-200">
                {usuario?.criadoEm
                  ? new Date(usuario.criadoEm).toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            </div>
            <div>
              <span style={{ color: '#6e6e7a' }}>Último acesso</span>
              <p className="mt-0.5 font-medium text-zinc-200">
                {usuario?.ultimoLoginEm
                  ? new Date(usuario.ultimoLoginEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
            <div>
              <span style={{ color: '#6e6e7a' }}>ID</span>
              <p className="mt-0.5 font-mono text-xs text-zinc-400">{usuario?.id?.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
