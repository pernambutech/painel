// Página de criação de ambiente

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import { TIPOS_AMBIENTE, SISTEMAS_OPERACIONAIS } from '@/lib/constantes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export default function NovoAmbientePage() {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('local');
  const [sistemaOperacional, setSistemaOperacional] = useState('linux');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { organizacao } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!organizacao) {
      setErro('Organização não encontrada.');
      return;
    }

    setCarregando(true);

    try {
      await ambientesApi.criar(organizacao.id, {
        nome,
        tipo,
        sistemaOperacional,
      });
      router.push('/ambientes');
    } catch (err: unknown) {
      const erroMensagem =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao criar ambiente. Tente novamente.';
      setErro(erroMensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      {/* Cabeçalho */}
      <div>
        <Link
          href="/ambientes"
          className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Novo Ambiente</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Adicione uma máquina ou servidor para gerenciar
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{erro}</p>
            </div>
          )}

          <Input
            rotulo="Nome do Ambiente"
            placeholder="Ex: Notebook Desenvolvimento"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            dica="Nome descritivo para identificar a máquina"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Tipo de Ambiente</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-[#1e1e24] border border-[#2a2a32]
                text-zinc-100
                focus:outline-none focus:border-[#5b7cfa]
              "
            >
              {TIPOS_AMBIENTE.map((t) => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Sistema Operacional</label>
            <select
              value={sistemaOperacional}
              onChange={(e) => setSistemaOperacional(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                bg-[#1e1e24] border border-[#2a2a32]
                text-zinc-100
                focus:outline-none focus:border-[#5b7cfa]
              "
            >
              {SISTEMAS_OPERACIONAIS.map((s) => (
                <option key={s.valor} value={s.valor}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/ambientes" className="flex-1">
              <Button variante="secundario" larguraTotal>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" carregando={carregando} className="flex-1">
              Criar Ambiente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
