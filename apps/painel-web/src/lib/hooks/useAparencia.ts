// Hook para gerenciar aparência visual do painel
// Sincroniza preferências entre localStorage e API (banco de dados)
// Fluxo: editar → preview em tempo real → confirmar ou cancelar

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

/**
 * Aplica as variáveis CSS do globals.css no :root.
 * Afeta body, scrollbars, focus outlines e elementos
 * que usam var(--cor-*) diretamente.
 */
function aplicarCSS(prefs: PreferenciasAparencia) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Variáveis CSS que o globals.css já usa
  root.style.setProperty('--cor-fundo', prefs.corFundo);
  root.style.setProperty('--cor-superficie', prefs.corFundoSuperior);
  root.style.setProperty('--cor-texto', prefs.corTexto);
  root.style.setProperty('--cor-texto-secundario', prefs.corTexto + 'b3');
  root.style.setProperty('--cor-borda', prefs.corBorda);
  root.style.setProperty('--cor-primaria', prefs.corDestaque);
  root.style.setProperty('--cor-primaria-hover', prefs.corDestaque + 'dd');
}

function saoIguais(a: PreferenciasAparencia, b: PreferenciasAparencia): boolean {
  return (
    a.nomeAplicacao === b.nomeAplicacao &&
    a.corDestaque === b.corDestaque &&
    a.corFundo === b.corFundo &&
    a.corFundoSuperior === b.corFundoSuperior &&
    a.corTexto === b.corTexto &&
    a.corBorda === b.corBorda
  );
}

// ===========================================
// HOOK
// ===========================================

export function useAparencia() {
  const { organizacao } = useAuth();

  // Estado salvo (fonte de verdade após confirmar)
  const [salvo, setSalvo] = useState<PreferenciasAparencia>(DEFAULTS);

  // Rascunho (o que o usuário está editando)
  const [rascunho, setRascunho] = useState<PreferenciasAparencia>(DEFAULTS);

  const [pronto, setPronto] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [salvandoPreferencias, setSalvandoPreferencias] = useState(false);

  // Carrega preferências: localStorage primeiro, depois API
  useEffect(() => {
    const local = carregarLocal();
    setSalvo(local);
    setRascunho(local);
    aplicarCSS(local);
    setPronto(true);

    if (organizacao?.id) {
      setSincronizando(true);
      organizacoesApi.obterPreferencias(organizacao.id)
        .then((res) => {
          if (res && Object.keys(res).length > 0) {
            const apiPrefs: PreferenciasAparencia = { ...DEFAULTS, ...res };
            setSalvo(apiPrefs);
            setRascunho(apiPrefs);
            aplicarCSS(apiPrefs);
            salvarLocal(apiPrefs);
          }
        })
        .catch(() => { /* mantém localStorage */ })
        .finally(() => setSincronizando(false));
    }
  }, [organizacao?.id]);

  // Atualiza rascunho (form + CSS vars, NÃO salva)
  const atualizarRascunho = useCallback((parciais: Partial<PreferenciasAparencia>) => {
    setRascunho((anterior) => {
      const novo = { ...anterior, ...parciais };
      aplicarCSS(novo);
      return novo;
    });
  }, []);

  // Confirmar: salva rascunho (localStorage + API)
  const confirmar = useCallback(async () => {
    setSalvandoPreferencias(true);
    try {
      salvarLocal(rascunho);
      aplicarCSS(rascunho);
      setSalvo(rascunho);

      if (organizacao?.id) {
        await organizacoesApi.atualizarPreferencias(organizacao.id, rascunho as unknown as Record<string, unknown>);
      }
    } catch {
      // Se API falhar, local já está atualizado
    } finally {
      setSalvandoPreferencias(false);
    }
  }, [rascunho, organizacao?.id]);

  // Cancelar: descarta rascunho, volta ao último estado salvo
  const cancelar = useCallback(() => {
    setRascunho(salvo);
    aplicarCSS(salvo);
  }, [salvo]);

  // Redefinir para padrão
  const redefinir = useCallback(async () => {
    setSalvo(DEFAULTS);
    setRascunho(DEFAULTS);
    removerLocal();
    aplicarCSS(DEFAULTS);

    if (organizacao?.id) {
      organizacoesApi.atualizarPreferencias(organizacao.id, {}).catch(() => {});
    }
  }, [organizacao?.id]);

  const temAlteracoesPendentes = !saoIguais(rascunho, salvo);

  return {
    prefs: rascunho,
    salvo,
    pronto,
    sincronizando,
    salvandoPreferencias,
    temAlteracoesPendentes,
    atualizarRascunho,
    confirmar,
    cancelar,
    redefinir,
  };
}
