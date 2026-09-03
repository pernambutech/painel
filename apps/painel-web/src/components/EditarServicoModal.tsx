// Modal de edição de serviço
// Permite editar nome, tipo, diretório, comando, porta e ambiente

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi, ambientesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { X } from 'lucide-react';
import type { Servico, Ambiente } from '@/types';

// ===========================================
// TIPOS
// ===========================================

interface EditarServicoModalProps {
  servico: Servico;
  projetoId: string;
  aoFechar: () => void;
  aoAtualizar?: () => void;
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

export function EditarServicoModal({
  servico,
  projetoId,
  aoFechar,
  aoAtualizar,
}: EditarServicoModalProps) {
  const { organizacao } = useAuth();

  // Campos do formulário
  const [nome, setNome] = useState(servico.nome);
  const [tipo, setTipo] = useState(servico.tipo);
  const [diretorio, setDiretorio] = useState(servico.diretorio || '');
  const [comando, setComando] = useState(servico.comando || '');
  const [porta, setPorta] = useState(servico.porta ? String(servico.porta) : '');
  const [ambienteId, setAmbienteId] = useState(servico.ambienteId || '');

  // Estado
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar ambientes disponíveis
  useEffect(() => {
    if (!organizacao) return;

    const carregarAmbientes = async () => {
      try {
        setCarregandoAmbientes(true);
        const dados = await ambientesApi.listar(organizacao.id);
        setAmbientes(dados);
      } catch {
        // Ignorar erro — ambiente é opcional
      } finally {
        setCarregandoAmbientes(false);
      }
    };

    carregarAmbientes();
  }, [organizacao]);

  // Validar e salvar
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
      setSalvando(true);
      await servicosApi.atualizar(organizacao.id, projetoId, servico.id, {
        nome: nome.trim(),
        tipo,
        diretorio: diretorio.trim() || undefined,
        comando: comando.trim() || undefined,
        porta: portaNum,
        ambienteId: ambienteId || null,
      });
      aoAtualizar?.();
      aoFechar();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao salvar serviço.');
    } finally {
      setSalvando(false);
    }
  };

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Editar serviço" larguraMaxima="max-w-lg">
      {/* Cabeçalho */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Editar serviço</h2>
          <p className="text-xs text-zinc-500">{servico.nome}</p>
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
          {/* Nome */}
          <div className="space-y-1.5">
            <label htmlFor="servico-nome" className="text-xs font-medium text-zinc-400">
              Nome
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
              disabled={carregandoAmbientes}
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

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" carregando={salvando}>
              Salvar
            </Button>
          </div>
        </form>
    </Modal>
  );
}
