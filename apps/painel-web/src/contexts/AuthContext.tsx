// Contexto de autenticação
// Gerencia estado global de autenticação do usuário

'use client';

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { autenticacaoApi, organizacoesApi } from '@/lib/api';
import type { Usuario, Organizacao } from '@/types';

// ===========================================
// TIPOS DO CONTEXTO
// ===========================================

export interface AuthContextType {
  // Estado
  usuario: Usuario | null;
  organizacao: Organizacao | null;
  carregando: boolean;
  autenticado: boolean;

  // Ações
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  recarregarPerfil: () => Promise<void>;
  recarregarOrganizacao: () => Promise<void>;
  alterarOrganizacao: (organizacao: Organizacao) => void;
}

// ===========================================
// CONTEXTO
// ===========================================

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function selecionarOrganizacao(organizacoes: Organizacao[]): Organizacao {
  // Verificar se há organização salva no localStorage
  const idSalvo = localStorage.getItem('organizacao_painel');
  if (idSalvo) {
    const encontrada = organizacoes.find((o) => o.id === idSalvo);
    if (encontrada) return encontrada;
  }
  // Caso contrário, usar a primeira organização
  return organizacoes[0];
}

// ===========================================
// PROVIDER
// ===========================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [carregando, setCarregando] = useState(true);

  // ===========================================
  // CARREGAR SESSÃO
  // ===========================================

  const carregarSessao = useCallback(async () => {
    try {
      // Verificar se há token salvo
      const token = localStorage.getItem('token_painel');
      const usuarioSalvo = localStorage.getItem('usuario_painel');

      if (!token || !usuarioSalvo) {
        setCarregando(false);
        return;
      }

      // Restaurar usuário do localStorage
      const usuarioParsed = JSON.parse(usuarioSalvo) as Usuario;
      setUsuario(usuarioParsed);

      // Buscar organizações
      const organizacoes = await organizacoesApi.listar();
      if (organizacoes && organizacoes.length > 0) {
        setOrganizacao(selecionarOrganizacao(organizacoes));
      }
    } catch (erro) {
      // Se houver erro, limpar sessão
      localStorage.removeItem('token_painel');
      localStorage.removeItem('usuario_painel');
      setUsuario(null);
      setOrganizacao(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carregar sessão ao montar o provider
  useEffect(() => {
    carregarSessao();
  }, [carregarSessao]);

  // ===========================================
  // LOGIN
  // ===========================================

  const login = async (email: string, senha: string) => {
    const resposta = await autenticacaoApi.login({ email, senha });

    // Salvar token e usuário
    localStorage.setItem('token_painel', resposta.token);
    localStorage.setItem('usuario_painel', JSON.stringify(resposta.usuario));

    setUsuario(resposta.usuario);

    // Buscar organizações
    const organizacoes = await organizacoesApi.listar();
    if (organizacoes && organizacoes.length > 0) {
      setOrganizacao(selecionarOrganizacao(organizacoes));
    }
  };

  // ===========================================
  // CADASTRO
  // ===========================================

  const cadastro = async (nome: string, email: string, senha: string) => {
    const resposta = await autenticacaoApi.cadastrar({ nome, email, senha });

    // Salvar token e usuário
    localStorage.setItem('token_painel', resposta.token);
    localStorage.setItem('usuario_painel', JSON.stringify(resposta.usuario));

    setUsuario(resposta.usuario);

    // Buscar organizações (a organização padrão foi criada no cadastro)
    const organizacoes = await organizacoesApi.listar();
    if (organizacoes && organizacoes.length > 0) {
      setOrganizacao(selecionarOrganizacao(organizacoes));
    }
  };

  // ===========================================
  // LOGOUT
  // ===========================================

  const logout = () => {
    localStorage.removeItem('token_painel');
    localStorage.removeItem('usuario_painel');
    localStorage.removeItem('organizacao_painel');
    setUsuario(null);
    setOrganizacao(null);
    router.push('/login');
  };

  // ===========================================
  // RECARREGAR PERFIL
  // ===========================================

  const recarregarPerfil = async () => {
    try {
      const perfil = await autenticacaoApi.obterPerfil();
      setUsuario(perfil);
      localStorage.setItem('usuario_painel', JSON.stringify(perfil));
    } catch (erro) {
      console.error('Erro ao recarregar perfil:', erro);
    }
  };

  // ===========================================
  // RECARREGAR ORGANIZAÇÃO
  // ===========================================

  const recarregarOrganizacao = async () => {
    try {
      const organizacoes = await organizacoesApi.listar();
      if (organizacoes && organizacoes.length > 0) {
        setOrganizacao(selecionarOrganizacao(organizacoes));
      }
    } catch (erro) {
      console.error('Erro ao recarregar organização:', erro);
    }
  };

  const alterarOrganizacao = (organizacaoSelecionada: Organizacao) => {
    setOrganizacao(organizacaoSelecionada);
    localStorage.setItem('organizacao_painel', organizacaoSelecionada.id);
  };

  // ===========================================
  // VALOR DO CONTEXTO
  // ===========================================

  const valor: AuthContextType = {
    usuario,
    organizacao,
    carregando,
    autenticado: !!usuario,
    login,
    cadastro,
    logout,
    recarregarPerfil,
    recarregarOrganizacao,
    alterarOrganizacao,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
