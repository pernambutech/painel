// Componente de edição de variáveis de ambiente (pares chave-valor)
// Usado na criação e edição de serviços

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

interface ParChaveValor {
  chave: string;
  valor: string;
}

interface EditorVariaveisAmbienteProps {
  valor?: Record<string, string> | null;
  aoMudar?: (dados: Record<string, string>) => void;
  desabilitado?: boolean;
}

/**
 * Converte Record<string, string> em array de pares chave-valor para edição.
 */
function paraPares(objeto: Record<string, string> | null | undefined): ParChaveValor[] {
  if (!objeto || typeof objeto !== 'object') return [];
  return Object.entries(objeto).map(([chave, valor]) => ({ chave, valor }));
}

/**
 * Converte array de pares chave-valor em Record<string, string>.
 * Remove pares com chave vazia.
 */
function paraObjeto(pares: ParChaveValor[]): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const par of pares) {
    const chaveLimpa = par.chave.trim();
    if (chaveLimpa) {
      resultado[chaveLimpa] = par.valor;
    }
  }
  return resultado;
}

export function EditorVariaveisAmbiente({
  valor,
  aoMudar,
  desabilitado = false,
}: EditorVariaveisAmbienteProps) {
  const [pares, setPares] = useState<ParChaveValor[]>(() => paraPares(valor));

  const atualizar = (novosPares: ParChaveValor[]) => {
    setPares(novosPares);
    aoMudar?.(paraObjeto(novosPares));
  };

  const adicionar = () => {
    atualizar([...pares, { chave: '', valor: '' }]);
  };

  const remover = (indice: number) => {
    atualizar(pares.filter((_, i) => i !== indice));
  };

  const mudarChave = (indice: number, novaChave: string) => {
    const novos = [...pares];
    novos[indice] = { ...novos[indice], chave: novaChave };
    atualizar(novos);
  };

  const mudarValor = (indice: number, novoValor: string) => {
    const novos = [...pares];
    novos[indice] = { ...novos[indice], valor: novoValor };
    atualizar(novos);
  };

  return (
    <div className="space-y-2">
      {pares.length === 0 && (
        <p className="text-xs text-zinc-600">
          Nenhuma variável de ambiente configurada.
        </p>
      )}

      {pares.map((par, indice) => (
        <div key={indice} className="flex items-center gap-2">
          <Input
            value={par.chave}
            onChange={(e) => mudarChave(indice, e.target.value)}
            placeholder="CHAVE"
            disabled={desabilitado}
            className="flex-1 font-mono text-xs"
          />
          <span className="text-zinc-600">=</span>
          <Input
            value={par.valor}
            onChange={(e) => mudarValor(indice, e.target.value)}
            placeholder="valor"
            disabled={desabilitado}
            className="flex-1 font-mono text-xs"
          />
          <Button
            type="button"
            variante="fantasma"
            tamanho="pequeno"
            onClick={() => remover(indice)}
            disabled={desabilitado}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variante="secundario"
        tamanho="pequeno"
        onClick={adicionar}
        disabled={desabilitado}
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar variável
      </Button>
    </div>
  );
}
