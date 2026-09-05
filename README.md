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

4. Gere o cliente Prisma e aplique as migrações:

```bash
npm run prisma:generate -w apps/api-central
npm run prisma:migrate -w apps/api-central
```

5. Inicie o desenvolvimento:

```bash
npm run dev
```

## Desenvolvimento

### Iniciar todos os serviços

```bash
npm run dev
```

### Iniciar apenas um serviço

```bash
# Painel Web (porta 4000)
npm run dev -w apps/painel-web

# API Central (porta 4001)
npm run dev -w apps/api-central

# Agente
npm run dev -w apps/agente
```

### Build (produção)

```bash
npm run build
```

### Lint (verificar erros de código)

```bash
npm run lint          # Verificar erros
npm run lint:fix      # Corrigir erros automaticamente
```

### Formatação

```bash
npm run format        # Formatar todos os arquivos
npm run format:check  # Verificar se estão formatados (sem alterar)
```

### Prisma (banco de dados)

```bash
npm run prisma:generate -w apps/api-central   # Gerar cliente Prisma
npm run prisma:migrate -w apps/api-central     # Criar/aplicar migrações
npm run prisma:studio -w apps/api-central      # Interface visual do banco
```

### Limpeza

```bash
npm run clean         # Limpar node_modules da raiz
npm run clean:all     # Limpar todas as pastas node_modules
```

## Stack Tecnológica

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma
- **Agente**: Node.js + TypeScript
- **Comunicação**: REST + Socket.io

## Documentação

- [Planejamento do Produto](docs/00%20-%20PLANEJAMENTO%20DO%20PRODUTO%20—%20PLATAFORMA%20CENTRALIZADA%20DE%20GERENCIAMENTO%20DE%20PROJETOS%20E%20SERVI%C3%87OS.md)
- [Plano de Desenvolvimento](docs/01%20-%20PLANO_DE_DESENVOLVIMENTO.md)
- [Relatório de Segurança V1.1](docs/01%20-%20RELATORIO%20DE%20SEGURAN%C3%87A%20V1.1.md)
- [Guia de Uso do Painel](docs/02%20-%20GUIA%20DE%20USO%20DO%20PAINEL.md)
- [Planejamento V2](docs/03%20-%20PLANEJAMENTO%20V2.md)

## Licença

Este projeto é proprietário e de uso interno.
