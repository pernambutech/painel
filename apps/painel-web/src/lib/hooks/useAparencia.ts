// Hook para gerenciar aparência visual do painel
// Lê/grava preferências no localStorage e aplica variáveis CSS

'use client';

import { useEffect, useState, useCallback } from 'react';

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

function carregar(): PreferenciasAparencia {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) return { ...DEFAULTS, ...JSON.parse(salvo) };
  } catch { /* ignora */ }
  return DEFAULTS;
}

function aplicarCSS(prefs: PreferenciasAparencia) {
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
  const [prefs, setPrefs] = useState<PreferenciasAparencia>(DEFAULTS);
  const [pronto, setPronto] = useState(false);

  // Carrega do localStorage e aplica no mount
  useEffect(() => {
    const carregadas = carregar();
    setPrefs(carregadas);
    aplicarCSS(carregadas);
    setPronto(true);
  }, []);

  const atualizar = useCallback((parciais: Partial<PreferenciasAparencia>) => {
    setPrefs((anteriores) => {
      const novas = { ...anteriores, ...parciais };
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(novas));
      aplicarCSS(novas);
      return novas;
    });
  }, []);

  const redefinir = useCallback(() => {
    setPrefs(DEFAULTS);
    localStorage.removeItem(CHAVE_STORAGE);
    aplicarCSS(DEFAULTS);
  }, []);

  return { prefs, pronto, atualizar, redefinir };
}
