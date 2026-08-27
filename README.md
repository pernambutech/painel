# Painel - Gerenciamento Centralizado

Plataforma de gerenciamento centralizado de projetos e serviços.

## Visão Geral

O Painel é uma plataforma que permite gerenciar múltiplos projetos e serviços a partir de uma única interface. O sistema é composto por:

- **Painel Web**: Interface do usuário para gerenciamento
- **API Central**: Backend que processa requisições
- **Agente**: Software instalado em máquinas para controlar processos

## Estrutura do Projeto

```
painel/
├── apps/
│   ├── painel-web/          # Frontend Next.js
│   ├── api-central/         # Backend NestJS
│   └── agente/              # Agente Node.js
│
├── packages/
│   ├── contratos/           # Interfaces compartilhadas
│   ├── tipos/               # Tipos TypeScript
│   └── configuracoes/       # Configurações compartilhadas
```

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd painel
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o setup inicial:
```bash
npm run setup
```

## Desenvolvimento

### Iniciar todos os serviços
```bash
npm run dev
```

### Iniciar apenas um serviço
```bash
# Painel Web
npm run dev -w apps/painel-web

# API Central
npm run dev -w apps/api-central

# Agente
npm run dev -w apps/agente
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Formatação
```bash
npm run format
```

## Stack Tecnológica

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma
- **Agente**: Node.js + TypeScript
- **Comunicação**: REST + Socket.io

## Decisões Técnicas

- **Gerenciador de pacotes**: npm workspaces
- **IDs**: UUID
- **Soft delete**: Sim
- **Token de agente**: Não expira (V1)
- **WebSocket**: Socket.io

## Documentação

- [Plano de Desenvolvimento](docs/00%20-%20PLANEJAMENTO%20DO%20PRODUTO%20—%20PLATAFORMA%20CENTRALIZADA%20DE%20GERENCIAMENTO%20DE%20PROJETOS%20E%20SERVIÇOS.md)
- [Plano de Desenvolvimento](docs/01%20-%20PLANO_DE_DESENVOLVIMENTO.md)

## Licença

Este projeto é proprietário e de uso interno.
