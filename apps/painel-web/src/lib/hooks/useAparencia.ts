// Hook para gerenciar aparência visual do painel
// Sincroniza preferências entre localStorage e API (banco de dados)
// localStorage serve como cache; API é a fonte de verdade

'use client';

import { useEffect, useState, useCallback } from 'react';
import { organizacoesApi } from '@/lib/api';
import { useAuth } from './useAuth';

// ===========================================
// TIPOS
// ===========================================

export interface PreferenciasAparencia {
  nomeAplicacao: string;
  corDestaque: string;
  corFundo: string;
  corFundoSuperior: string;
  corTexto: string;
  corBorda: string;
}

// ===========================================
// DEFAULTS
// ===========================================

const DEFAULTS: PreferenciasAparencia = {
  nomeAplicacao: 'DevManager',
  corDestaque: '#5b7cfa',
  corFundo: '#0d0d0f',
  corFundoSuperior: '#16161a',
  corTexto: '#ececf0',
  corBorda: '#2a2a32',
};

const CHAVE_STORAGE = 'preferencias_aparencia';

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

function carregarLocal(): PreferenciasAparencia {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) return { ...DEFAULTS, ...JSON.parse(salvo) };
  } catch { /* ignora */ }
  return DEFAULTS;
}

function salvarLocal(prefs: PreferenciasAparencia) {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(prefs));
  } catch { /* ignora */ }
}

function removerLocal() {
  try {
    localStorage.removeItem(CHAVE_STORAGE);
  } catch { /* ignora */ }
}

function aplicarCSS(prefs: PreferenciasAparencia) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--accent', prefs.corDestaque);
  root.style.setProperty('--bg-base', prefs.corFundo);
  root.style.setProperty('--bg-surface', prefs.corFundoSuperior);
  root.style.setProperty('--text-primary', prefs.corTexto);
  root.style.setProperty('--border-subtle', prefs.corBorda);

  // Cores derivadas do destaque (com opacidade)
  root.style.setProperty('--accent-light', `${prefs.corDestaque}22`);
  root.style.setProperty('--accent-hover', `${prefs.corDestaque}33`);
}

// ===========================================
// HOOK
// ===========================================

export function useAparencia() {
  const { organizacao } = useAuth();
  const [prefs, setPrefs] = useState<PreferenciasAparencia>(DEFAULTS);
  const [pronto, setPronto] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  // Carrega preferências: localStorage primeiro (rápido), depois API (fonte de verdade)
  useEffect(() => {
    // 1. Aplica do localStorage imediatamente (evita flash)
    const local = carregarLocal();
    setPrefs(local);
    aplicarCSS(local);
    setPronto(true);

    // 2. Busca da API se organização está disponível
    if (organizacao?.id) {
      setSincronizando(true);
      organizacoesApi.obterPreferencias(organizacao.id)
        .then((res) => {
          // API retorna objeto com as preferências ou {}
          if (res && Object.keys(res).length > 0) {
            const apiPrefs: PreferenciasAparencia = { ...DEFAULTS, ...res };
            setPrefs(apiPrefs);
            aplicarCSS(apiPrefs);
            salvarLocal(apiPrefs); // Atualiza cache local
          }
        })
        .catch(() => {
          // Se API falhar, mantém o que veio do localStorage
        })
        .finally(() => setSincronizando(false));
    }
  }, [organizacao?.id]);

  // Atualiza em memória + localStorage + API
  const atualizar = useCallback((parciais: Partial<PreferenciasAparencia>) => {
    setPrefs((anteriores) => {
      const novas = { ...anteriores, ...parciais };
      // Salva local (rápido)
      salvarLocal(novas);
      aplicarCSS(novas);
      // Salva na API (async, sem bloquear UI)
      if (organizacao?.id) {
        organizacoesApi.atualizarPreferencias(organizacao.id, novas).catch(() => {
          // Se falhar, local já está atualizado
        });
      }
      return novas;
    });
  }, [organizacao?.id]);

  // Redefine para padrão: limpa tudo
  const redefinir = useCallback(() => {
    setPrefs(DEFAULTS);
    removerLocal();
    aplicarCSS(DEFAULTS);
    // Limpa também na API
    if (organizacao?.id) {
      organizacoesApi.atualizarPreferencias(organizacao.id, {}).catch(() => {});
    }
  }, [organizacao?.id]);

  return { prefs, pronto, sincronizando, atualizar, redefinir };
}
