# Configurações e Credenciais - Desenvolvimento Local

## Credenciais do PostgreSQL

| Campo | Valor |
|-------|-------|
| **Usuário** | `postgres` |
| **Senha** | `admin` |
| **Host** | `localhost` |
| **Porta** | `5432` |
| **Banco** | `painel` |

**URL de conexão:**
```
postgresql://postgres:admin@localhost:5432/painel?schema=public
```

---

## Variáveis de Ambiente (.env)

### API Central (`apps/api-central/.env`)

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:admin@localhost:5432/painel?schema=public"

# Segurança
JWT_SECRET="painel-jwt-secret-desenvolvimento-2024"

# Porta da API
PORT=3001
```

### Painel Web (`apps/painel-web/.env.local`)

```env
# URL da API Central
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Agente (variáveis de ambiente ao executar)

```env
# Token gerado pela plataforma
AGENT_TOKEN=painel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL da API
AGENT_API_URL=http://localhost:3001
```

---

## Portas dos Serviços

| Serviço | Porta | URL |
|---------|-------|-----|
| PostgreSQL | 5432 | `localhost:5432` |
| API Central | 3001 | `http://localhost:3001` |
| Painel Web | 3000 | `http://localhost:3000` |

---

## Como Iniciar os Serviços

### 1. Banco de Dados
O PostgreSQL deve estar rodando como serviço do Windows.
Se não estiver:
```bash
# Verificar status
Get-Service postgresql*

# Iniciar (se necessário)
Start-Service postgresql*
```

### 2. API Central
```bash
cd apps/api-central
npm run dev
```

### 3. Painel Web
```bash
cd apps/painel-web
npm run dev
```

### 4. Agente (opcional, para testes)
```bash
cd apps/agente
set AGENT_TOKEN=<token_gerado_pela_plataforma>
set AGENT_API_URL=http://localhost:3001
npx tsx src/index.ts
```

---

## Fluxo de Teste

1. Acesse `http://localhost:3000/cadastro`
2. Crie uma conta (nome, email, senha)
3. Faça login
4. Crie um ambiente
5. No detalhe do ambiente, gere um token de agente
6. Execute o agente localmente com o token
7. O status do agente deve mudar para "Conectado"

---

## Notas Importantes

- **JWT Secret**: Em produção, use uma chave forte e aleatória
- **PostgreSQL**: A senha `admin` é apenas para desenvolvimento local
- **Agent Tokens**: Cada agente possui um token único gerado pela plataforma
- **CORS**: A API aceita requisições de `http://localhost:3000` em desenvolvimento
