// Modal de criação de serviço
// Permite selecionar projeto e preencher dados do novo serviço

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi, projetosApi, ambientesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EditorVariaveisAmbiente } from '@/components/EditorVariaveisAmbiente';
import { X } from 'lucide-react';
import type { Projeto, Ambiente } from '@/types';

// ===========================================
// TIPOS
// ===========================================

interface CriarServicoModalProps {
  aoFechar: () => void;
  aoCriar?: () => void;
}

const tipos = [
  { valor: 'frontend', rotulo: 'Frontend' },
  { valor: 'backend', rotulo: 'Backend' },
  { valor: 'api', rotulo: 'API' },
  { valor: 'worker', rotulo: 'Worker' },
  { valor: 'bot', rotulo: 'Bot' },
  { valor: 'custom', rotulo: 'Personalizado' },
];

// ===========================================
// COMPONENTE
// ===========================================

export function CriarServicoModal({ aoFechar, aoCriar }: CriarServicoModalProps) {
  const { organizacao } = useAuth();

  // Campos do formulário
  const [projetoId, setProjetoId] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('frontend');
  const [diretorio, setDiretorio] = useState('');
  const [comando, setComando] = useState('');
  const [porta, setPorta] = useState('');
  const [ambienteId, setAmbienteId] = useState('');
  const [variaveisAmbiente, setVariaveisAmbiente] = useState<Record<string, string>>({});
  const [healthCheckUrl, setHealthCheckUrl] = useState('');

  // Estado
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar projetos e ambientes
  useEffect(() => {
    if (!organizacao) return;

    const carregarDados = async () => {
      try {
        setCarregandoDados(true);
        const [projetosDados, ambientesDados] = await Promise.all([
          projetosApi.listar(organizacao.id),
          ambientesApi.listar(organizacao.id),
        ]);
        setProjetos(projetosDados || []);
        setAmbientes(ambientesDados || []);
      } catch {
        // Ignorar erro
      } finally {
        setCarregandoDados(false);
      }
    };

    carregarDados();
  }, [organizacao]);

  // Validar e salvar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!organizacao) {
      setErro('Organização não encontrada.');
      return;
    }

    if (!projetoId) {
      setErro('Selecione um projeto.');
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
      setSalvando(true);
      await servicosApi.criar(organizacao.id, projetoId, {
        nome: nome.trim(),
        tipo,
        diretorio: diretorio.trim() || undefined,
        comando: comando.trim() || undefined,
        porta: portaNum,
        ambienteId: ambienteId || undefined,
        variaveisAmbiente: Object.keys(variaveisAmbiente).length > 0 ? variaveisAmbiente : undefined,
        healthCheckUrl: healthCheckUrl.trim() || undefined,
      });
      aoCriar?.();
      aoFechar();
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar serviço.';
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Novo serviço" larguraMaxima="max-w-lg">
      {/* Cabeçalho */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Novo serviço</h2>
          <p className="text-xs text-zinc-500">Crie um novo serviço em um projeto</p>
        </div>
        <Button variante="fantasma" tamanho="pequeno" onClick={aoFechar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Projeto */}
        <div className="space-y-1.5">
          <label htmlFor="servico-projeto" className="text-xs font-medium text-zinc-400">
            Projeto *
          </label>
          <select
            id="servico-projeto"
            value={projetoId}
            onChange={(e) => setProjetoId(e.target.value)}
            disabled={carregandoDados}
            className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa] disabled:opacity-50"
          >
            <option value="">Selecione um projeto</option>
            {projetos.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <label htmlFor="servico-nome" className="text-xs font-medium text-zinc-400">
            Nome *
          </label>
          <Input
            id="servico-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Frontend, Backend"
            maxLength={100}
          />
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <label htmlFor="servico-tipo" className="text-xs font-medium text-zinc-400">
            Tipo
          </label>
          <select
            id="servico-tipo"
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

        {/* Diretório */}
        <div className="space-y-1.5">
          <label htmlFor="servico-diretorio" className="text-xs font-medium text-zinc-400">
            Diretório <span className="text-zinc-600">(opcional)</span>
          </label>
          <Input
            id="servico-diretorio"
            value={diretorio}
            onChange={(e) => setDiretorio(e.target.value)}
            placeholder="Ex.: C:\Projetos\meu-app"
          />
        </div>

        {/* Comando */}
        <div className="space-y-1.5">
          <label htmlFor="servico-comando" className="text-xs font-medium text-zinc-400">
            Comando <span className="text-zinc-600">(opcional)</span>
          </label>
          <Input
            id="servico-comando"
            value={comando}
            onChange={(e) => setComando(e.target.value)}
            placeholder="Ex.: npm run dev, npm run start"
          />
        </div>

        {/* Porta */}
        <div className="space-y-1.5">
          <label htmlFor="servico-porta" className="text-xs font-medium text-zinc-400">
            Porta <span className="text-zinc-600">(opcional)</span>
          </label>
          <Input
            id="servico-porta"
            type="number"
            value={porta}
            onChange={(e) => setPorta(e.target.value)}
            placeholder="Ex.: 3000"
            min={1}
            max={65535}
          />
        </div>

        {/* Ambiente */}
        <div className="space-y-1.5">
          <label htmlFor="servico-ambiente" className="text-xs font-medium text-zinc-400">
            Ambiente <span className="text-zinc-600">(opcional)</span>
          </label>
          <select
            id="servico-ambiente"
            value={ambienteId}
            onChange={(e) => setAmbienteId(e.target.value)}
            disabled={carregandoDados}
            className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa] disabled:opacity-50"
          >
            <option value="">Sem ambiente</option>
            {ambientes.map((amb) => (
              <option key={amb.id} value={amb.id}>
                {amb.nome} ({amb.tipo})
              </option>
            ))}
          </select>
        </div>

        {/* Variáveis de ambiente */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">
            Variáveis de ambiente <span className="text-zinc-600">(opcional)</span>
          </label>
          <p className="text-[11px] text-zinc-600">
            Variáveis injetadas no processo via PM2 (ex: NODE_ENV, DATABASE_URL).
          </p>
          <EditorVariaveisAmbiente
            valor={variaveisAmbiente}
            aoMudar={setVariaveisAmbiente}
          />
        </div>

        {/* Health Check URL */}
        <div className="space-y-1.5">
          <label htmlFor="servico-healthcheck" className="text-xs font-medium text-zinc-400">
            Health Check URL <span className="text-zinc-600">(opcional)</span>
          </label>
          <Input
            id="servico-healthcheck"
            value={healthCheckUrl}
            onChange={(e) => setHealthCheckUrl(e.target.value)}
            placeholder="Ex.: /api/health"
          />
          <p className="text-[11px] text-zinc-600">
            Endpoint relativo para verificação de saúde (ex: /api/health).
          </p>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" carregando={salvando} disabled={!projetoId || !nome.trim()}>
            Criar serviço
          </Button>
        </div>
      </form>
    </Modal>
  );
}
