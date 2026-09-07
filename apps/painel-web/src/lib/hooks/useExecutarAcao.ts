// Hook useExecutarAcao
// Gerencia ações de serviço (Iniciar, Parar, Reiniciar) com estado de loading e erro

'use client';

import { useState, useCallback } from 'react';
import { servicosApi } from '@/lib/api';

// ===========================================
// TIPOS
// ===========================================

type AcaoServico = 'iniciar' | 'parar' | 'reiniciar';

interface UseExecutarAcaoReturn {
  executar: (organizacaoId: string, projetoId: string, servicoId: string, acao: AcaoServico) => Promise<boolean>;
  carregando: boolean;
  erro: string | null;
  limparErro: () => void;
}

// ===========================================
// HOOK
// ===========================================

export function useExecutarAcao(): UseExecutarAcaoReturn {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const limparErro = useCallback(() => {
    setErro(null);
  }, []);

  const executar = useCallback(
    async (
      organizacaoId: string,
      projetoId: string,
      servicoId: string,
      acao: AcaoServico,
    ): Promise<boolean> => {
      setCarregando(true);
      setErro(null);

      try {
        await servicosApi[acao](organizacaoId, projetoId, servicoId);
        setCarregando(false);
        return true;
      } catch (e: unknown) {
        const mensagem =
          e instanceof Error
            ? e.message
            : (e as Record<string, unknown>)?.response
              ? ((e as Record<string, Record<string, unknown>>).response as Record<string, unknown>)?.data
                ? ((e as Record<string, Record<string, Record<string, unknown>>>).response.data as Record<string, unknown>).message as string
                : 'Erro ao executar ação'
              : 'Erro ao executar ação';

        setErro(mensagem || 'Erro ao executar ação');
        setCarregando(false);
        return false;
      }
    },
    [],
  );

  return { executar, carregando, erro, limparErro };
}
