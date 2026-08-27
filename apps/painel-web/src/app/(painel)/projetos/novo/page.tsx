// Página de criação de projeto

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export default function NovoProjetoPage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
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

    if (!nome.trim()) {
      setErro('Informe o nome do projeto.');
      return;
    }

    try {
      setCarregando(true);
      const projeto = await projetosApi.criar(organizacao.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });
      router.push(`/projetos/${projeto.id}`);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao criar projeto.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link
          href="/projetos"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para projetos
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Novo projeto</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Crie um projeto para agrupar serviços relacionados.
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

          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-zinc-300">
              Nome do projeto
            </label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Sistema de Chamados"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-medium text-zinc-300">
              Descrição <span className="text-zinc-500">(opcional)</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente o projeto"
              maxLength={500}
              rows={4}
              className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-[#5b7cfa]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/projetos">
              <Button type="button" variante="fantasma">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" carregando={carregando}>
              Criar projeto
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}