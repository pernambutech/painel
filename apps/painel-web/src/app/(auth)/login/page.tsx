// Página de Login

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(email, senha);
      router.push('/ambientes');
    } catch (err: unknown) {
      const erroMensagem =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao fazer login. Tente novamente.';
      setErro(erroMensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Painel</h1>
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
              <Link href="/cadastro" className="text-indigo-400 hover:text-indigo-300">
                Criar conta
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
