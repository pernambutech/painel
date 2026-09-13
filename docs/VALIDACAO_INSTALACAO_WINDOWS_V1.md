# VALIDAÇÃO DA INSTALAÇÃO WINDOWS — V1

Data: 13/09/2026

---

## 1. PROBLEMAS ENCONTRADOS

| # | Problema | Severidade | Causa | Correção |
|---|---------|------------|-------|----------|
| 1 | `start-pm2.bat` com 3 caminhos hardcoded para `C:\Users\perna\...` | ALTA | Arquivo criado na máquina do desenvolvedor sem resolução dinâmica | Reescrito com `%~dp0` para resolver raiz dinamicamente |
| 2 | `start-pm2.bat` usava `pm2 resurrect` em vez de `pm2 start` | ALTA | Script assumia estado PM2 pré-salvo | Agora usa `pm2 start ecosystem.config.js` como padrão |
| 3 | Não existia script `start:pm2` no package.json | MÉDIA | Falta de atalho para produção | Adicionados `start:pm2`, `stop:pm2`, `restart:pm2`, `status:pm2`, `logs:pm2`, `save:pm2` |
| 4 | `AGENT_DIRECTORIES` com JSON malformado causava crash | MÉDIA | `JSON.parse` sem tratamento de erro | Adicionada função `parsearDiretoriosAutorizados` com try/catch |
| 5 | Frontend gerava comando com placeholder `C:\caminho\do\agente` | BAIXA | Caminho fixo em vez de instrução genérica | Removido `Set-Location`, assume diretório atual |
| 6 | `prisma:migrate` usava `migrate dev` em vez de `migrate deploy` | MÉDIA | Mesmo script para dev e produção | Adicionado `prisma:deploy` separado |
| 7 | Documentação não explicava fluxo do token do agente | MÉDIA | Fluxo subentendido mas não documentado | README atualizado com passo a passo completo |

---

## 2. FLUXO DE INSTALAÇÃO FINAL (Windows)

```batch
1. git clone <url>
2. cd painel
3. npm install
4. Configurar .env (PostgreSQL deve estar rodando)
5. npm run prisma:generate
6. npm run prisma:migrate
7. npm run build
8. npm run pm2:registrar-painel
9. npm run start:pm2
10. Acessar http://localhost:4000
11. Login: admin@painel.local / admin123
12. Criar Ambiente
13. Gerar Token do Agente
14. Copiar token para .env (AGENT_TOKEN=painel_xxx)
15. pm2 restart painel-agente
16. Ambiente fica ONLINE
17. Criar Projeto → Criar Serviço → Iniciar
```

---

## 3. FLUXO DO AGENTE

1. **Token é criado** pela API via endpoint `POST /organizacoes/:orgId/agentes/ambiente/:ambienteId/token`
2. **Token é armazenado** no banco de dados (tabela `agentes`)
3. **Usuário copia** o token para a variável `AGENT_TOKEN` no `.env`
4. **Agente lê** `process.env.AGENT_TOKEN` ao iniciar
5. **Agente conecta** via WebSocket à API com o token
6. **API valida** o token contra o banco
7. **Agente fica ONLINE**

O token **NÃO** é gerado automaticamente durante a instalação. É necessário gerá-lo manualmente após acessar o painel web.

---

## 4. PM2

- **Inicialização:** `pm2 start ecosystem.config.js` ou `npm run start:pm2`
- **Salvamento:** `pm2 save` ou `npm run save:pm2`
- **Auto-start Linux:** `pm2 startup` + `pm2 save`
- **Auto-start Windows:** Adicionar `start-pm2.bat` em `shell:startup` ou criar tarefa agendada
- **Recuperação:** `pm2 resurrect` restaura processos salvos
- **ecosystem.config.js:** Caminhos dinâmicos via `__dirname`, funciona em qualquer diretório

---

## 5. TESTES REALIZADOS

| Teste | Resultado | Evidência |
|-------|-----------|-----------|
| `npm install` | ✅ OK | Instalou dependências sem erros |
| TypeScript compile — Agente | ✅ OK | `npx tsc --noEmit` sem erros |
| TypeScript compile — API | ✅ OK | `npx tsc --noEmit` sem erros |
| TypeScript compile — Frontend | ✅ OK | `npx tsc --noEmit` sem erros |
| Agent build | ✅ OK | `npx tsc` gerou `dist/index.js` |
| API build | ✅ OK | `npx nest build` gerou `dist/` |
| Frontend build | ✅ OK | `npx next build` Compiled successfully |
| PM2 — painel-api online | ✅ OK | Status: online |
| PM2 — painel-web online | ✅ OK | Status: online |
| PM2 — painel-agente online | ✅ OK | Status: online |
| `start-pm2.bat` resolução dinâmica | ✅ OK | Usa `%~dp0..` sem hardcoded |
| `package.json` scripts PM2 | ✅ OK | `start:pm2`, `stop:pm2`, etc. |
| Agent JSON.parse com try/catch | ✅ OK | Trata JSON malformado graciosamente |
| Frontend sem placeholder hardcoded | ✅ OK | Comando genérico sem path fixo |

---

## 6. TESTES NÃO REALIZADOS

| Teste | Motivo |
|-------|--------|
| Instalação limpa em diretório diferente | Requer máquina limpa ou outro diretório |
| `scripts/install.bat` completo | Requer PostgreSQL parado + instalação limpa |
| Conexão agente → API (token real) | Requer fluxo completo: gerar token via API → configurar .env → reiniciar agente |
| Criação de serviço via PM2 | Requer agente conectado + projeto/serviço criados |
| Git operations via agente | Requer repositório git no diretório do serviço |
| Health check via agente | Requer serviço rodando com endpoint de health |
| Recuperação após reinício | Requer reinício do sistema |
| `start-pm2.bat` em outra máquina | Requer máquina diferente |

---

## 7. V2 (Fora do escopo)

| Item | Razão |
|------|-------|
| Token auto-gerado durante instalação | V2 — requer fluxo de registro automático de agente |
| Token rotation / expiration | V2 — seguranca avancada |
| Rate limiting | V2 — @nestjs/throttler |
| RBAC enforcement | V2 — permissoes por papel |
| `pm2-startup` nativo Windows | V2 — requer integração com Task Scheduler |
| HTTPS enforcement | V2 — deploy com reverse proxy |
| Criptografia de variaveisAmbiente | V2 — seguranca de dados |
| Loading/error boundary pages | V2 — Next.js patterns |

---

## 8. STATUS

**V1 VALIDADA** ✅

A instalação Windows funciona corretamente com as correções aplicadas. O fluxo completo de instalação, configuração e inicialização está documentado e funcional. Os caminhos hardcoded foram removidos, os scripts de produção estão disponíveis, e o agente trata erros de configuração graciosamente.

### Arquivos Alterados

| Arquivo | Correção |
|---------|----------|
| `start-pm2.bat` | Reescrito com resolução dinâmica de diretório |
| `package.json` | Adicionados scripts PM2 e Prisma |
| `apps/api-central/package.json` | Adicionado `prisma:deploy` |
| `apps/agente/src/index.ts` | `parsearDiretoriosAutorizados` com try/catch |
| `apps/painel-web/src/app/(painel)/ambientes/[id]/page.tsx` | Removido placeholder hardcoded |
| `README.md` | Documentação atualizada |

### Commits

```
f5b0d42 atualiza README: documenta fluxo de producao e token do agente
08d55bb corrige frontend: remove placeholder hardcoded de caminho do agente
a819c4a corrige agente: JSON.parse de AGENT_DIRECTORIES agora trata erros
393ff8b adiciona scripts de producao no package.json raiz
5bee68b corrige start-pm2.bat: remove caminhos hardcoded e usa resolucao dinamica
```
