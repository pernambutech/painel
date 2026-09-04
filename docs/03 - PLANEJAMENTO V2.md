# PLANEJAMENTO V2 — EVOLUÇÕES DA PLATAFORMA PAINEL

Documento de planejamento das evoluções da plataforma para a versão 2.0.

---

## 1. VISÃO GERAL

### Objetivo da V2

A V1 resolveu o problema central: **gerenciar projetos e serviços a partir de um único painel**. A V2 evolui para:

- **Segurança robusta** — expiração de tokens, permissões granulares, auditoria
- **Automação inteligente** — fluxos configuráveis, estado desejado, health checks
- **Observabilidade completa** — logs em tempo real, métricas por serviço, notificações
- **Ecossistema aberto** — Docker, webhooks, API documentada, multiusuário

### Princípios de design

| Princípio | Descrição |
|-----------|-----------|
| **Segurança primeiro** | Toda funcionalidade nova deve passar por análise de segurança |
| **Evolução sem quebra** | APIs e contratos devem ser versionados para não quebrar clientes existentes |
| **Modularidade** | Cada funcionalidade deve ser independente e opcional |
| **Simplicidade** | Não exigir conhecimento avançado para usar funcionalidades básicas |
| **Observabilidade** | Toda ação deve ser registrada e rastreável |

### O que muda da V1

| Aspecto | V1 | V2 |
|---------|----|----|
| Autenticação | Token sem expiração | Tokens com expiração + rotação |
| Usuários | Single-user por organização | Multiusuário com RBAC |
| Git | Status + Pull | Fetch, Add, Commit, Push, branches remotas |
| Monitoramento | Status online/offline | Health checks HTTP, métricas, crash loop detection |
| Logs | Visualização básica | Busca, filtros, tempo real, exportação |
| Automação | Manual | Fluxos configuráveis, ações compostas |
| Agentes | PM2 only | PM2 + Docker + SO |
| Segurança | 3 pilares | 8+ pilares |

---

## 2. PRIORIZAÇÃO

### Metodologia

| Nível | Significado | Quando implementar |
|-------|-------------|-------------------|
| 🔴 **ALTA** | Crítico para segurança ou funcionalidade essencial | Fase 1 da V2 |
| 🟡 **MÉDIA** | Importante mas não bloqueante | Fase 2 da V2 |
| 🔵 **BAIXA** | Desejável mas pode esperar | Fase 3+ ou quando houver demanda |

### Resumo por categoria

| Categoria | Total | 🔴 Alta | 🟡 Média | 🔵 Baixa |
|-----------|-------|---------|----------|----------|
| Segurança | 10 | 2 | 5 | 3 |
| Git | 6 | 0 | 3 | 3 |
| Monitoramento | 7 | 1 | 5 | 1 |
| Multi-usuário | 5 | 0 | 3 | 2 |
| Automação | 6 | 1 | 3 | 2 |
| UI/UX | 12 | 1 | 5 | 6 |
| Agente | 8 | 1 | 4 | 3 |
| API/Backend | 8 | 1 | 4 | 3 |
| Infraestrutura | 9 | 1 | 4 | 4 |
| Testes | 3 | 2 | 1 | 0 |
| **TOTAL** | **71** | **10** | **37** | **27** |

### Roadmap sugerido

```
FASE 1 — Segurança + Fundamentos (Semanas 1-4)
├── Tokens com expiração
├── Health checks HTTP
├── Busca/filtros nos logs
├── Variáveis de ambiente
├── Logs em tempo real
├── Backup/restore
├── Testes automatizados
└── Testes de segurança

FASE 2 — Git + Automação + Multiusuário (Semanas 5-10)
├── Git Fetch
├── Fluxos de atualização configuráveis
├── Estado desejado
├── Convites para organização
├── RBAC (papéis)
├── Audit log no agente
├── Ações compostas
├── Presets de serviços
└── Descoberta automática

FASE 3 — Docker + API + Infraestrutura (Semanas 11-16)
├── Adaptador Docker
├── API documentada (OpenAPI)
├── Webhooks
├── Soft delete
├── PM2 abstrato (Strategy)
├── Fallback offline
├── Sincronização de estado
└── CI/CD básico

FASE 4 — Polish + UX (Semanas 17-20)
├── Tema claro
├── Mobile responsivo
├── Dashboard com métricas históricas
├── Exportação de logs
├── Comparação de logs entre ambientes
└── Notificações in-app
```

---

## 3. SEGURANÇA

### 3.1 Tokens com expiração automática 🔴

**Descrição:** Implementar expiração automática dos tokens de autenticação dos agentes, com renovação periódica.

**Por que é necessário:** Atualmente os tokens de agente não expiram. Um token comprometido permaneceria válido indefinidamente.

**Complexidade:** Média
**Dependências:** Nenhuma

### 3.2 Rate Limiting na API 🟡

**Descrição:** Implementar limitação de taxa de requisições para comandos enviados aos agentes e para endpoints sensíveis.

**Por que é necessário:** A API não limita taxa de comandos, o que permite abuso ou ataques de força bruta.

**Complexidade:** Média
**Dependências:** Nenhuma

### 3.3 Audit log no agente 🟡

**Descrição:** Implementar registro local no agente de todas as ações executadas, com timestamp, tipo de comando, resultado e usuário.

**Por que é necessário:** O agente não registra ações executadas localmente. Em caso de incidente, não há como auditar o que aconteceu na máquina.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 3.4 Permissões granulares por usuário (RBAC) 🟡

**Descrição:** Implementar sistema de permissões com perfis: Administrador, Gerente, Desenvolvedor, Visualizador. Cada perfil com conjunto específico de permissões.

**Por que é necessário:** A V1 é single-user por organização. Para times, é necessário controle de acesso granular.

**Complexidade:** Alta
**Dependências:** Convites para organização (4.1)

### 3.5 Rotação de credenciais de agente 🟡

**Descrição:** Permitir rotação periódica dos tokens de autenticação dos agentes, invalidando o token antigo e gerando um novo.

**Por que é necessário:** Reduz a janela de exposição em caso de comprometimento de token.

**Complexidade:** Média
**Dependências:** Tokens com expiração (3.1)

### 3.6 Diretórios autorizados dinâmicos 🟡

**Descrição:** Permitir que os diretórios autorizados sejam configurados remotamente pela API e atualizados no agente em tempo real.

**Por que é necessário:** Atualmente qualquer mudança requer reinício manual do agente.

**Complexidade:** Média
**Dependências:** Nenhuma

### 3.7 Criptografia end-to-end (E2E) 🔵

**Descrição:** Implementar criptografia ponta a ponta na comunicação entre agente e API.

**Por que é necessário:** Em cenários com proxy reverso ou infraestrutura compartilhada, o tráfego pode ficar exposto.

**Complexidade:** Alta
**Dependências:** Nenhuma

### 3.8 Revogação imediata de agentes 🔵

**Descrição:** Ao desativar um agente, invalidar imediatamente o socket ativo, forçando desconexão instantânea.

**Por que é necessário:** Atualmente desativar um agente não invalida o socket ativo.

**Complexidade:** Média
**Dependências:** Nenhuma

### 3.9 Autenticação de dois fatores (2FA) 🔵

**Descrição:** Adicionar suporte a 2FA para login de usuários via TOTP (Google Authenticator, etc).

**Por que é necessário:** Segurança adicional para contas de administradores.

**Complexidade:** Média
**Dependências:** Nenhuma

### 3.10 Bloqueio de IP 🔵

**Descrição:** Implementar bloqueio de endereços IP após múltiplas tentativas de login falhas.

**Por que é necessário:** Proteção contra ataques de força bruta no login.

**Complexidade:** Baixa
**Dependências:** Nenhuma

---

## 4. OPERAÇÕES GIT

### 4.1 Git Fetch (verificação sem download) 🟡

**Descrição:** Implementar git fetch para verificar atualizações disponíveis sem aplicá-las.

**Por que é necessário:** Permitir ao usuário saber se há atualizações antes de decidir fazer pull.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 4.2 Git Add + Commit pelo painel 🟡

**Descrição:** Permitir adicionar arquivos ao stage e criar commits diretamente pela interface.

**Por que é necessário:** Atualmente o Git só permite operações de leitura e pull. Operações de escrita estão pendentes.

**Complexidade:** Alta
**Dependências:** Segurança: validação de comandos

### 4.3 Branches remotas 🟡

**Descrição:** Mostrar branches remotas além das locais, com indicação de tracking.

**Por que é necessário:** O modal de branches lista apenas branches locais. Não mostra branches remotas não baixadas.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 4.4 Detecção de conflitos de merge 🟡

**Descrição:** Verificar automaticamente se um pull resultará em conflitos e alertar o usuário antes de executar.

**Por que é necessário:** "Git pull com conflito" é um cenário listado no planejamento como deve ser considerado.

**Complexidade:** Média
**Dependências:** Git Fetch (4.1)

### 4.5 Git Push pelo painel 🔵

**Descrição:** Permitir enviar commits para o repositório remoto.

**Por que é necessário:** Completar o ciclo de vida Git. Atualmente o fluxo é pull-only.

**Complexidade:** Média
**Dependências:** Git Add + Commit (4.2)

### 4.6 Git Reset / Checkout forçado 🔵

**Descrição:** Permitir voltar para um estado anterior com proteções adicionais (confirmação dupla, preview de impacto).

**Por que é necessário:** Operações sensíveis que precisam de UX especial.

**Complexidade:** Média
**Dependências:** Nenhuma

---

## 5. MONITORAMENTO / HEALTH CHECKS

### 5.1 Health checks HTTP configuráveis 🔴

**Descrição:** Permitir ao usuário configurar um endpoint de health check para cada serviço (ex: `/api/health`), com verificação periódica de status HTTP.

**Por que é necessário:** Um processo pode estar ativo mas a aplicação indisponível. Atualmente só se verifica se o processo PM2 está online.

**Complexidade:** Média
**Dependências:** Nenhuma

### 5.2 Verificação de disponibilidade de porta 🟡

**Descrição:** Consultar se uma porta está em uso, qual processo a utiliza, e se corresponde ao serviço esperado.

**Por que é necessário:** Detectar conflitos de porta e processos "fantasma".

**Complexidade:** Baixa
**Dependências:** Parse de portas (já implementado no agente)

### 5.3 Métricas de CPU e memória por serviço 🟡

**Descrição:** Exibir uso de CPU e memória individual de cada processo PM2, não apenas da máquina.

**Por que é necessário:** Atualmente o heartbeat envia métricas da máquina inteira. Não há métricas por serviço.

**Complexidade:** Média
**Dependências:** Nenhuma

### 5.4 Detecção de loop de restart infinito 🟡

**Descrição:** Identificar quando um serviço está reiniciando repetidamente (crash loop) e alertar o usuário com contexto.

**Por que é necessário:** "Serviço reinicia repetidamente" é um cenário listado no planejamento.

**Complexidade:** Média
**Dependências:** Métricas por serviço (5.3)

### 5.5 Estilos de status expandidos 🟡

**Descrição:** Implementar estados além de online/stopped/errored: INICIANDO, PARANDO, REINICIANDO, DESCONHECIDO, DESCONECTADO.

**Por que é necessário:** Diferenciar "processo online" de "aplicação saudável".

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 5.6 Verificação de diretório do serviço 🟡

**Descrição:** Verificar se o diretório configurado existe na máquina remota antes de iniciar um serviço.

**Por que é necessário:** "Diretório alterado" é um cenário que deve ser considerado. Atualmente o serviço falha silenciosamente.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 5.7 Verificação de disponibilidade do PM2 🔵

**Descrição:** Alertar quando o PM2 não está disponível ou instalado no ambiente.

**Por que é necessário:** "PM2 indisponível" é um cenário listado no planejamento.

**Complexidade:** Baixa
**Dependências:** Nenhuma

---

## 6. MULTI-USUÁRIO / PERMISSÕES

### 6.1 Convites para organização 🟡

**Descrição:** Permitir que o proprietário da organização convide outros usuários por email, com níveis de permissão.

**Por que é necessário:** A V1 só possui usuário proprietário. Para times, é necessário invite.

**Complexidade:** Média
**Dependências:** Nenhuma

### 6.2 Papéis e funções (RBAC) 🟡

**Descrição:** Implementar perfis: Administrador, Gerente, Desenvolvedor, Visualizador. Cada perfil com conjunto de permissões.

**Por que é necessário:** Evitar que todos os membros tenham acesso total.

**Complexidade:** Alta
**Dependências:** Convites para organização (6.1)

### 6.3 Histórico de auditoria por usuário 🟡

**Descrição:** Filtrar e exibir histórico de ações por usuário específico, com timestamp e detalhes.

**Por que é necessário:** Diferenciar "histórico operacional" de "auditoria de ações de usuários".

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 6.4 Acesso limitado a projetos 🔵

**Descrição:** Permitir que um membro tenha acesso apenas a projetos específicos dentro da organização.

**Por que é necessário:** "Acesso limitado a projetos" listado como evolução futura do usuário.

**Complexidade:** Alta
**Dependências:** RBAC (6.2)

### 6.5 Acesso limitado a ambientes 🔵

**Descrição:** Restringir quais ambientes um membro pode visualizar e controlar.

**Por que é necessário:** "Acesso limitado a ambientes" listado como evolução futura do usuário.

**Complexidade:** Alta
**Dependências:** RBAC (6.2)

---

## 7. AUTOMAÇÃO / WORKFLOWS

### 7.1 Fluxos de atualização configuráveis 🔴

**Descrição:** Permitir ao usuário definir sequências de ações pós-pull: instalar dependências, executar build, migrations, reiniciar serviço.

**Por que é necessário:** Atualmente o pull é isolado. O sistema deverá permitir "fluxos configuráveis".

**Complexidade:** Alta
**Dependências:** Nenhuma

### 7.2 Ações compostas personalizadas 🟡

**Descrição:** Criar e salvar sequências de ações reutilizáveis (ex: "ATUALIZAR BACKEND" = git pull + npm install + npm run build + migration + restart).

**Por que é necessário:** Listado explicitamente como funcionalidade futura no planejamento.

**Complexidade:** Média
**Dependências:** Fluxos de atualização (7.1)

### 7.3 Estado desejado vs estado real 🟡

**Descrição:** Permitir ao usuário definir o estado desejado de cada serviço (DEVE ESTAR ONLINE) e detectar divergências automaticamente.

**Por que é necessário:** "O sistema deverá considerar futuramente o conceito de estado desejado."

**Complexidade:** Média
**Dependências:** Health checks (5.1)

### 7.4 Git fetch periódico + notificação 🟡

**Descrição:** Verificar periodicamente se há atualizações no repositório remoto e notificar o usuário.

**Por que é necessário:** Permitir ao usuário saber quando há código novo disponível sem ação manual.

**Complexidade:** Média
**Dependências:** Git Fetch (4.1), Notificações (8.6)

### 7.5 Reconciliação automática 🔵

**Descrição:** Quando o estado real difere do estado desejado, o sistema pode sugerir ou executar automaticamente a correção.

**Por que é necessário:** Evolução natural do estado desejado.

**Complexidade:** Alta
**Dependências:** Estado desejado (7.3)

### 7.6 Rollback automático 🔵

**Descrição:** Se um serviço falhar após uma atualização, reverter automaticamente para a versão anterior.

**Por que é necessário:** Segurança operacional.

**Complexidade:** Alta
**Dependências:** Git (4.x)

---

## 8. UI/UX

### 8.1 Busca e filtros nos logs 🔴

**Descrição:** Implementar busca por texto, filtros por período, por nível (info/warn/error), e por fonte (stdout/stderr).

**Por que é necessário:** "Futuramente: busca, filtros, logs centralizados, retenção configurável, exportação."

**Complexidade:** Média
**Dependências:** Nenhuma

### 8.2 Logs em tempo real via WebSocket 🔴

**Descrição:** Enviar logs dos serviços em tempo real para o painel via WebSocket, sem necessidade de polling.

**Por que é necessário:** O contrato `LogTempoReal` já existe em `packages/contratos` mas não está implementado.

**Complexidade:** Alta
**Dependências:** WebSocket (já implementado)

### 8.3 Variáveis de ambiente no agente 🔴

**Descrição:** Permitir configurar e injetar variáveis de ambiente nos serviços via painel, sem editar arquivos `.env` manualmente.

**Por que é necessário:** "Variáveis de ambiente" listadas como propriedade de serviço no planejamento.

**Complexidade:** Média
**Dependências:** Nenhuma

### 8.4 Presets de serviços (templates) 🟡

**Descrição:** Oferecer modelos pré-configurados ao criar um serviço: Next.js, NestJS, Node.js, Python, FastAPI, Django. Sugerir comandos, portas e configurações comuns.

**Por que é necessário:** "O sistema poderá futuramente oferecer modelos."

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 8.5 Descoberta automática de projetos 🟡

**Descrição:** O agente analisa diretórios e detecta automaticamente projetos, identificando arquivos como `package.json`, `requirements.txt`, `Dockerfile`.

**Por que é necessário:** "Uma possibilidade importante para o produto é permitir que o agente ajude a descobrir projetos."

**Complexidade:** Média
**Dependências:** Nenhuma

### 8.6 Notificações in-app 🟡

**Descrição:** Implementar sistema de notificações in-app para alertar sobre: agente desconectado, serviço com erro, heartbeat perdido.

**Por que é necessário:** O sininho de notificações já existe na topbar mas mostra apenas ambientes offline.

**Complexidade:** Média
**Dependências:** WebSocket (já implementado)

### 8.7 Operações em lote por ambiente 🟡

**Descrição:** Permitir iniciar/parar/reiniciar todos os serviços de um ambiente de uma vez.

**Por que é necessário:** Para equipes com múltiplos projetos no mesmo ambiente.

**Complexidade:** Baixa
**Dependências:** Operações em lote por projeto (já implementado)

### 8.8 Logs centralizados (multi-serviço) 🟡

**Descrição:** Visualizar logs de múltiplos serviços de um projeto em uma única tela, com indicação de origem.

**Por que é necessário:** "Logs centralizados" listado como funcionalidade futura.

**Complexidade:** Média
**Dependências:** Logs em tempo real (8.2)

### 8.9 Exportação de logs 🔵

**Descrição:** Permitir exportar logs em formato TXT, JSON ou CSV.

**Por que é necessário:** "Exportação" listado como funcionalidade futura.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 8.10 Tema claro (light theme) 🔵

**Descrição:** Implementar suporte a tema claro, além do tema escuro atual.

**Por que é necessário:** Preparar o design system para tema claro futuro.

**Complexidade:** Média
**Dependências:** Design system consolidado

### 8.11 Dashboard com métricas históricas 🔵

**Descrição:** Exibir gráficos de uptime, número de reinícios ao longo do tempo, e disponibilidade dos serviços.

**Por que é necessário:** Preparar área para métricas futuras.

**Complexidade:** Alta
**Dependências:** Métricas por serviço (5.3)

### 8.12 Visualização mobile responsiva 🔵

**Descrição:** Adaptar a interface para uso em dispositivos móveis com sidebar recolhida e navegação simplificada.

**Por que é necessário:** "Também criar comportamento para tablet e mobile."

**Complexidade:** Média
**Dependências:** Design system consolidado

---

## 9. CAPACIDADES DO AGENTE

### 9.1 Adaptador Docker 🟡

**Descrição:** Implementar um adaptador de processos para Docker/Docker Compose, seguindo a interface `IAdaptadorProcessos` já definida.

**Por que é necessário:** "A arquitetura deverá permitir futuramente: Adaptador Docker." A interface já existe em `packages/contratos`.

**Complexidade:** Alta
**Dependências:** Nenhuma

### 9.2 Detecção de conflitos de porta 🟡

**Descrição:** Antes de iniciar um serviço, verificar se a porta está livre e alertar sobre conflitos.

**Por que é necessário:** "Detectar conflito" listado como funcionalidade desejada.

**Complexidade:** Baixa
**Dependências:** Parse de portas (já implementado)

### 9.3 Health check do agente 🟡

**Descrição:** O agente verificar automaticamente a saúde dos serviços que gerencia e reportar status detalhado.

**Por que é necessário:** Módulo `health-check/` já listado na estrutura conceitual do agente.

**Complexidade:** Média
**Dependências:** Health checks HTTP (5.1)

### 9.4 Atualização remota do agente 🟡

**Descrição:** Permitir que o agente seja atualizado remotamente pelo painel, sem acesso físico à máquina.

**Por que é necessário:** Para manutenção de múltiplos agentes em produção.

**Complexidade:** Alta
**Dependências:** Segurança: autenticação robusta

### 9.5 Auto-descoberta de projetos 🟡

**Descrição:** O agente escaneia diretórios configurados e identifica projetos automaticamente, sugerindo estrutura de serviços.

**Por que é necessário:** Módulo `descoberta/` já listado na estrutura conceitual do agente.

**Complexidade:** Média
**Dependências:** Nenhuma

### 9.6 Adaptador Sistema Operacional (raw) 🔵

**Descrição:** Implementar um adaptador que execute comandos diretamente no sistema operacional, sem PM2.

**Por que é necessário:** Listado como "Adaptador Sistema Operacional" no futuro.

**Complexidade:** Alta
**Dependências:** Nenhuma

### 9.7 Scripts personalizados 🔵

**Descrição:** Permitir ao usuário definir scripts customizados que o agente pode executar (ex: "rodar migration", "limpar cache").

**Por que é necessário:** "Executar script personalizado" listado como tipo de ação. Requer controles de segurança rigorosos.

**Complexidade:** Média
**Dependências:** Segurança: whitelist de comandos

### 9.8 Fallback offline 🔵

**Descrição:** Quando o agente perde conexão com a API, continuar monitorando serviços localmente e sincronizar quando reconectar.

**Por que é necessário:** "A solução deve funcionar mesmo quando a máquina estiver atrás de NAT."

**Complexidade:** Alta
**Dependências:** Sincronização de estado (10.5)

---

## 10. API / BACKEND

### 10.1 Backup e restore do banco 🔴

**Descrição:** Implementar backup automático do banco de dados com possibilidade de restore.

**Por que é necessário:** Segurança dos dados. Sem backup, um problema no banco pode causar perda total.

**Complexidade:** Média
**Dependências:** Nenhuma

### 10.2 API pública documentada (OpenAPI/Swagger) 🟡

**Descrição:** Gerar documentação automática da API com OpenAPI/Swagger para permitir integrações externas.

**Por que é necessário:** Facilitar uso avançado e integrações futuras.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 10.3 Paginação server-side 🟡

**Descrição:** Implementar paginação server-side em todas as listagens (projetos, serviços, histórico).

**Por que é necessário:** Atualmente o `listarPorOrganizacao` retorna todos os registros. Para grandes volumes, isso é um problema.

**Complexidade:** Média
**Dependências:** Nenhuma

### 10.4 Filtros avançados nas listagens 🟡

**Descrição:** Adicionar filtros por status, ambiente, projeto, período nas listagens de serviços e histórico.

**Por que é necessário:** "Adicionar busca, filtros, ordenação" na tela de projetos.

**Complexidade:** Média
**Dependências:** Paginação (10.3)

### 10.5 Comandos em lote na API 🟡

**Descrição:** Criar endpoint que permite enviar comandos para múltiplos serviços ou agentes em uma única requisição.

**Por que é necessário:** Atualmente as operações em lote são feitas no frontend com `Promise.allSettled`. Seria mais eficiente no backend.

**Complexidade:** Média
**Dependências:** Nenhuma

### 10.6 Soft delete 🟡

**Descrição:** Implementar exclusão lógica (soft delete) para projetos, serviços e ambientes, mantendo dados para auditoria.

**Por que é necessário:** "Soft delete quando fizer sentido" listado como requisito do banco.

**Complexidade:** Média
**Dependências:** Nenhuma

### 10.7 Webhooks para eventos 🔵

**Descrição:** Permitir que o usuário configure webhooks para receber notificações em serviços externos (Slack, Discord, Telegram).

**Por que é necessário:** Integração com ferramentas de comunicação existentes.

**Complexidade:** Média
**Dependências:** Nenhuma

### 10.8 Versionamento de API (v1, v2) 🔵

**Descrição:** Implementar versionamento na URL da API para permitir evolução sem quebrar clientes existentes.

**Por que é necessário:** Boa prática para APIs que servem clientes de diferentes versões.

**Complexidade:** Média
**Dependências:** Nenhuma

---

## 11. INFRAESTRUTURA

### 11.1 Gerenciador de processos abstrato (Strategy) 🟡

**Descrição:** A abstração `IAdaptadorProcessos` já existe. Implementar formalmente o padrão Strategy para permitir troca entre PM2, Docker e SO.

**Por que é necessário:** A interface já está definida em `packages/contratos`.

**Complexidade:** Média
**Dependências:** Adaptador Docker (9.1)

### 11.2 Persistência automática do PM2 🟡

**Descrição:** Configurar `pm2 save` automático em intervalos periódicos, não apenas manual.

**Por que é necessário:** Atualmente o usuário precisa clicar manualmente em "Salvar PM2".

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 11.3 Health check do banco de dados 🟡

**Descrição:** Monitorar conectividade e performance do PostgreSQL, exibindo status no dashboard.

**Por que é necessário:** Infraestrutura crítica. Se o banco cair, toda a plataforma fica inoperante.

**Complexidade:** Baixa
**Dependências:** Nenhuma

### 11.4 Métricas de performance da API 🟡

**Descrição:** Monitorar tempo de resposta, throughput e erros da API central.

**Por que é necessário:** Observabilidade do sistema. Identificar gargalos.

**Complexidade:** Média
**Dependências:** Nenhuma

### 11.5 Sincronização de estado 🟡

**Descrição:** Quando o agente reconecta, sincronizar o estado real dos processos com o banco de dados, corrigindo divergências.

**Por que é necessário:** "Sincronização de estado" listado como ponto a analisar na arquitetura.

**Complexidade:** Média
**Dependências:** Fallback offline (9.8)

### 11.6 Docker Compose support 🔵

**Descrição:** Detectar e gerenciar serviços via `docker-compose.yml`, incluindo start, stop, logs e status.

**Por que é necessário:** `docker-compose.yml` listado como arquivo detectável na descoberta automática.

**Complexidade:** Alta
**Dependências:** Adaptador Docker (9.1)

### 11.7 Suporte a múltiplos PM2 por ambiente 🔵

**Descrição:** Permitir que um ambiente possua múltiplas instâncias PM2 (ex: PM2 para Node.js e outro processo para Python).

**Por que é necessário:** Em ambientes mistos, pode ser necessário isolar processos por tecnologia.

**Complexidade:** Alta
**Dependências:** Nenhuma

### 11.8 Testes automatizados 🔴

**Descrição:** Criar suite de testes para a API, agente e frontend, cobrindo fluxos críticos.

**Por que é necessário:** Garantir qualidade do código e prevenir regressões.

**Complexidade:** Alta
**Dependências:** Nenhuma

### 11.9 Testes de segurança automatizados 🔴

**Descrição:** Implementar testes automatizados para validar as camadas de segurança (diretórios autorizados, whitelist, proteção contra execução arbitrária).

**Por que é necessário:** Os testes manuais estão documentados no Relatório de Segurança V1.1, mas não são automatizados.

**Complexidade:** Média
**Dependências:** Testes automatizados (11.8)

### 11.10 CI/CD básico 🟡

**Descrição:** Configurar pipeline de integração contínua para executar lint, testes e build automaticamente.

**Por que é necessário:** Garantir qualidade do código em cada commit.

**Complexidade:** Média
**Dependências:** Testes automatizados (11.8)

---

## 12. DECISÕES PENDENTES

Antes de iniciar a implementação da V2, as seguintes decisões devem ser tomadas:

### 12.1 Autenticação de agentes

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **JWT com expiração + refresh token** | Padrão de mercado, seguro | Complexidade de implementação |
| **Token longo com rotação manual** | Simples | Menos seguro |
| **Mutual TLS (mTLS)** | Máxima segurança | Complexidade de infraestrutura |

**Recomendação:** JWT com expiração + refresh token

### 12.2 RBAC — Perfis de usuário

| Perfil | Permissões |
|--------|-----------|
| **Administrador** | Tudo + gerenciar membros |
| **Gerente** | Tudo exceto gerenciar membros |
| **Desenvolvedor** | Iniciar/parar/reiniciar, Git, Logs |
| **Visualizador** | Apenas visualizar |

### 12.3 Fluxos de atualização

| Abordagem | Vantagens | Desvantagens |
|-----------|-----------|--------------|
| **UI visual (blocos arrastáveis)** | Intuitivo | Complexo de implementar |
| **Formulário com checkboxes** | Simples | Menos flexível |
| **YAML/JSON editável** | Poderoso | Requer conhecimento técnico |

**Recomendação:** Formulário com checkboxes (V2), evoluir para UI visual (V3)

### 12.4 Adaptadores de processos

| Adaptador | Prioridade | Esforço |
|-----------|-----------|---------|
| PM2 (já implementado) | ✅ Pronto | — |
| Docker | Média | Alto |
| Sistema Operacional | Baixa | Médio |

### 12.5 Estratégia de testes

| Tipo | Ferramenta sugerida | Cobertura mínima |
|------|--------------------|--------------------|
| Unitários (API) | Jest | 70% |
| Unitários (Agente) | Jest | 70% |
| Integração | Supertest | Fluxos críticos |
| E2E | Playwright | Login, CRUD básico |
| Segurança | Testes customizados | 3 pilares V1.1 |

---

## 13. MÉTRAS DE SUCESSO DA V2

| Métrica | Meta |
|---------|------|
| Cobertura de testes | ≥ 70% |
| Tempo de resposta da API | < 200ms (p95) |
| Disponibilidade | ≥ 99.5% |
| Tempo médio de recuperação (MTTR) | < 5 minutos |
| Usuários simultâneos suportados | ≥ 50 |
| Agentes conectados | ≥ 100 |

---

## 14. RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Complexidade do RBAC | Alto | Implementar incrementalmente, começar com 2 perfis |
| Adaptador Docker | Alto | Reutilizar interface existente, testar exaustivamente |
| Migração de banco (soft delete) | Médio | Scripts de migração com rollback |
| Breaking changes na API | Alto | Versionamento desde o início |
| Segurança em scripts personalizados | Alto | Whitelist rigorosa, sandboxing |

---

## 15. REFERÊNCIAS

- `docs/00 - PLANEJAMENTO DO PRODUTO` — Visão original do produto
- `docs/01 - RELATORIO DE SEGURANÇA V1.1` — Vulnerabilidades restantes
- `docs/01 - PLANO_DE_DESENVOLVIMENTO` — Estrutura técnica
- `docs/02 - GUIA DE USO DO PAINEL` — Documentação do usuário
- `packages/contratos/src/adaptador-processos.ts` — Interface pronta para evolução
- `packages/contratos/src/comunicacao.ts` — Contratos de comunicação

---

*Documento atualizado em setembro de 2026.*
