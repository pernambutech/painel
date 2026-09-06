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
│
├── scripts/                 # Scripts utilitários
│   ├── registrar-painel.js  # Registra o painel no banco
│   ├── install.sh           # Instalação automatizada (Linux/macOS)
│   └── install.bat          # Instalação automatizada (Windows)
│
├── start-pm2.bat            # Inicia processos via PM2 (Windows)
├── start-pm2.sh             # Inicia processos via PM2 (Linux/macOS)
└── ecosystem.config.js      # Configuração do PM2
```

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- PM2 (apenas para produção): `npm install -g pm2`

## Instalação Rápida

### Instalação Automatizada (Recomendado)

**Linux/macOS:**
```bash
git clone <url-do-repositorio>
cd painel
chmod +x scripts/install.sh
./scripts/install.sh
```

**Windows:**
```batch
git clone <url-do-repositorio>
cd painel
scripts\install.bat
```

O script de instalação executa automaticamente:
1. Verificação de dependências (Node, npm, PostgreSQL)
2. Instalação de pacotes
3. Cópia do `.env.example` para `.env`
4. Geração do Prisma Client
5. Aplicação das migrations
6. Build dos projetos
7. Registro inicial (primeiro usuário)
8. Início dos processos via PM2

### Instalação Manual

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

5. Registre o primeiro usuário (opcional, pode ser feito via interface):

```bash
npm run pm2:registrar-painel
```

Personalize o registro com variáveis de ambiente:
```bash
# Linux/macOS
PAINEL_ADMIN_EMAIL=seu@email.com \
PAINEL_ADMIN_SENHA=sua_senha \
PAINEL_ADMIN_NOME="Seu Nome" \
PAINEL_ORG_NOME="Sua Empresa" \
npm run pm2:registrar-painel

# Windows (PowerShell)
$env:PAINEL_ADMIN_EMAIL="seu@email.com"
$env:PAINEL_ADMIN_SENHA="sua_senha"
npm run pm2:registrar-painel
```

6. Inicie o desenvolvimento:

```bash
npm run dev
```

## Iniciar Processos (Produção)

O Painel pode ser executado em produção usando o PM2 para gerenciar os processos.

### Primeira vez (registrar no PM2)

```bash
# Linux/macOS
npm run build
pm2 start ecosystem.config.js
pm2 save

# Windows
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Configurar inicialização automática

**Linux/macOS:**
```bash
pm2 startup
pm2 save
```

**Windows:**
```bash
# Use o startup script fornecido
start-pm2.bat
```

Para configurar no Windows, você pode:
1. Adicionar `start-pm2.bat` à pasta "Inicializar" do Windows
2. Ou usar o Task Scheduler para executar no logon

### Comandos úteis do PM2

```bash
pm2 status                    # Ver status dos processos
pm2 logs                      # Ver logs em tempo real
pm2 logs painel-api           # Logs específicos
pm2 restart all               # Reiniciar todos
pm2 stop all                  # Parar todos
pm2 delete all                # Remover todos
pm2 resurrect                 # Restaurar processos salvos
```

## Desenvolvimento

### Iniciar todos os serviços (modo dev)

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

## Compatibilidade por Sistema Operacional

O Painel funciona em **Windows**, **Linux** e **macOS**. Diferenças por SO:

| Recurso | Windows | Linux | macOS |
|---------|---------|-------|-------|
| Detecção de portas | `netstat -ano` | `ss` / `netstat` | `lsof` / `netstat` |
| PM2 | ✅ | ✅ | ✅ |
| Scripts de inicialização | `start-pm2.bat` | `start-pm2.sh` | `start-pm2.sh` |
| Detecção automática de SO | ✅ | ✅ | ✅ |

O agente detecta automaticamente o sistema operacional onde está executando e se adapta.

## Stack Tecnológica

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma
- **Agente**: Node.js + TypeScript + PM2
- **Comunicação**: REST + Socket.io

## Portas Utilizadas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Painel Web | 4000 | Interface do usuário |
| API Central | 4001 | Backend REST + WebSocket |
| Agente | - | Não publica porta (conecta à API) |

## Primeiro Acesso

Após a instalação:

1. Acesse **http://localhost:4000** (ou a porta configurada)
2. Faça login com as credenciais criadas:
   - **Padrão**: `admin@painel.local` / `admin123` (altere após primeiro login!)
   - **Personalizado**: o que você definiu no `npm run pm2:registrar-painel`
3. Crie um ambiente e configure um agente para começar a gerenciar serviços

## Documentação

- [Planejamento do Produto](docs/00%20-%20PLANEJAMENTO%20DO%20PRODUTO%20—%20PLATAFORMA%20CENTRALIZADA%20DE%20GERENCIAMENTO%20DE%20PROJETOS%20E%20SERVI%C3%87OS.md)
- [Plano de Desenvolvimento](docs/01%20-%20PLANO_DE_DESENVOLVIMENTO.md)
- [Relatório de Segurança V1.1](docs/01%20-%20RELATORIO%20DE%20SEGURAN%C3%87A%20V1.1.md)
- [Guia de Uso do Painel](docs/02%20-%20GUIA%20DE%20USO%20DO%20PAINEL.md)
- [Planejamento V2](docs/03%20-%20PLANEJAMENTO%20V2.md)
- [Credenciais e Configurações](docs/03%20-%20Credenciais%20e%20Configuracoes.md)

## Licença

Este projeto é proprietário e de uso interno.
