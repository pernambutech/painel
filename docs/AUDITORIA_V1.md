# AUDITORIA V1 — RELATÓRIO COMPLETO

Data: 13/09/2026
Escopo: Auditoria completa da V1 existente (sem implementar V2)

---

## RESUMO EXECUTIVO

| Severidade | Quantidade |
|------------|-----------|
| CRÍTICO    | 4         |
| ALTO       | 9         |
| MÉDIO      | 12        |
| BAIXO      | 6         |

**Classificação Geral:** V1 possui bugs críticos de instalação e segurança que precisam ser corrigidos antes de considerar pronta para uso real.

---

## CRÍTICO — CORRIGIR OBRIGATORIAMENTE

### C1: ecosystem.config.js sobrescreve DATABASE_URL/JWT_SECRET com undefined
- **Arquivo:** `ecosystem.config.js` (linhas 23-24)
- **Causa:** `process.env.DATABASE_URL` e `process.env.JWT_SECRET` sobrescrevem valores parseados do `.env` com `undefined`
- **Impacto:** API falha ao conectar no banco e gerar tokens JWT quando iniciada via PM2
- **Correção:** Usar fallback: `process.env.DATABASE_URL || variaveisEnv.DATABASE_URL`

### C2: install.sh aponta PAINEL_DIR para scripts/ em vez da raiz
- **Arquivo:** `scripts/install.sh` (linhas 15-16)
- **Causa:** `dirname "$0"` retorna o diretório do script, não o pai
- **Impacto:** Script quebra se executado com caminho absoluto ou de outro diretório
- **Correção:** `RAIZ_DO_PROJETO="$(cd "$(dirname "$0")/.." && pwd)"`

### C3: install.bat não resolve diretório do projeto
- **Arquivo:** `scripts/install.bat`
- **Causa:** Ausência total de resolução de diretório
- **Impacto:** Todos os comandos executam no CWD do Explorer, não no projeto
- **Correção:** Adicionar `cd /d "%~dp0.."` no início

### C4: .gitignore não cobre apps/api-central/.env
- **Arquivo:** `.gitignore`
- **Causa:** Entrada `.env` é relativa e só cobre a raiz
- **Impacto:** Risco de commit acidental de credenciais (senha banco, JWT_SECRET)
- **Correção:** Adicionar `**/.env` ou `apps/api-central/.env` ao .gitignore

---

## ALTO — CORRIGIR PARA SEGURANÇA

### A1: Typo AENT_API_URL no ecosystem.config.js
- **Arquivo:** `ecosystem.config.js` (linha 68)
- **Causa:** `ambiente.AENT_API_URL` em vez de `ambiente.AGENT_API_URL`
- **Impacto:** Variável do .env é ignorada, fallback sempre é localhost:4001
- **Correção:** Corrigir typo

### A2: Diretório autorizado bypass por prefixo
- **Arquivo:** `apps/agente/src/index.ts` (linhas 297-323)
- **Causa:** `startsWith()` sem verificação de separador de path
- **Impacto:** `/autorizado/projeto` permite `/autorizado/projetomalicioso`
- **Correção:** Adicionar `path.sep` na verificação

### A3: Senha admin impressa no terminal
- **Arquivo:** `scripts/install.sh` (linha 170)
- **Causa:** `echo "Senha: $PAINEL_SENHA"`
- **Impacto:** Credencial visível em histórico de shell
- **Correção:** Remover impressão da senha

### A4: install.bat não passa variáveis para registrar-painel
- **Arquivo:** `scripts/install.bat` (linha 101)
- **Causa:** Chamada sem variáveis de ambiente
- **Impacto:** Windows sempre cria admin com credenciais padrão
- **Correção:** Adicionar variáveis de ambiente como no install.sh

### A5: install.bat não tem pm2 startup
- **Arquivo:** `scripts/install.bat`
- **Causa:** Ausência de configuração de auto-start
- **Impacto:** PM2 não inicia no boot do Windows
- **Correção:** Adicionar `pm2-startup` (equivalente Windows)

### A6: Dependência socket.io-client ausente no package.json do frontend
- **Arquivo:** `apps/painel-web/package.json`
- **Causa:** `useSocket.ts` importa mas não está nas dependências
- **Impacto:** Build pode falhar em instalação limpa
- **Correção:** Adicionar `socket.io-client` às dependências

### A7: Porta hardcoded errada (3001 vs 4001)
- **Arquivo:** `apps/painel-web/src/app/(painel)/ambientes/[id]/page.tsx` (linha 229)
- **Causa:** Fallback URL usa porta 3001 em vez de 4001
- **Impacto:** Health check aponta para porta errada
- **Correção:** Corrigir para 4001

### A8: Globais sem filtro de exceção — stack trace pode vazar
- **Arquivo:** `apps/api-central/src/main.ts`
- **Causa:** Ausência de ExceptionFilter personalizado
- **Impacto:** Em NODE_ENV não padrão, stack traces podem ser expostos
- **Correção:** Criar AllExceptionsFilter

### A9: CORS permite qualquer origem com credenciais
- **Arquivo:** `apps/api-central/src/main.ts`, gateways WebSocket
- **Causa:** `origin: true` reflete qualquer origem
- **Impacto:** Qualquer site pode fazer requests autenticados
- **Correção:** Restringir para origens conhecidas

---

## MÉDIO — MELHORAR CONFIABILIDADE

### M1: .env.example tem JWT_SECRET previsível
- **Arquivo:** `.env.example` (linha 30)
- **Correção:** Usar placeholder `SUA-CHAVE-SECRETA-AQUI`

### M2: Git ops usam execSync com interpolação de string
- **Arquivo:** `apps/agente/src/index.ts` (múltiplas linhas)
- **Correção:** Usar `execFileSync('git', ['pull', ...])` quando possível

### M3: Health check SSRF — URLs absolutas não restritas
- **Arquivo:** `apps/agente/src/index.ts`
- **Correção:** Restringir a localhost ou bloquear IPs privados

### M4: DIRETORIOS_AUTORIZADOS vazio = todos os diretórios permitidos
- **Arquivo:** `apps/agente/src/index.ts`
- **Correção:** Documentar comportamento e logar aviso

### M5: JWT sem mecanismo de revogação
- **Arquivo:** `apps/api-central/src/modules/autenticacao/`
- **Correção:** V2 — registrar como melhoria futura

### M6: Secrets armazenados como JSON plaintext no banco
- **Arquivo:** `prisma/schema.prisma` (variaveisAmbiente)
- **Correção:** V2 — criptografia em repouso

### M7: Sem rate limiting
- **Arquivo:** Toda a API
- **Correção:** V2 — @nestjs/throttler

### M8: Sem RBAC — qualquer membro pode tudo
- **Arquivo:** Todos os serviços
- **Correção:** V2 — enforcement por papel

### M9: Cadastro ignora tema de aparência
- **Arquivo:** `apps/painel-web/src/app/(auth)/cadastro/page.tsx`
- **Correção:** Aplicar useAparencia como no login

### M10: Cores hardcoded em páginas (ignora tema)
- **Arquivo:** Múltiplas páginas
- **Correção:** V2 — migrar para CSS variables

### M11: WebSocket painel vincula à primeira organização
- **Arquivo:** `comunicacao-painel.gateway.ts`
- **Correção:** V2 — mecanismo de troca de organização

### M12: Console.log em código de produção
- **Arquivo:** Múltiplos arquivos
- **Correção:** Substituir por Logger do NestJS

---

## BAIXO — INFORMATIVO

### B1: Slug collision não tratada graciosamente
### B2: Root route exposta sem autenticação
### B3: ExecSync bloqueia event loop do agente
### B4: CommitsModal define tipo local em vez de reutilizar
### B5: DadosDashboard definido localmente em 2 arquivos
### B6: Auth layout não redireciona usuários autenticados

---

## V2 — NÃO TOCAR

| Item | Razão |
|------|-------|
| GitHub / GitHub Actions | V2 |
| CI/CD pipelines | V2 |
| Deploy automático | V2 |
| Webhooks | V2 |
| RBAC avançado | V2 |
| Billing / Planos | V2 |
| IA / Automações | V2 |
| Docker / Kubernetes | V2 |
| Token refresh / blacklist | V2 |
| Criptografia de secrets | V2 |
| Rate limiting avançado | V2 |
| HTTPS enforcement | V2 |
| Loading/error boundary pages | V2 |
| Refatoração de componentes grandes | V2 |
