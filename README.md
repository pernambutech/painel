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
└── ecosystem.config.js      # Configuração do PM2
```

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- PM2 (local, instalado automaticamente via npm install)

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
# Todos os sistemas
npm run build
npm run start:pm2
npm run save:pm2
```

Ou diretamente:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Atalhos PM2 disponíveis

```bash
npm run start:pm2      # Iniciar processos
npm run stop:pm2       # Parar todos
npm run restart:pm2    # Reiniciar todos
npm run status:pm2     # Ver status
npm run logs:pm2       # Ver logs
npm run save:pm2       # Salvar estado
```

### Configurar inicialização automática

O script de instalação (`install.bat` / `install.sh`) já configura o auto-start automaticamente.

**Windows:**
- Cria um script `pm2-startup.bat` que executa `pm2 resurrect`
- Cria uma tarefa agendada `PainelPM2` que executa esse script no logon
- Para remover: Ambientes > detalhe > "Remover Auto-start"

**Linux/macOS:**
- Executa `pm2 startup` para configurar o init system
- Executa `pm2 save` para persistir o estado
- Para remover: `pm2 unstartup -f`

**Diferença entre `pm2 save` e auto-start:**

| Comando | O que faz |
|---------|-----------|
| `pm2 save` | Salva a lista atual de processos no arquivo `dump.pm2` |
| Auto-start | Inicia o PM2 automaticamente após login e restaura o `dump.pm2` |
| `pm2 resurrect` | Restaura os processos previamente salvos no `dump.pm2` |

> `pm2 save` sozinho **não** garante que os processos voltarão após reiniciar.
> É necessário ter o auto-start configurado.

### Comandos úteis do PM2

```bash
npm run status:pm2              # Ver status dos processos
npm run logs:pm2                # Ver logs em tempo real
npm run restart:pm2             # Reiniciar todos
npm run stop:pm2                # Parar todos
npm run save:pm2                # Salvar estado (dump.pm2)

# Ou diretamente:
npx pm2 status
npx pm2 logs
npx pm2 restart all
npx pm2 stop all
npx pm2 save                    # Salvar lista de processos
npx pm2 resurrect               # Restaurar processos salvos (requer dump.pm2)
npx pm2 delete all              # Remover todos os processos do PM2
```

## Desenvolvimento

### Comandos de desenvolvimento

```bash
npm run dev          # Inicia a API Central (porta 4001)
npm run dev:web      # Inicia o Painel Web (porta 4000)
npm run dev:api      # Inicia a API Central (porta 4001)
npm run dev:agente   # Inicia o Agente (precisa de AGENT_TOKEN)
npm run dev:tudo     # Inicia todos os workspaces (inclui agente)
```

### Fluxo recomendado

**Terminal 1 — API:**
```bash
npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev:web
```

**Terminal 3 — Agente (opcional):**
```bash
# Primeiro, gere um token via Painel Web → Ambientes → Gerar Token
# Depois configure:
set AGENT_TOKEN=painel_xxxxx    # Windows
export AGENT_TOKEN=painel_xxxxx # Linux/macOS
npm run dev:agente
```

### Sobre o agente

O agente **não inicia** automaticamente com `npm run dev`. Isso é intencional — ele precisa de um `AGENT_TOKEN` válido para conectar à API.

Para executar o agente:
1. Acesse o Painel Web → Ambientes → Gerar Token
2. Copie o token gerado
3. Configure a variável `AGENT_TOKEN` no ambiente
4. Execute `npm run dev:agente`

Sem token, o agente apresentará:
```
❌ Token do agente não configurado.
   Defina a variável de ambiente AGENT_TOKEN
   Exemplo: AGENT_TOKEN=painel_xxxxx npm run dev:agente
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
| Scripts de instalação | `install.bat` | `install.sh` | `install.sh` |
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
3. O agente PM2 já está rodando com token configurado automaticamente pelo install
4. O ambiente já está **ONLINE** quando o agente conectar
5. Crie um projeto e serviços para começar a gerenciar

### Auto-start configurado

O `install.bat`/`install.sh` configura o auto-start automaticamente:
- **Windows**: tarefa agendada `PainelPM2` executa `pm2 resurrect` no logon
- **Linux/macOS**: `pm2 startup` configura o init system

Após reiniciar o computador, o PM2 inicia automaticamente e restaura todos os processos salvos.

## Documentação

- [Planejamento do Produto](docs/00%20-%20PLANEJAMENTO%20DO%20PRODUTO%20—%20PLATAFORMA%20CENTRALIZADA%20DE%20GERENCIAMENTO%20DE%20PROJETOS%20E%20SERVI%C3%87OS.md)
- [Plano de Desenvolvimento](docs/01%20-%20PLANO_DE_DESENVOLVIMENTO.md)
- [Relatório de Segurança V1.1](docs/01%20-%20RELATORIO%20DE%20SEGURAN%C3%87A%20V1.1.md)
- [Guia de Uso do Painel](docs/02%20-%20GUIA%20DE%20USO%20DO%20PAINEL.md)
- [Planejamento V2](docs/03%20-%20PLANEJAMENTO%20V2.md)
- [Credenciais e Configurações](docs/03%20-%20Credenciais%20e%20Configuracoes.md)
- [Auditoria V1](docs/AUDITORIA_V1.md)
- [Plano de Correções V1](docs/PLANO_CORRECOES_V1.md)

## Licença

Este projeto é proprietário e de uso interno.
