// Página de criação de serviço vinculado a um projeto

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi, ambientesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import type { Ambiente } from '@/types';

const tipos = [
  { valor: 'frontend', rotulo: 'Frontend' },
  { valor: 'backend', rotulo: 'Backend' },
  { valor: 'api', rotulo: 'API' },
  { valor: 'worker', rotulo: 'Worker' },
  { valor: 'bot', rotulo: 'Bot' },
  { valor: 'custom', rotulo: 'Personalizado' },
];

export default function NovoServicoPage() {
  const params = useParams();
  const router = useRouter();
  const { organizacao } = useAuth();
  const projetoId = params.id as string;

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('custom');
  const [diretorio, setDiretorio] = useState('');
  const [comando, setComando] = useState('');
  const [porta, setPorta] = useState('');
  const [ambienteId, setAmbienteId] = useState('');
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (organizacao) {
      ambientesApi
        .listar(organizacao.id)
        .then(setAmbientes)
        .catch(() => setAmbientes([]));
    }
  }, [organizacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!organizacao) {
      setErro('Organização não encontrada.');
      return;
    }

    if (!nome.trim()) {
      setErro('Informe o nome do serviço.');
      return;
    }

    const portaNum = porta ? Number(porta) : undefined;
    if (porta && (!Number.isInteger(portaNum!) || portaNum! < 1 || portaNum! > 65535)) {
      setErro('Porta deve ser entre 1 e 65535.');
      return;
    }

    try {
      setCarregando(true);
      await servicosApi.criar(organizacao.id, projetoId, {
        nome: nome.trim(),
        tipo,
        diretorio: diretorio.trim() || undefined,
        comando: comando.trim() || undefined,
        porta: portaNum,
        ambienteId: ambienteId || undefined,
      });
      router.push(`/projetos/${projetoId}`);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao criar serviço.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/projetos/${projetoId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao projeto
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Novo serviço</h1>
        <p className="text-sm text-zinc-500 mt-1">Adicione um serviço ao projeto.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{erro}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-zinc-300">
              Nome do serviço
            </label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Frontend, Backend, Worker"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipo" className="block text-sm font-medium text-zinc-300">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa]"
            >
              {tipos.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="diretorio" className="block text-sm font-medium text-zinc-300">
              Diretório <span className="text-zinc-500">(opcional)</span>
            </label>
            <Input
              id="diretorio"
              type="text"
              value={diretorio}
              onChange={(e) => setDiretorio(e.target.value)}
              placeholder="Ex.: C:\Projetos\meu-app ou /home/app"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="comando" className="block text-sm font-medium text-zinc-300">
              Comando <span className="text-zinc-500">(opcional)</span>
            </label>
            <Input
              id="comando"
              type="text"
              value={comando}
              onChange={(e) => setComando(e.target.value)}
              placeholder="Ex.: npm run dev, npm run start"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="porta" className="block text-sm font-medium text-zinc-300">
              Porta <span className="text-zinc-500">(opcional)</span>
            </label>
            <Input
              id="porta"
              type="number"
              value={porta}
              onChange={(e) => setPorta(e.target.value)}
              placeholder="Ex.: 3000"
              min={1}
              max={65535}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ambiente" className="block text-sm font-medium text-zinc-300">
              Ambiente <span className="text-zinc-500">(opcional)</span>
            </label>
            <select
              id="ambiente"
              value={ambienteId}
              onChange={(e) => setAmbienteId(e.target.value)}
              className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa]"
            >
              <option value="">Sem ambiente</option>
              {ambientes.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.nome} ({amb.tipo})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={`/projetos/${projetoId}`}>
              <Button type="button" variante="fantasma">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" carregando={carregando}>
              Criar serviço
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
