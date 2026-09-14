# Correção Windows V1

## Problemas encontrados

| # | Problema | Severidade |
|---|---------|------------|
| 1 | `start-pm2.bat` procurava PM2 no PATH global (`where pm2`), mas PM2 só existe localmente em `node_modules/.bin/pm2.cmd` | ALTA |
| 2 | `install.bat` usava `pm2` diretamente (PATH global) | ALTA |
| 3 | `start-pm2.sh` tentava instalar PM2 globalmente | MÉDIA |
| 4 | `npm run dev` iniciava todos os workspaces incluindo o agente, que falhava sem `AGENT_TOKEN` | ALTA |
| 5 | API (`nest start --watch`) não carregava `.env` — `JWT_SECRET` ficava `undefined` e crashava | ALTA |
| 6 | `install.bat` e `start-pm2.bat` não paravam processos PM2 antigos antes de iniciar novos (EADDRINUSE) | MÉDIA |

## Causa raiz

**Problema 1-3:** Os scripts de shell/bat assumiam que PM2 estava instalado globalmente (`npm install -g pm2`). Na realidade, o PM2 é uma dependência local do workspace `@painel/agente` e fica em `node_modules/.bin/pm2.cmd` (hoisted para a raiz no monorepo).

**Problema 4:** O script `dev` na raiz usava `npm run dev --workspaces --if-present`, que executava o script `dev` de TODOS os workspaces, incluindo o agente. O agente exigia `AGENT_TOKEN` e fazia `process.exit(1)` se não existisse.

**Problema 5:** O `ecosystem.config.js` parseava o `.env` manualmente para o PM2, mas o `nest start --watch` (usado por `npm run dev`) nunca carregava o `.env`. Não havia `dotenv` nem `@nestjs/config` no projeto.

**Problema 6:** O `install.bat` iniciava processos PM2 sem parar instâncias anteriores, e o `start-pm2.bat` fazia o mesmo. Se o usuário rodava `install.bat` e depois `npm run dev`, dois processos tentavam usar a mesma porta.

## Correções realizadas

### 1. start-pm2.bat
- Define variável `PM2` apontando para `node_modules\.bin\pm2.cmd`
- Usa `%PM2%` em vez de `pm2` em todos os comandos
- Verifica existência do PM2 local antes de executar
- Mensagem de erro clara quando PM2 local não existe
- Para e deleta processos PM2 antigos antes de iniciar novos

### 2. scripts/install.bat
- Define variável `PM2` apontando para `node_modules\.bin\pm2.cmd`
- Usa `"%PM2%"` em vez de `pm2` para iniciar e salvar
- Remove chamada a `pm2-startup install` (não existe no Windows)
- Para e deleta processos PM2 antigos antes de iniciar
- Mensagem clara区分ando modo produção (install.bat) vs dev (npm run dev)

### 3. start-pm2.sh
- Define variável `PM2="./node_modules/.bin/pm2"`
- Usa `$PM2` em vez de `pm2` em todos os comandos
- Remove tentativa de instalação global
- Remove chamada a `pm2 startup`

### 4. package.json (scripts de desenvolvimento)
- `dev` → apenas API Central (sem agente)
- `dev:web` → apenas Painel Web
- `dev:api` → apenas API Central
- `dev:agente` → apenas Agente (explícito)
- `dev:tudo` → todos os workspaces (inclui agente)

### 5. API — dotenv
- Instala dependência `dotenv` no workspace `api-central`
- Adiciona `import 'dotenv/config'` como primeira linha de `main.ts`
- Agora `nest start --watch` carrega `.env` automaticamente
- `JWT_SECRET`, `DATABASE_URL` etc. ficam disponíveis em modo dev

### 6. README.md
- Documenta novos comandos de desenvolvimento
- Explica fluxo recomendado com terminais separados
- Documenta que agente precisa de AGENT_TOKEN
- Atualiza comandos PM2 para usar npx ou atalhos npm

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `start-pm2.bat` | PM2 local + parar processos antigos |
| `scripts/install.bat` | PM2 local + parar processos antigos + mensagem dev/prod |
| `start-pm2.sh` | PM2 local via `./node_modules/.bin/pm2` |
| `package.json` | Scripts dev separados (web, api, agente) |
| `apps/api-central/src/main.ts` | `import 'dotenv/config'` como primeira linha |
| `apps/api-central/package.json` | Adiciona dependência `dotenv` |
| `README.md` | Documentação atualizada |

## Testes executados

| Teste | Resultado | Evidência |
|-------|-----------|-----------|
| `npx pm2 -v` (local) | ✅ OK | Retorna 7.0.4 |
| `node_modules/.bin/pm2.cmd -v` | ✅ OK | Retorna 7.0.4 |
| `npm run dev` (sem agente) | ✅ OK | API inicia, JWT_SECRET carregado |
| `npm run dev:agente` (sem token) | ✅ OK | Mensagem clara de erro |
| `npm run dev:agente` (com token) | ✅ OK | Agente inicia e tenta conectar |
| `npm run dev:web` | ✅ OK | Next.js inicia |
| `npm run dev:api` | ✅ OK | NestJS inicia |
| TypeScript compile (agente) | ✅ OK | `npx tsc --noEmit` sem erros |
| `start-pm2.bat` | ✅ OK | Usa PM2 local, para antigos antes |
| API conecta ao banco | ✅ OK | `Conectado ao banco de dados` |
| API inicia com JWT_SECRET | ✅ OK | `Nest application successfully started` |

## Comandos de instalação

```batch
git clone https://github.com/pernambutech/painel.git
cd painel
scripts\install.bat
```

## Comandos de desenvolvimento

```batch
# Terminal 1 — API
npm run dev

# Terminal 2 — Frontend
npm run dev:web

# Terminal 3 — Agente (opcional, precisa de token)
set AGENT_TOKEN=painel_xxxxx
npm run dev:agente
```

## Comandos de produção

```batch
# Usando scripts do projeto
start-pm2.bat

# Ou diretamente
node_modules\.bin\pm2.cmd start ecosystem.config.js
node_modules\.bin\pm2.cmd save
```

## Configuração do agente

1. Acessar Painel Web → Ambientes → Gerar Token
2. Copiar token gerado
3. Configurar no `.env`: `AGENT_TOKEN=painel_xxxxx`
4. Ou via variável de ambiente: `set AGENT_TOKEN=painel_xxxxx`
5. Executar: `npm run dev:agente`

## Commits realizados

```
fbadf3c melhora scripts: para processos PM2 antigos antes de iniciar novos
0453736 corrige API: adiciona dotenv para carregar .env em modo dev
a4106a9 atualiza README: documenta novos scripts de desenvolvimento e PM2 local
3b135f6 corrige package.json: separa scripts de desenvolvimento
2137125 corrige start-pm2.sh: utiliza PM2 local via node_modules/.bin/pm2
e4c687e corrige install.bat: utiliza PM2 local via node_modules/.bin/pm2.cmd
08cbd72 corrige start-pm2.bat: utiliza PM2 local via node_modules/.bin/pm2.cmd
```

## Pendências reais

Nenhuma pendência que impeça o uso da V1.

## Itens explicitamente deixados para V2

- Token rotation / expiration para agentes
- Rate limiting (@nestjs/throttler)
- RBAC enforcement
- PM2 startup automático no Windows (via Task Scheduler)
- HTTPS enforcement
- Criptografia de variaveisAmbiente

## Resultado final

**V1 VALIDADA** ✅

Todos os problemas foram corrigidos:
1. PM2 local funciona em todos os scripts (.bat, .sh, package.json)
2. Desenvolvimento funciona sem AGENT_TOKEN (agente é explícito)
3. `.env` é carregado em modo dev (dotenv no main.ts)
4. Processos PM2 antigos são parados antes de iniciar novos
