// Página de Login

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAparencia } from '@/lib/hooks/useAparencia';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Box, Code2, Cpu, Database, Globe, Hammer, Layers, Layout,
  Monitor, Rocket, Server, ShieldCheck, Terminal, Wrench, Zap,
  LucideIcon,
} from 'lucide-react';

const ICONES_MAP: Record<string, LucideIcon> = {
  Box, Code2, Cpu, Database, Globe, Hammer, Layers, Layout,
  Monitor, Rocket, Server, ShieldCheck, Terminal, Wrench, Zap,
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { prefs } = useAparencia();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(email, senha);
      router.push('/dashboard');
    } catch (err: unknown) {
      const erroMensagem =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao fazer login. Tente novamente.';
      setErro(erroMensagem);
    } finally {
      setCarregando(false);
    }
  };

  const renderizarLogo = () => {
    if (prefs.iconeLogo && ICONES_MAP[prefs.iconeLogo]) {
      const IconeLogo = ICONES_MAP[prefs.iconeLogo];
      return <IconeLogo className="h-6 w-6" style={{ color: prefs.corDestaque }} />;
    }
    return (
      <div
        className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
        style={{ background: prefs.corDestaque }}
      >
        {prefs.nomeAplicacao.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: prefs.corFundo }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${prefs.corDestaque}20` }}
          >
            {renderizarLogo()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{prefs.nomeAplicacao}</h1>
            <p className="text-xs text-zinc-500">Gerenciamento Centralizado</p>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Entrar na sua conta</h2>
              <p className="text-sm text-zinc-500 mt-1">Acesse sua plataforma de gerenciamento</p>
            </div>

            {erro && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{erro}</p>
              </div>
            )}

            <Input
              rotulo="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              rotulo="Senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <Button type="submit" carregando={carregando} larguraTotal>
              Entrar
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="hover:text-zinc-300" style={{ color: prefs.corDestaque }}>
                Criar conta
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
