# PLANEJAMENTO DO PRODUTO — PLATAFORMA CENTRALIZADA DE GERENCIAMENTO DE PROJETOS E SERVIÇOS

## INSTRUÇÃO PRINCIPAL AO GITHUB COPILOT

Leia integralmente este documento antes de realizar qualquer análise, sugestão, alteração ou geração de código.

Este documento representa a visão inicial, o planejamento conceitual e as decisões preliminares do produto.

### REGRA FUNDAMENTAL

Neste momento, **NÃO comece a desenvolver código automaticamente**.

O objetivo inicial é trabalhar comigo na estruturação completa do produto antes da implementação.

Você deverá atuar como:

- Arquiteto de software
- Arquiteto de produto
- Especialista em sistemas distribuídos
- Especialista em aplicações web
- Especialista em gerenciamento de processos
- Especialista em PM2
- Especialista em segurança de agentes remotos
- Especialista em experiência de usuário para ferramentas técnicas
- Especialista em DevOps, sem transformar o produto desnecessariamente em uma plataforma complexa de DevOps

Antes de qualquer implementação, analise este documento, identifique lacunas, riscos, decisões pendentes e oportunidades de melhoria.

Toda comunicação, explicação, documentação, comentários futuros no código, nomes de variáveis, nomes de arquivos quando possível e demais elementos do projeto devem ser feitos preferencialmente em **português do Brasil**, exceto quando uma convenção técnica consolidada exigir o uso de termos em inglês.

---

# 1. VISÃO GERAL DO PRODUTO

O produto será uma plataforma centralizada para gerenciar, executar, monitorar e atualizar projetos e serviços em múltiplos ambientes.

A plataforma será inicialmente pensada para:

- Desenvolvedores individuais
- Freelancers
- Pequenas software houses
- Pequenas equipes de desenvolvimento

O problema principal é centralizar o gerenciamento de múltiplos projetos que atualmente dependem de:

- Terminais separados
- Comandos diferentes
- Diretórios diferentes
- Portas diferentes
- PM2 manual
- Git manual
- Múltiplas máquinas
- Servidores locais
- VPS
- Processos espalhados

A plataforma deverá permitir controlar tudo a partir de um único painel.

---

# 2. PROPOSTA DE VALOR

A proposta de valor inicial do produto é:

> Centralizar projetos, ambientes e serviços em um único painel, permitindo executar, parar, reiniciar, monitorar, atualizar e organizar aplicações sem depender do gerenciamento manual de múltiplos terminais, máquinas e comandos.

O produto deverá ocupar uma posição intermediária entre:

```text
GERENCIAMENTO MANUAL
TERMINAIS + PM2 + GIT
        ↓
PLATAFORMA CENTRALIZADA
        ↓
FERRAMENTAS COMPLEXAS DE DEVOPS
```

O objetivo não é inicialmente competir com:

- Kubernetes
- Plataformas completas de CI/CD
- Ferramentas corporativas complexas de infraestrutura

O objetivo é resolver muito bem o gerenciamento operacional de projetos e serviços.

---

# 3. PROBLEMAS QUE O PRODUTO DEVE RESOLVER

## 3.1 Muitos projetos

Um desenvolvedor ou software house pode possuir:

```text
Projeto A
Projeto B
Projeto C
Projeto D
Projeto E
```

Cada projeto pode possuir:

- Frontend
- Backend
- Worker
- API
- Bot
- Crawler
- Agendador
- Outros serviços

---

## 3.2 Muitos terminais

Situação atual:

```text
Terminal 1 → Frontend
Terminal 2 → Backend
Terminal 3 → Worker
Terminal 4 → Outro projeto
Terminal 5 → Logs
```

O produto deverá reduzir essa dependência operacional de múltiplos terminais.

---

## 3.3 Comandos diferentes

Cada projeto pode possuir comandos como:

```text
npm run dev
npm run start
npm run start:dev
pnpm dev
yarn dev
python main.py
```

O sistema deverá permitir cadastrar e executar comandos de maneira organizada.

---

## 3.4 Portas diferentes

Exemplo:

```text
Frontend Projeto A → 3000
Backend Projeto A → 3001

Frontend Projeto B → 3002
Backend Projeto B → 3003
```

A plataforma deverá ajudar a visualizar, organizar e detectar conflitos de portas.

---

## 3.5 Projetos distribuídos em múltiplas máquinas

Exemplo:

```text
Computador de Desenvolvimento
        │
        ├── Projeto A
        └── Projeto B

VPS de Produção
        │
        ├── Projeto C
        └── Projeto D

Servidor adicional
        │
        └── Projeto E
```

A plataforma deverá ser preparada para controlar múltiplos ambientes.

---

# 4. ARQUITETURA CONCEITUAL INICIAL

A visão arquitetural inicial é:

```text
                    USUÁRIO
                       │
                       ▼
                PAINEL CENTRAL
                       │
                       ▼
                 API CENTRAL
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      BANCO DE DADOS       COMUNICAÇÃO
                              EM TEMPO REAL
                                  │
                    ┌─────────────┼─────────────┐
                    ▼                           ▼
                 AGENTE 1                    AGENTE 2
                 LOCAL                       VPS
                    │                           │
                    ▼                           ▼
                   PM2                         PM2
                    │                           │
             ┌──────┼──────┐             ┌──────┼──────┐
             ▼      ▼      ▼             ▼      ▼      ▼
          Front   Back   Worker         API   Bot   Site
```

Esta arquitetura ainda deve ser analisada e validada antes da implementação.

O GitHub Copilot deverá ajudar a identificar:

- Melhor forma de comunicação
- Responsabilidades de cada camada
- Segurança
- Escalabilidade
- Limitações
- Pontos únicos de falha
- Estratégia para ambientes offline
- Sincronização de estado
- Comunicação em tempo real

---

# 5. CONCEITO CENTRAL: PAINEL + AGENTE

O sistema deverá possuir dois grandes lados.

## 5.1 Plataforma central

Responsável por:

- Usuários
- Organizações
- Equipes
- Projetos
- Configurações
- Permissões
- Histórico
- Auditoria
- Visualização
- Controle central
- Estado desejado

---

## 5.2 Agente

O agente será instalado em uma máquina ou servidor.

Ele será responsável por interagir diretamente com:

- PM2
- Sistema operacional
- Processos locais
- Portas
- Sistema de arquivos
- Git
- Diretórios dos projetos
- Logs

A plataforma central não deverá executar diretamente comandos arbitrários nas máquinas.

O fluxo conceitual será:

```text
PAINEL
    ↓
API CENTRAL
    ↓
COMANDO VALIDADO
    ↓
AGENTE
    ↓
VALIDAÇÃO LOCAL
    ↓
EXECUÇÃO
    ↓
PM2 / GIT / SISTEMA OPERACIONAL
```

---

# 6. PAPEL DO PM2

O PM2 será inicialmente um dos principais motores operacionais da plataforma.

A plataforma deverá abstrair comandos como:

```text
pm2 start
pm2 stop
pm2 restart
pm2 delete
pm2 status
pm2 logs
pm2 save
```

O usuário deverá utilizar uma interface amigável.

Exemplo:

```text
[ INICIAR ]
[ PARAR ]
[ REINICIAR ]
[ VER LOGS ]
```

Internamente, o agente realizará as operações necessárias.

O sistema deverá considerar recursos como:

- Status do processo
- PID
- Tempo ativo
- Quantidade de reinicializações
- Uso de CPU
- Uso de memória
- Reinício automático
- Persistência
- Recuperação após reinicialização da máquina

---

# 7. CONCEITOS E ENTIDADES PRINCIPAIS

Antes de definir banco de dados, estas entidades devem ser analisadas.

## 7.1 Organização

Representa:

- Empresa
- Software house
- Equipe
- Estrutura principal do usuário

---

## 7.2 Usuário

Pessoa que utiliza a plataforma.

No futuro poderá possuir:

- Permissões
- Funções
- Equipes
- Acesso limitado a projetos
- Acesso limitado a ambientes

---

## 7.3 Ambiente

Representa uma máquina ou local de execução.

Exemplos:

```text
Notebook de Desenvolvimento
VPS de Produção
Servidor de Homologação
Servidor Local
```

Um ambiente deverá possuir informações como:

- Nome
- Tipo
- Sistema operacional
- Status
- Agente conectado
- PM2 disponível
- Projetos associados

---

## 7.4 Agente

Software instalado no ambiente.

Responsabilidades:

- Comunicar-se com a plataforma
- Executar ações autorizadas
- Consultar PM2
- Consultar Git
- Consultar processos
- Consultar portas
- Obter logs
- Informar estado do ambiente

---

## 7.5 Projeto

Agrupamento lógico.

Exemplo:

```text
Sistema de Chamados
```

Um projeto poderá possuir:

- Um ou mais serviços
- Um ou mais ambientes
- Repositórios
- Configurações
- Histórico
- Ações

---

## 7.6 Serviço

Representa uma aplicação ou processo executável.

Exemplos:

```text
Frontend
Backend
API
Worker
Bot
Crawler
Agendador
WebSocket
```

A arquitetura não deverá limitar serviços apenas a frontend e backend.

Um serviço poderá possuir:

- Nome
- Tipo
- Diretório
- Comando
- Porta
- Configuração PM2
- Estado
- Logs
- Health Check
- Scripts personalizados

---

## 7.7 Processo

Representa a execução real de um serviço.

Exemplo:

```text
Nome PM2: sistema-backend-producao
PID: 15432
Status: Online
```

---

## 7.8 Ação

Representa uma operação executada.

Exemplos:

```text
Iniciar
Parar
Reiniciar
Atualizar
Build
Instalar dependências
Executar migration
Executar script personalizado
```

---

# 8. CICLO DE VIDA DO PROJETO

O sistema deverá considerar o seguinte ciclo conceitual:

```text
1. Projeto é adicionado
        ↓
2. Ambiente é selecionado
        ↓
3. Serviços são configurados
        ↓
4. Configuração operacional é definida
        ↓
5. Serviço é iniciado
        ↓
6. PM2 gerencia o processo
        ↓
7. Agente monitora o estado
        ↓
8. Painel recebe informações
        ↓
9. Projeto pode ser atualizado
        ↓
10. Serviços podem ser reiniciados
```

Também deverão ser considerados cenários como:

- Projeto removido da máquina
- Diretório alterado
- PM2 indisponível
- Máquina offline
- Agente desconectado
- Porta ocupada
- Processo encerrado inesperadamente
- Git pull com conflito
- Serviço inicia mas não responde
- Serviço reinicia repetidamente

---

# 9. FUNCIONALIDADES INICIAIS DESEJADAS

## 9.1 Gerenciamento de projetos

- Criar projeto
- Editar projeto
- Arquivar projeto
- Visualizar detalhes
- Associar serviços
- Associar ambientes

---

## 9.2 Gerenciamento de serviços

Cada serviço deverá permitir configurar:

- Nome
- Tipo
- Diretório
- Comando
- Porta
- Nome no PM2
- Inicialização automática
- Reinício automático
- Ambiente associado

---

## 9.3 Controle operacional

Ações principais:

```text
INICIAR
PARAR
REINICIAR
```

Também deverá existir:

```text
INICIAR PROJETO
PARAR PROJETO
REINICIAR PROJETO
```

Ou seja, uma ação poderá ser aplicada:

- A um serviço
- A vários serviços
- Ao projeto inteiro

---

## 9.4 Git

Inicialmente considerar:

- Verificar status
- Verificar branch
- Verificar alterações
- Git fetch
- Git pull
- Visualizar commits recentes

Operações mais sensíveis deverão ser analisadas posteriormente:

- Git add
- Commit
- Push
- Reset
- Checkout forçado

---

# 10. FLUXO DE ATUALIZAÇÃO

A plataforma deverá futuramente permitir fluxos configuráveis.

Exemplo:

```text
ATUALIZAR PROJETO

1. Verificar alterações locais
2. Executar Git Fetch
3. Verificar atualizações
4. Executar Git Pull
5. Instalar dependências
6. Executar Build
7. Executar Migrations
8. Reiniciar serviços
```

Cada projeto ou serviço poderá possuir regras próprias.

Exemplo:

```text
Após Git Pull:

[ X ] Instalar dependências
[ X ] Executar Build
[   ] Executar Migrations
[ X ] Reiniciar serviço
```

O sistema deverá ser pensado para permitir esse tipo de automação futuramente, mesmo que a V1 implemente uma versão simplificada.

---

# 11. PORTAS

O sistema deverá ajudar a gerenciar portas.

Funcionalidades desejadas:

- Verificar se uma porta está disponível
- Identificar se está em uso
- Identificar processo associado
- Detectar conflito
- Relacionar porta com serviço conhecido

Exemplo:

```text
Porta: 3000

Status:
EM USO

Processo:
node

PID:
15432

Serviço identificado:
Frontend Sistema X
```

A alteração automática de portas em arquivos dos projetos não deve ser implementada sem regras específicas.

---

# 12. LOGS

O sistema deverá possuir visualização de logs.

Inicialmente:

- Logs de serviços
- Logs do PM2
- Logs de execução de ações
- Erros recentes

Futuramente:

- Busca
- Filtros
- Logs centralizados
- Retenção configurável
- Exportação

---

# 13. STATUS E ESTADOS

Os serviços não devem possuir apenas os estados:

```text
Rodando
Parado
```

Considerar estados como:

```text
ONLINE
PARADO
INICIANDO
PARANDO
REINICIANDO
ERRO
DESCONHECIDO
DESCONECTADO
```

O sistema deverá diferenciar:

```text
PROCESSO ONLINE
```

de:

```text
APLICAÇÃO SAUDÁVEL
```

Um processo pode estar ativo e a aplicação ainda estar indisponível.

---

# 14. HEALTH CHECKS

O produto deverá prever health checks.

Fluxo conceitual:

```text
Processo ativo?
        ↓
Porta disponível?
        ↓
Aplicação responde?
        ↓
Endpoint de saúde responde?
```

Exemplo:

```text
Backend

Processo:
ONLINE

Porta:
3001 ATIVA

Health Check:
/api/health OK
```

Na V1, isso poderá ser simplificado.

A arquitetura, entretanto, deve prever evolução.

---

# 15. DESCOBERTA AUTOMÁTICA DE PROJETOS

Uma possibilidade importante para o produto é permitir que o agente ajude a descobrir projetos.

Exemplo:

```text
Diretório analisado:

C:\Projetos
```

O agente poderia detectar:

```text
sistema-chamados
├── frontend
└── backend

site-institucional
└── frontend
```

Também poderia identificar arquivos como:

```text
package.json
requirements.txt
pyproject.toml
Dockerfile
docker-compose.yml
```

E sugerir:

```text
Projeto detectado:
Sistema de Chamados

Serviços sugeridos:

Frontend → Next.js
Backend → NestJS
```

Esta funcionalidade deve ser analisada como diferencial importante.

---

# 16. PRESETS DE SERVIÇOS

O sistema poderá futuramente oferecer modelos.

Exemplos:

```text
Next.js
NestJS
Node.js
Python
FastAPI
Django
Personalizado
```

Ao selecionar um tipo, o sistema poderá sugerir:

- Comandos
- Portas
- Configurações comuns

Mas o usuário deverá poder editar.

---

# 17. AÇÕES PERSONALIZADAS

O produto deverá ser preparado para permitir ações compostas.

Exemplo:

```text
AÇÃO: ATUALIZAR BACKEND

1. git pull
2. npm install
3. npm run build
4. migration
5. restart PM2
```

Essas ações devem ser pensadas como uma funcionalidade futura ou evolutiva.

Não criar execução arbitrária sem controles de segurança.

---

# 18. ESTADO DESEJADO

O sistema deverá considerar futuramente o conceito de estado desejado.

Exemplo:

```text
Frontend:
DEVE ESTAR ONLINE

Backend:
DEVE ESTAR ONLINE
```

O estado real poderá ser:

```text
Frontend:
ONLINE

Backend:
ERRO
```

O sistema poderá futuramente detectar diferenças entre:

```text
ESTADO DESEJADO
```

e:

```text
ESTADO REAL
```

Esse conceito deverá ser analisado arquiteturalmente.

---

# 19. HISTÓRICO E AUDITORIA

O sistema deverá registrar ações importantes.

Exemplos:

```text
Usuário iniciou Backend

Usuário reiniciou Projeto

Git Pull executado

Agente ficou offline

Processo apresentou erro
```

Diferenciar conceitualmente:

## Histórico operacional

Eventos do sistema.

## Auditoria

Ações realizadas por usuários.

## Histórico de atualização

Mudanças relacionadas ao código e atualização dos projetos.

---

# 20. SEGURANÇA

ESTA É UMA DAS ÁREAS MAIS IMPORTANTES DO PRODUTO.

O agente poderá executar ações em máquinas.

Portanto, a plataforma não deverá simplesmente receber um comando arbitrário e executá-lo.

Fluxo desejado:

```text
USUÁRIO
    ↓
SOLICITA AÇÃO
    ↓
PLATAFORMA VALIDA
    ↓
PERMISSÃO É VERIFICADA
    ↓
AGENTE RECEBE AÇÃO ESTRUTURADA
    ↓
AGENTE VALIDA
    ↓
AÇÃO É EXECUTADA
```

Considerar:

- Autenticação forte entre agente e plataforma
- Tokens únicos
- Revogação de agentes
- Permissões
- Registro de ações
- Diretórios autorizados
- Validação de comandos
- Proteção contra execução arbitrária
- Criptografia de comunicação
- Expiração de credenciais
- Rotação de credenciais
- Limitação de ações perigosas

O GitHub Copilot deverá dar atenção especial a este ponto quando a arquitetura técnica for definida.

---

# 21. MULTIUSUÁRIO E PERMISSÕES

Mesmo que a V1 seja inicialmente simples, o produto poderá evoluir para múltiplos usuários.

Possíveis perfis:

```text
Administrador
Gerente
Desenvolvedor
Visualizador
```

Exemplos de permissões:

- Visualizar projeto
- Iniciar serviço
- Parar serviço
- Reiniciar serviço
- Atualizar projeto
- Gerenciar ambientes
- Gerenciar agentes

A estrutura deverá ser analisada sem criar complexidade excessiva prematuramente.

---

# 22. O QUE NÃO DEVE ENTRAR PREMATURAMENTE

Evitar inicialmente transformar o projeto em uma plataforma gigantesca.

Não priorizar:

- Kubernetes
- Orquestração complexa de containers
- CI/CD corporativo completo
- Marketplace
- Billing
- Inteligência artificial sem necessidade real
- Integrações excessivas
- Monitoramento empresarial extremamente avançado

A prioridade inicial é:

> Permitir que o usuário controle seus projetos e serviços de forma simples, centralizada e confiável.

---

# 23. POSSÍVEL ESCOPO DA V1

A V1 deve ser discutida e refinada, mas inicialmente considerar:

## Usuário

- Autenticação básica

## Ambientes

- Registrar ambiente
- Conectar agente
- Ver status online/offline

## Projetos

- Criar
- Editar
- Visualizar

## Serviços

- Cadastrar
- Configurar diretório
- Configurar comando
- Configurar porta
- Associar PM2

## PM2

- Start
- Stop
- Restart
- Status
- Métricas básicas
- Logs básicos

## Git

- Status
- Pull

## Dashboard

- Projetos
- Ambientes
- Serviços online
- Serviços parados
- Serviços com erro

## Histórico

- Registro básico de ações

---

# 24. PRINCÍPIOS DO PRODUTO

Durante o planejamento e desenvolvimento, priorizar:

## Simplicidade

Não exigir conhecimento avançado de infraestrutura para utilizar.

## Segurança

Não permitir execução remota insegura.

## Transparência

Sempre mostrar claramente o que está acontecendo.

## Controle

O usuário deve entender as ações executadas.

## Escalabilidade

Permitir evolução para múltiplos ambientes e usuários.

## Modularidade

Cada grande responsabilidade deve possuir limites claros.

## Observabilidade

O sistema deve permitir entender:

- O que está rodando
- Onde está rodando
- O que falhou
- Quem executou uma ação
- O que aconteceu

---

# 25. FLUXO DE TRABALHO DO GITHUB COPILOT

Antes de gerar código, siga obrigatoriamente esta sequência.

## ETAPA 1 — Analisar o documento

Identifique:

- Conceitos definidos
- Conceitos indefinidos
- Riscos
- Contradições
- Dependências
- Decisões técnicas pendentes

---

## ETAPA 2 — Apresentar perguntas estratégicas

Faça perguntas apenas quando a resposta realmente impactar:

- Arquitetura
- Segurança
- Escopo
- Experiência do usuário
- Modelo de negócio
- Funcionamento do produto

Não faça perguntas desnecessárias.

---

## ETAPA 3 — Propor melhorias

Analise o produto criticamente.

Não concorde automaticamente com todas as decisões.

Se houver uma solução melhor, explique:

- O problema
- A alternativa
- Vantagens
- Desvantagens
- Impacto

---

## ETAPA 4 — Consolidar o produto

Após discussão suficiente, ajudar a consolidar:

- Visão do produto
- Proposta de valor
- Público-alvo
- Entidades
- Fluxos
- Módulos
- Regras
- Segurança
- Escopo V1
- Evoluções futuras

---

## ETAPA 5 — Arquitetura técnica

Somente após a consolidação funcional, definir:

- Frontend
- Backend
- Banco de dados
- Comunicação em tempo real
- Agente
- PM2
- Autenticação
- Segurança
- Comunicação entre agente e central
- Estratégia de implantação

---

## ETAPA 6 — Estrutura do projeto

Somente depois definir:

- Pastas
- Módulos
- Responsabilidades
- Bibliotecas
- Convenções
- Configurações

---

## ETAPA 7 — Desenvolvimento

Somente iniciar código após as etapas anteriores.

---

# 26. FORMA DE RESPOSTA ESPERADA

Sempre que analisar uma decisão importante, responda preferencialmente com:

```text
DECISÃO ATUAL

O QUE SIGNIFICA

VANTAGENS

RISCOS

ALTERNATIVAS

MINHA RECOMENDAÇÃO
```

Quando houver necessidade de decidir algo:

```text
OPÇÃO A
Vantagens
Desvantagens

OPÇÃO B
Vantagens
Desvantagens

RECOMENDAÇÃO
```

Não avance silenciosamente sobre decisões arquiteturais importantes.

---

# 27. REGRA SOBRE CÓDIGO

Enquanto estivermos na fase de planejamento:

- NÃO criar código automaticamente
- NÃO criar estrutura de projeto sem aprovação
- NÃO escolher tecnologias de forma definitiva sem análise
- NÃO criar banco de dados antes de consolidar entidades
- NÃO criar endpoints antes de definir fluxos
- NÃO criar prompts de implementação antes de concluir o planejamento

O foco inicial é:

> Pensar corretamente antes de construir.

---

# 28. PRIMEIRA TAREFA AO LER ESTE DOCUMENTO

Após ler integralmente este arquivo:

1. Não gere código.
2. Faça uma análise crítica da visão do produto.
3. Identifique pontos fortes.
4. Identifique riscos.
5. Identifique decisões que ainda precisam ser tomadas.
6. Identifique funcionalidades ou conceitos importantes que ainda não foram considerados.
7. Organize uma sequência recomendada de planejamento.
8. Proponha os próximos passos.
9. Priorize a construção de uma base sólida antes da implementação.

O objetivo é transformar esta ideia em um produto bem estruturado, escalável, seguro e realmente útil antes de iniciar o desenvolvimento.