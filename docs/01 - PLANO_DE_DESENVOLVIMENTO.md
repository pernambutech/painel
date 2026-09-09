# PLANO DE DESENVOLVIMENTO

# PLATAFORMA DE GERENCIAMENTO CENTRALIZADO DE PROJETOS E SERVIÇOS

## 1. INSTRUÇÃO PRINCIPAL PARA O AGENTE DE IA

Leia integralmente este documento antes de realizar qualquer alteração no projeto.

Este arquivo é o plano mestre de desenvolvimento da plataforma.

Você deverá seguir as etapas na ordem definida.

IMPORTANTE:

- Não pule etapas.
- Não avance automaticamente para a próxima etapa.
- Ao concluir uma etapa, apresente um resumo do que foi feito.
- Aguarde minha autorização antes de continuar.
- Não altere a arquitetura sem explicar e obter aprovação.
- Não implemente funcionalidades futuras antes do momento definido.
- Priorize simplicidade, segurança, organização e escalabilidade.
- Todo o projeto deve utilizar português do Brasil quando isso não conflitar com convenções técnicas obrigatórias.
- Comentários no código devem ser em português.
- Documentação deve ser em português.
- Mensagens internas voltadas ao usuário devem ser em português.
- Nomes de domínio devem ser claros e consistentes.
- Não crie código desnecessário.
- Não faça abstrações excessivas prematuramente.

Antes de iniciar cada etapa, informe:

1. Qual etapa será executada.
2. Qual objetivo da etapa.
3. Quais arquivos serão criados ou alterados.
4. Quais decisões técnicas serão aplicadas.

Após concluir cada etapa, informe:

1. O que foi implementado.
2. Arquivos criados.
3. Arquivos alterados.
4. Decisões tomadas.
5. Como testar.
6. Pendências.
7. Sugestão da próxima etapa.

Não avance para a próxima etapa sem minha autorização explícita.

---

# 2. VISÃO DO PRODUTO

O produto será uma plataforma centralizada para gerenciar projetos e serviços executados em diferentes máquinas e ambientes.

A plataforma será inicialmente voltada para:

- Desenvolvedores individuais.
- Freelancers.
- Pequenas software houses.
- Pequenas equipes de desenvolvimento.

O objetivo é permitir que o usuário controle múltiplos projetos a partir de uma única interface.

A plataforma deverá permitir, inicialmente:

- Organizar projetos.
- Organizar serviços.
- Controlar processos.
- Iniciar serviços.
- Parar serviços.
- Reiniciar serviços.
- Visualizar status.
- Visualizar logs.
- Trabalhar com múltiplos ambientes.
- Conectar máquinas através de agentes.
- Executar operações Git controladas.
- Atualizar projetos.
- Monitorar o estado dos serviços.
- Registrar histórico de ações.

---

# 3. PROBLEMA PRINCIPAL

Atualmente, o gerenciamento de vários projetos pode exigir:

```text
Terminal 1 → Frontend
Terminal 2 → Backend
Terminal 3 → Worker
Terminal 4 → Outro projeto
Terminal 5 → Logs
```

Cada projeto pode possuir:

- Diretórios diferentes.
- Portas diferentes.
- Comandos diferentes.
- Tecnologias diferentes.
- Processos diferentes.
- Ambientes diferentes.

Exemplo:

```text
Projeto A
├── Frontend
├── Backend
└── Worker

Projeto B
├── Frontend
└── API
```

Cada serviço pode possuir comandos como:

```text
npm run dev
npm run start
npm run start:dev
pnpm dev
yarn dev
python main.py
```

A plataforma deve centralizar esse gerenciamento.

---

# 4. PROPOSTA DE VALOR

A plataforma deve permitir:

> Centralizar projetos, ambientes e serviços em um único painel, permitindo executar, parar, reiniciar, monitorar, atualizar e organizar aplicações sem depender do gerenciamento manual de múltiplos terminais, máquinas e comandos.

A plataforma deve ocupar uma posição entre:

```text
GERENCIAMENTO MANUAL
Terminal + PM2 + Git
        ↓
PLATAFORMA CENTRALIZADA
        ↓
FERRAMENTAS COMPLEXAS DE DEVOPS
```

O objetivo não é inicialmente criar:

- Kubernetes.
- Plataforma corporativa completa de CI/CD.
- Ferramenta avançada de observabilidade.
- Plataforma complexa de containers.

O foco é resolver bem o gerenciamento operacional de projetos.

---

# 5. ARQUITETURA CONCEITUAL

A plataforma será composta inicialmente por:

```text
USUÁRIO
    ↓
PAINEL WEB
    ↓
API CENTRAL
    ↓
BANCO DE DADOS
    ↓
COMUNICAÇÃO COM AGENTES
    ↓
AGENTES INSTALADOS NAS MÁQUINAS
    ↓
CAMADA DE GERENCIAMENTO DE PROCESSOS
    ↓
PM2
    ↓
SERVIÇOS DOS PROJETOS
```

Os principais componentes são:

## Painel Web

Responsável por:

- Interface do usuário.
- Dashboard.
- Projetos.
- Serviços.
- Ambientes.
- Agentes.
- Logs.
- Histórico.
- Configurações.

## API Central

Responsável por:

- Regras de negócio.
- Autenticação.
- Autorização.
- Organizações.
- Projetos.
- Serviços.
- Ambientes.
- Comunicação com agentes.
- Processamento de comandos.
- Histórico.
- Auditoria.

## Banco de Dados

Responsável por persistir:

- Usuários.
- Organizações.
- Projetos.
- Serviços.
- Ambientes.
- Agentes.
- Configurações.
- Execuções.
- Histórico.
- Eventos.

## Agente

Software instalado em máquinas ou servidores.

Responsável por:

- Conectar-se à plataforma.
- Receber comandos estruturados.
- Validar comandos.
- Executar ações autorizadas.
- Consultar processos.
- Interagir com PM2.
- Interagir com Git.
- Consultar portas.
- Consultar diretórios.
- Obter logs.
- Informar estado da máquina.

## Camada de Gerenciamento de Processos

A plataforma utilizará PM2 inicialmente.

Porém, o restante da arquitetura não deve depender diretamente do PM2.

A arquitetura deverá permitir futuramente:

```text
Gerenciador de Processos
        │
        ├── Adaptador PM2
        ├── Adaptador Docker
        └── Outros adaptadores futuros
```

---

# 6. ENTIDADES PRINCIPAIS

A primeira versão deverá trabalhar conceitualmente com:

## Organização

Representa uma empresa, equipe ou espaço de trabalho principal.

Possui:

- Usuários.
- Projetos.
- Ambientes.
- Configurações.

## Usuário

Pessoa que utiliza a plataforma.

## Ambiente

Representa uma máquina ou local onde serviços podem ser executados.

Exemplos:

```text
Notebook de Desenvolvimento
VPS de Produção
Servidor de Homologação
Servidor Local
```

## Agente

Software instalado em um ambiente.

## Projeto

Agrupamento lógico de serviços relacionados.

Exemplo:

```text
Sistema de Chamados
```

## Serviço

Uma aplicação executável.

Exemplos:

```text
Frontend
Backend
API
Worker
Bot
Crawler
Agendador
```

## Processo

Representa a execução real de um serviço.

Exemplo:

```text
Backend
PID: 15432
Status: ONLINE
```

## Execução

Representa uma ação executada.

Exemplo:

```text
REINICIAR_SERVICO
```

## Histórico

Registro de eventos e ações.

---

# 7. DIFERENÇA ENTRE OS PRINCIPAIS CONCEITOS

## Projeto

Agrupa serviços relacionados.

Exemplo:

```text
Sistema de Chamados
├── Frontend
├── Backend
└── Worker
```

## Serviço

Define uma aplicação que pode ser executada.

Exemplo:

```text
Backend
```

Possui configuração como:

- Diretório.
- Comando.
- Porta.
- Variáveis de ambiente.
- Health check.

## Processo

É a execução concreta de um serviço.

Exemplo:

```text
Backend
Status: ONLINE
PID: 15432
```

## Ambiente

É a máquina onde o processo executa.

Exemplo:

```text
VPS Produção
```

## Agente

É o software instalado no ambiente que permite à plataforma controlar a máquina.

## Execução

Representa uma ação solicitada.

Exemplo:

```text
REINICIAR_BACKEND
```

---

# 8. PAPEL DO PM2

O PM2 será utilizado inicialmente para gerenciamento de processos.

A plataforma deverá permitir operações como:

```text
INICIAR
PARAR
REINICIAR
STATUS
LOGS
```

A interface não deve obrigar o usuário a utilizar comandos do PM2.

Exemplo:

```text
[ INICIAR ]
[ PARAR ]
[ REINICIAR ]
[ VER LOGS ]
```

O agente deverá realizar a operação correspondente.

A arquitetura deve evitar acoplamento irreversível ao PM2.

---

# 9. MODELO DE COMANDOS

O painel nunca deve enviar comandos de terminal arbitrários diretamente para o agente.

A comunicação deve utilizar comandos estruturados.

Exemplos:

```text
INICIAR_SERVICO
PARAR_SERVICO
REINICIAR_SERVICO
OBTER_STATUS_SERVICO
OBTER_LOGS_SERVICO
VERIFICAR_GIT
EXECUTAR_GIT_PULL
```

Cada comando deve possuir:

- Identificador único.
- Tipo.
- Organização.
- Ambiente.
- Projeto.
- Serviço, quando necessário.
- Dados necessários.
- Data de criação.
- Status.
- Resultado.
- Erro, quando existir.

Estados possíveis:

```text
PENDENTE
ENVIADA
EM_EXECUCAO
SUCESSO
FALHOU
CANCELADA
EXPIRADA
```

---

# 10. ESTADO DESEJADO E ESTADO REAL

O sistema deverá trabalhar conceitualmente com:

## Estado desejado

Exemplo:

```text
Backend deve estar ONLINE
```

## Estado real

Exemplo:

```text
Backend está OFFLINE
```

A plataforma deverá permitir identificar diferenças.

Exemplo:

```text
ESTADO DESEJADO
ONLINE

ESTADO REAL
OFFLINE

SITUAÇÃO
DIVERGENTE
```

Na V1, a reconciliação automática pode ser limitada.

A arquitetura deve permitir evolução futura.

---

# 11. SEGURANÇA

Segurança é parte fundamental do produto.

O fluxo deve ser:

```text
USUÁRIO
    ↓
SOLICITA AÇÃO
    ↓
PLATAFORMA VALIDA
    ↓
PERMISSÃO É VERIFICADA
    ↓
COMANDO ESTRUTURADO É CRIADO
    ↓
AGENTE RECEBE
    ↓
AGENTE VALIDA
    ↓
AÇÃO É EXECUTADA
```

Nunca permitir:

```text
Usuário digita comando arbitrário
        ↓
Agente executa diretamente
```

A V1 deve possuir:

- Autenticação de usuários.
- Autenticação independente dos agentes.
- Autorização.
- Registro de ações.
- Tokens revogáveis.
- Comunicação segura.
- Validação de comandos.
- Validação de parâmetros.
- Diretórios autorizados.

---

# 12. MULTI-TENANT

A plataforma deve ser preparada para múltiplas organizações.

Exemplo:

```text
ORGANIZAÇÃO A
├── Usuários
├── Ambientes
├── Projetos
└── Serviços

ORGANIZAÇÃO B
├── Usuários
├── Ambientes
├── Projetos
└── Serviços
```

Os dados devem ser isolados por organização.

A V1 deve começar simples.

---

# 13. FUNCIONALIDADES DA V1

A V1 deve possuir:

## Autenticação

- Criar conta.
- Login.
- Logout.
- Sessão segura.

## Organização

- Criar organização inicial.
- Usuário proprietário.

## Ambientes

- Criar ambiente.
- Registrar agente.
- Visualizar status.
- Online.
- Offline.
- Soft delete (deletadoEm para auditoria).

## Projetos

- Criar projeto.
- Editar projeto.
- Visualizar projeto.
- Arquivar projeto (soft delete com deletadoEm).
- Reativar projeto.

## Serviços

- Criar serviço.
- Editar serviço.
- Definir diretório.
- Definir comando.
- Definir porta.
- Associar ambiente.
- Variáveis de ambiente por serviço.
- Health check configurável por serviço (URL de health check).
- Verificar porta disponível (endpoint com agente).
- Verificar existência de diretório (endpoint com agente).
- Soft delete (deletadoEm para auditoria).

## Processos

- Iniciar.
- Parar.
- Reiniciar.
- Consultar status.
- Estados expandidos: online, offline, iniciando, parando, reiniciando, erro, desconhecido.
- Métricas: PID, uptime, reinícios, CPU, memória.

## PM2

- Utilização através do agente.
- Não expor PM2 diretamente na arquitetura do painel.
- Salvar processos (PM2 Save).

## Git

- Consultar status.
- Consultar branch.
- Executar Git Pull.
- Listar commits recentes.
- Listar branches.
- Checkout por hash.
- Checkout por branch.

## Logs

- Visualizar logs básicos dos serviços.
- Visualização estilo terminal.
- Timestamps com parseamento robusto (DD/MM/YYYY, ISO 8601).
- Filtro por nível (info, warn, error).
- Remoção de códigos ANSI.

## Histórico

- Registrar ações importantes.

## Dashboard

Visualizar:

- Projetos.
- Serviços online.
- Serviços parados.
- Serviços com erro.
- Ambientes.
- Agentes offline.

## Configurações

- Aba Geral: Preferências de aparência (tema, layout, densidade, idioma).
- Aba Segurança: Senha, autenticação, sessões.
- Aba Notificações: Configurações de alertas.
- Aba Integrações: Configurações de agentes.
- Persistência de preferências no banco de dados (campo JSON na tabela organizacoes).

## Health Check

- Verificação HTTP de saúde do serviço.
- Exibição do status saudável/instável.
- Tempo de resposta.
- Código de status HTTP.

## Verificações

- Verificar porta disponível (net.createServer).
- Verificar existência de diretório.
- Contagem de arquivos no diretório.

---

# 14. FORA DO ESCOPO INICIAL

Não implementar inicialmente:

- Kubernetes.
- CI/CD completo.
- Docker avançado.
- Marketplace.
- Billing.
- Inteligência artificial.
- Observabilidade corporativa.
- Sistema complexo de alertas.
- Rollback automático.
- Execução arbitrária de shell.
- Integrações excessivas.

---

# 15. STACK TECNOLÓGICA RECOMENDADA

A arquitetura deve utilizar inicialmente:

## Monorepo

Utilizar:

```text
pnpm workspaces
```

ou ferramenta equivalente recomendada.

Estrutura esperada:

```text
apps/
    painel-web/
    api-central/
    agente/

packages/
    contratos/
    tipos/
    configuracoes/
```

## Painel Web

Utilizar:

```text
Next.js
TypeScript
React
```

Para interface:

```text
Tailwind CSS
```

A escolha de biblioteca de componentes deve priorizar:

- Acessibilidade.
- Facilidade.
- Manutenção.
- Interface moderna.

## API Central

Utilizar:

```text
Node.js
TypeScript
NestJS
```

A arquitetura deve ser modular.

## Banco de Dados

Utilizar:

```text
PostgreSQL
```

ORM recomendado:

```text
Prisma
```

## Agente

Utilizar:

```text
Node.js
TypeScript
```

Motivos:

- Mesma linguagem do restante da plataforma.
- Facilita compartilhamento de contratos.
- Facilita manutenção.
- Boa compatibilidade com PM2.
- Boa compatibilidade com Windows e Linux.

---

# 16. COMUNICAÇÃO

A arquitetura deve utilizar:

## Frontend → API

```text
REST API
```

## Frontend → Atualizações em tempo real

Tecnologia a definir durante a implementação arquitetural.

Preferência inicial:

```text
WebSocket
```

## Agente → API

O agente deve iniciar a conexão com a plataforma.

O painel nunca deve precisar abrir conexão direta para dentro da máquina do usuário.

Fluxo:

```text
AGENTE
    ↓
CONECTA-SE À API
    ↓
MANTÉM CANAL AUTENTICADO
    ↓
RECEBE COMANDOS
    ↓
EXECUTA
    ↓
ENVIA RESULTADO
```

A solução deve funcionar mesmo quando:

- A máquina estiver atrás de NAT.
- Não houver IP público.
- A máquina estiver em rede local.

---

# 17. BANCO DE DADOS

Antes de criar migrations, modelar entidades.

Entidades iniciais:

```text
usuarios
organizacoes
usuarios_organizacoes
ambientes
agentes
projetos
servicos
processos
execucoes
historicos
eventos
```

Todas as entidades devem ser analisadas antes de criar a migration definitiva.

Requisitos:

- IDs consistentes.
- created_at.
- updated_at.
- Organização quando aplicável.
- Soft delete quando fizer sentido.
- Índices importantes.
- Isolamento multi-tenant.

---

# 18. ESTRUTURA DO BACKEND

O backend deve ser organizado por módulos.

Estrutura conceitual:

```text
api-central/
└── src/
    ├── autenticacao/
    ├── usuarios/
    ├── organizacoes/
    ├── ambientes/
    ├── agentes/
    ├── projetos/
    ├── servicos/
    ├── processos/
    ├── execucoes/
    ├── historicos/
    ├── eventos/
    ├── comunicacao/
    └── compartilhado/
```

Cada módulo deve possuir responsabilidade clara.

Evitar:

- Serviços gigantes.
- Controllers com regras de negócio.
- Dependências circulares.
- Lógica duplicada.

---

# 19. ESTRUTURA DO AGENTE

Estrutura conceitual:

```text
agente/
└── src/
    ├── configuracao/
    ├── autenticacao/
    ├── conexao/
    ├── comandos/
    ├── executores/
    ├── processos/
    ├── adaptadores/
    │   └── pm2/
    ├── git/
    ├── sistema/
    ├── logs/
    ├── health-check/
    └── descoberta/
```

Não criar módulos sem necessidade real.

---

# 20. CAMADA DE PROCESSOS

O agente deve possuir uma abstração conceitual:

```text
Gerenciador de Processos
```

Responsabilidades:

- Iniciar.
- Parar.
- Reiniciar.
- Consultar status.
- Consultar logs.

Implementação inicial:

```text
Adaptador PM2
```

Futuro:

```text
Adaptador Docker
Adaptador Sistema Operacional
```

---

# 21. PROCESSAMENTO DE AÇÕES

Ações devem ser tratadas como execuções rastreáveis.

Exemplo:

```text
Usuário solicita:
REINICIAR_SERVICO

Plataforma:
Cria execução

Agente:
Recebe comando

Agente:
Executa

Agente:
Envia resultado

Plataforma:
Atualiza execução

Histórico:
Registra evento
```

Cada execução deve possuir:

```text
ID
Tipo
Status
Solicitante
Organização
Ambiente
Projeto
Serviço
Início
Fim
Resultado
Erro
```

---

# 22. LOGS E EVENTOS

Diferenciar:

## Logs da aplicação

Produzidos pelo serviço.

## Logs do PM2

Relacionados ao gerenciamento de processos.

## Eventos

Exemplo:

```text
Serviço iniciou
Serviço parou
Agente desconectou
```

## Histórico

Registro de ações relevantes.

## Auditoria

Registro de quem realizou uma ação.

Não criar uma plataforma complexa de observabilidade na V1.

---

# 23. FLUXO PRINCIPAL DE EXECUÇÃO

```text
USUÁRIO
    ↓
PAINEL WEB
    ↓
API CENTRAL
    ↓
VALIDAÇÃO
    ↓
AUTORIZAÇÃO
    ↓
CRIA EXECUÇÃO
    ↓
ENVIA COMANDO
    ↓
AGENTE
    ↓
VALIDAÇÃO
    ↓
ADAPTADOR DE PROCESSO
    ↓
PM2
    ↓
SERVIÇO
    ↓
RESULTADO
    ↓
AGENTE
    ↓
API
    ↓
BANCO DE DADOS
    ↓
PAINEL ATUALIZADO
```

---

# 24. ESTRATÉGIA DE DESENVOLVIMENTO

O desenvolvimento será realizado por etapas.

Não avançar automaticamente.

---

# ETAPA 0 — VALIDAÇÃO DA ARQUITETURA

OBJETIVO:

Revisar toda a arquitetura definida neste documento antes de criar código.

TAREFAS:

- Revisar stack.
- Revisar monorepo.
- Revisar entidades.
- Revisar comunicação.
- Revisar agente.
- Revisar segurança.
- Identificar riscos técnicos.
- Identificar decisões ainda pendentes.

NÃO IMPLEMENTAR CÓDIGO.

Ao final, apresentar:

```text
DECISÕES CONFIRMADAS
DECISÕES PENDENTES
RISCOS
RECOMENDAÇÕES
```

AGUARDAR MINHA AUTORIZAÇÃO.

---

# ETAPA 1 — CRIAÇÃO DA FUNDAÇÃO DO MONOREPO

OBJETIVO:

Criar apenas a estrutura base do projeto.

CRIAR:

```text
apps/
    painel-web/
    api-central/
    agente/

packages/
    contratos/
    tipos/
    configuracoes/
```

CONFIGURAR:

- TypeScript.
- Gerenciador de pacotes.
- Lint.
- Formatação.
- Variáveis de ambiente.
- Convenções.
- Scripts principais.

NÃO IMPLEMENTAR FUNCIONALIDADES DE NEGÓCIO.

CRITÉRIO DE CONCLUSÃO:

Todos os projetos devem:

- Instalar dependências.
- Executar localmente.
- Possuir lint.
- Possuir build.
- Compartilhar pacotes básicos.

AGUARDAR MINHA AUTORIZAÇÃO.

---

# ETAPA 2 — CONTRATOS COMPARTILHADOS

OBJETIVO:

Definir contratos entre os componentes.

Criar contratos conceituais para:

```text
Frontend ↔ API

API ↔ Agente

Agente ↔ Gerenciador de Processos
```

Definir:

- Comandos.
- Respostas.
- Eventos.
- Erros.
- Status.
- Identificadores.

NÃO IMPLEMENTAR REGRAS COMPLEXAS.

CRITÉRIO:

Os contratos devem estar centralizados e reutilizáveis.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 3 — BANCO DE DADOS

OBJETIVO:

Modelar a primeira versão do banco.

IMPLEMENTAR APENAS:

- Usuários.
- Organizações.
- Associação usuário-organização.

Criar:

- Schema Prisma.
- Migrations.
- Seed mínimo, se necessário.

Não implementar todas as entidades futuras.

CRITÉRIO:

Banco funcional.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 4 — AUTENTICAÇÃO

OBJETIVO:

Permitir autenticação de usuários.

IMPLEMENTAR:

- Cadastro.
- Login.
- Logout.
- Sessão.
- Proteção de rotas.
- Usuário autenticado.

Não implementar OAuth inicialmente.

CRITÉRIO:

Usuário consegue:

```text
Criar conta
↓
Entrar
↓
Acessar área protegida
↓
Sair
```

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 5 — ORGANIZAÇÕES

OBJETIVO:

Implementar organização inicial.

Fluxo:

```text
Usuário cria conta
↓
Organização é criada
↓
Usuário torna-se proprietário
```

IMPLEMENTAR:

- Organização.
- Usuário proprietário.
- Contexto da organização.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 6 — AMBIENTES

OBJETIVO:

Permitir cadastrar ambientes.

IMPLEMENTAR:

- Criar ambiente.
- Listar ambientes.
- Visualizar ambiente.
- Status inicial.

Ainda sem comunicação real com agente.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 7 — AGENTE

OBJETIVO:

Criar a primeira versão do agente.

IMPLEMENTAR:

- Configuração.
- Registro.
- Autenticação.
- Conexão.
- Heartbeat.
- Identificação da máquina.

O agente ainda não precisa controlar PM2.

CRITÉRIO:

```text
Agente inicia
↓
Autentica
↓
Conecta
↓
Ambiente aparece ONLINE
```

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 8 — COMUNICAÇÃO API E AGENTE

OBJETIVO:

Permitir envio de comandos estruturados.

IMPLEMENTAR:

- Conexão persistente.
- Envio de comando.
- Recebimento.
- Confirmação.
- Resultado.
- Timeout.
- Reconexão.

Começar com comando simples:

```text
OBTER_INFORMACOES_DO_SISTEMA
```

CRITÉRIO:

```text
Painel
↓
API
↓
Agente
↓
Sistema
↓
Agente
↓
API
↓
Painel
```

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 9 — PROJETOS

OBJETIVO:

Implementar gerenciamento de projetos.

IMPLEMENTAR:

- Criar.
- Editar.
- Listar.
- Visualizar.
- Arquivar.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 10 — SERVIÇOS

OBJETIVO:

Permitir adicionar serviços aos projetos.

IMPLEMENTAR:

- Nome.
- Tipo.
- Diretório.
- Comando.
- Porta.
- Ambiente.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 11 — GERENCIAMENTO DE PROCESSOS

OBJETIVO:

Criar a abstração de gerenciamento de processos.

IMPLEMENTAR:

- Contrato.
- Interface.
- Adaptador inicial PM2.

Ações:

```text
INICIAR
PARAR
REINICIAR
STATUS
```

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 12 — CONTROLE DE SERVIÇOS

OBJETIVO:

Integrar:

```text
PAINEL
↓
API
↓
COMANDO
↓
AGENTE
↓
PM2
↓
SERVIÇO
```

IMPLEMENTAR:

- Iniciar.
- Parar.
- Reiniciar.
- Status.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 13 — EXECUÇÕES E HISTÓRICO

OBJETIVO:

Registrar ações.

IMPLEMENTAR:

- Criação de execução.
- Status.
- Resultado.
- Erro.
- Histórico básico.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 14 — LOGS

OBJETIVO:

Visualizar logs básicos.

IMPLEMENTAR:

- Solicitar logs.
- Receber logs.
- Exibir logs.

Não implementar centralização complexa inicialmente.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 15 — GIT

OBJETIVO:

Adicionar operações Git controladas.

IMPLEMENTAR:

- Status.
- Branch.
- Git Pull.

Não permitir comandos Git arbitrários.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 16 — DASHBOARD

OBJETIVO:

Criar visão operacional principal.

EXIBIR:

- Ambientes.
- Agentes.
- Projetos.
- Serviços online.
- Serviços parados.
- Serviços com erro.
- Eventos recentes.

AGUARDAR AUTORIZAÇÃO.

---

# ETAPA 17 — POLIMENTO DA V1

OBJETIVO:

Preparar a V1.

REVISAR:

- Segurança.
- Erros.
- Logs.
- Estados.
- Interface.
- Responsividade.
- Testes.
- Documentação.

---

# 25. REGRAS DE CÓDIGO

Todo código deve:

- Utilizar TypeScript quando aplicável.
- Possuir tipagem adequada.
- Evitar any.
- Possuir responsabilidades claras.
- Evitar duplicação.
- Evitar arquivos gigantes.
- Utilizar validação de entrada.
- Tratar erros.
- Possuir logs quando necessário.
- Possuir comentários apenas quando agregarem entendimento.

Não comentar o óbvio.

Comentários devem explicar decisões complexas.

---

# 26. REGRAS DE IMPLEMENTAÇÃO

Ao implementar uma etapa:

1. Analise o estado atual do projeto.
2. Verifique se etapas anteriores estão completas.
3. Crie apenas o necessário.
4. Não implemente funcionalidades futuras.
5. Execute testes.
6. Execute lint.
7. Execute build.
8. Corrija problemas encontrados.
9. Atualize documentação necessária.
10. Apresente resumo.

---

# 27. REGRA SOBRE ALTERAÇÕES

Nunca:

- Reescrever grandes partes sem necessidade.
- Apagar código funcional sem explicar.
- Alterar arquitetura silenciosamente.
- Instalar dependências desnecessárias.
- Criar abstrações excessivas.
- Implementar recursos fora da etapa atual.

Se uma mudança importante for necessária:

```text
PROBLEMA
↓
IMPACTO
↓
ALTERNATIVAS
↓
RECOMENDAÇÃO
```

Aguardar minha aprovação.

---

# 28. FORMA DE TRABALHO

Quando eu disser:

```text
INICIAR ETAPA 0
```

Execute apenas a ETAPA 0.

Quando eu disser:

```text
INICIAR ETAPA 1
```

Execute apenas a ETAPA 1.

E assim sucessivamente.

Nunca avance automaticamente.

---

# 29. PROMPT INICIAL PARA O OPENCODE / GITHUB COPILOT

Após este arquivo estar salvo na raiz do projeto, execute a seguinte solicitação:

```text
Leia integralmente o arquivo PLANO_DE_DESENVOLVIMENTO.md.

Este documento é o plano mestre do projeto e deve orientar todas as decisões e implementações.

Siga rigorosamente as instruções contidas nele.

Não altere nenhum arquivo ainda.
Não escreva código ainda.
Não instale dependências ainda.
Não avance para nenhuma etapa automaticamente.

Primeiro, confirme que você leu e compreendeu integralmente o documento.

Em seguida, aguarde meu próximo comando.

O primeiro comando esperado será:

INICIAR ETAPA 0
```

---

# 30. COMANDO INICIAL

A primeira ação deve ser:

```text
AGUARDAR MEU COMANDO:

INICIAR ETAPA 0
```

Não implemente código antes disso.
