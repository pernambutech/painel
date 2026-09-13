# PLANO DE CORREÇÕES V1

Data: 13/09/2026
Status: EM ANDAMENTO

---

## V1 — CORRIGIR (Obrigatório)

| # | Item | Arquivo(s) | Severidade |
|---|------|-----------|------------|
| 1 | ecosystem.config.js: DATABASE_URL/JWT_SECRET undefined | `ecosystem.config.js` | CRÍTICO |
| 2 | install.sh: PAINEL_DIR aponta para scripts/ | `scripts/install.sh` | CRÍTICO |
| 3 | install.bat: não resolve diretório | `scripts/install.bat` | CRÍTICO |
| 4 | .gitignore: não cobre apps/api-central/.env | `.gitignore` | CRÍTICO |
| 5 | ecosystem.config.js: typo AENT_API_URL | `ecosystem.config.js` | ALTO |
| 6 | install.sh: senha impressa no terminal | `scripts/install.sh` | ALTO |
| 7 | install.bat: não passa vars para registrar-painel | `scripts/install.bat` | ALTO |
| 8 | install.bat: ausência pm2 startup | `scripts/install.bat` | ALTO |
| 9 | socket.io-client: dependência ausente no frontend | `apps/painel-web/package.json` | ALTO |
| 10 | ambientes/[id]: porta hardcoded 3001 errada | `apps/painel-web/.../ambientes/[id]/page.tsx` | ALTO |
| 11 | AllExceptionsFilter: ausente | `apps/api-central/src/main.ts` | ALTO |
| 12 | CORS: restrorigens | `apps/api-central/src/main.ts` | ALTO |
| 13 | Agente: bypass de diretório por prefixo | `apps/agente/src/index.ts` | ALTO |
| 14 | .env.example: JWT_SECRET previsível | `.env.example` | MÉDIO |
| 15 | Cadastro: ignora tema de aparência | `apps/painel-web/.../cadastro/page.tsx` | MÉDIO |
| 16 | Console.log em produção | Múltiplos arquivos | MÉDIO |

---

## V1 — OPCIONAL (Melhorias sem mudança de escopo)

| # | Item | Notas |
|---|------|-------|
| O1 | Git ops: usar execFileSync em vez de execSync | Segurança, mas funcional como está |
| O2 | DIRETORIOS_AUTORIZADOS: logar aviso quando vazio | Informativo |

---

## V2 — NÃO TOCAR

| Item | Razão |
|------|-------|
| Token refresh / blacklist | V2 |
| Rate limiting (@nestjs/throttler) | V2 |
| RBAC enforcement | V2 |
| Criptografia de variaveisAmbiente | V2 |
| HTTPS enforcement | V2 |
| Loading/error boundary pages (Next.js) | V2 |
| Refatoração de componentes grandes | V2 |
| Migração completa para CSS variables | V2 |
| WebSocket multi-org | V2 |
| Token rotation para agentes | V2 |
| Health check SSRF avançado | V2 |
| GitHub / CI/CD / Deploy | V2 |
