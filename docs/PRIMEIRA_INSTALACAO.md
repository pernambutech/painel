# Primeira Instalação — Passo a Passo Completo

## Pré-requisitos

- [Node.js](https://nodejs.org) >= 18.0.0
- [PostgreSQL](https://www.postgresql.org/) rodando na porta 5432
- Banco de dados `painel` criado

---

## Etapa 1: Instalação automática

```powershell
git clone https://github.com/pernambutech/painel.git
cd painel
scripts\install.bat
```

O `install.bat` executa **8 etapas automaticamente**:

| # | Etapa | O que faz |
|---|-------|-----------|
| 1 | Dependências | Verifica Node.js e npm |
| 2 | Pacotes | `npm install` |
| 3 | Ambiente | Cria `.env` + gera `JWT_SECRET` aleatório |
| 4 | Prisma | `prisma generate` |
| 5 | Migrations | `prisma migrate deploy` |
| 6 | Build | Compila API, Frontend e Agente |
| 7 | Usuário | Registra admin + organização + ambiente + projeto + serviços |
| 8 | PM2 | Inicia todos os processos |

Ao final, ele mostra:

```
Acesse: http://localhost:4000
Email: admin@painel.local
Senha: admin123
```

---

## Etapa 2: Acessar o Painel

Abra o navegador em **http://localhost:4000**

Se for a primeira vez, será redirecionado para a tela de **Cadastro** ou **Login**.

### Login

| Campo | Valor |
|-------|-------|
| Email | `admin@painel.local` |
| Senha | `admin123` |

> **IMPORTANTE:** Altere a senha após o primeiro login em **Configurações → Segurança**.

---

## Etapa 3: Verificar o que já foi criado automaticamente

O script `registrar-painel.js` já criou tudo para você. Verifique:

### Ambiente

1. Clique em **Ambientes** no menu lateral
2. Você verá o ambiente criado automaticamente:
   - **Nome:** Windows Local (ou Linux Local / macOS Local)
   - **Tipo:** Desenvolvimento
   - **Status:** Online (se o agente estiver conectado)

### Projeto

1. Clique em **Projetos** no menu lateral
2. Você verá o projeto:
   - **Nome:** Painel Central
   - **Descrição:** A própria plataforma gerenciada pelo Painel

### Serviços

1. Clique no projeto **Painel Central**
2. Você verá os 3 serviços:

| Serviço | Tipo | Porta | Comando |
|---------|------|-------|---------|
| painel-web | Frontend | 4000 | `npm run start -- -p 4000` |
| painel-api | API | 4001 | `npm run start` |
| painel-agente | Worker | — | `npm run start` |

---

## Etapa 4: Conectar o Agente

O agente permite que o painel gerencie os processos PM2. Para conectar:

### 4.1 Gerar token

1. Acesse **Ambientes** → clique no ambiente **Windows Local**
2. Clique no botão **Gerar Token**
3. Copie o token gerado (formato: `painel_xxxxx...`)

### 4.2 Configurar o token

Edite o arquivo `.env` na raiz do projeto e adicione o token:

```
AGENT_TOKEN=painel_xxxxx...o_token_copiado
```

### 4.3 Reiniciar o agente

```powershell
npx pm2 restart painel-agente
```

Ou reinicie tudo:

```powershell
start-pm2.bat
```

### 4.4 Verificar conexão

1. Volte ao painel → **Ambientes**
2. O status do ambiente deve mudar para **Online** (ponto verde)

---

## Etapa 5: Criar um novo projeto (opcional)

Para adicionar seu próprio projeto ao painel:

### 5.1 Criar projeto

1. Clique em **Projetos** → **+ Novo Projeto**
2. Preencha:
   - **Nome:** Meu App
   - **Descrição:** Descrição do meu projeto
3. Clique em **Criar Projeto**

### 5.2 Adicionar serviço

1. No projeto criado, clique em **Adicionar Serviço**
2. Preencha:

| Campo | Exemplo |
|-------|---------|
| Nome | frontend |
| Tipo | Frontend |
| Diretório | `C:\Projetos\meu-app\frontend` |
| Comando | `npm run dev` |
| Porta | 3000 |
| Ambiente | Windows Local |

3. Clique em **Criar Serviço**

### 5.3 Adicionar mais serviços

Repita o passo 5.2 para cada serviço do projeto (backend, worker, etc).

Exemplo completo:

| Serviço | Tipo | Porta | Comando |
|---------|------|-------|---------|
| frontend | Frontend | 3000 | `npm run dev` |
| backend | API | 3001 | `npm run dev` |
| worker | Worker | — | `npm run start` |

---

## Etapa 6: Gerenciar serviços

### Iniciar / Parar / Reiniciar

Na página do projeto, cada serviço tem botões de ação:

- **▶ Iniciar** — inicia o serviço via PM2
- **■ Parar** — para o serviço
- **↻ Reiniciar** — reinicia o serviço

### Ver logs

Clique em **Ver Logs** em qualquer serviço para ver os logs em tempo real.

### Verificar status

O painel mostra automaticamente:
- **Status:** Online / Offline / Erro
- **PID:** Identificação do processo
- **Uptime:** Tempo rodando
- **CPU / Memória:** Uso de recursos
- **Reinícios:** Quantidade de reinicializações

---

## Fluxo completo resumido

```
1. scripts\install.bat          → Instala e inicia tudo
2. http://localhost:4000        → Acessa o painel
3. Login                       → admin@painel.local / admin123
4. Ambientes → Gerar Token     → Copia token
5. .env → AGENT_TOKEN=...      → Cola token
6. start-pm2.bat               → Reinicia com token
7. Ambientes → Online          → Agente conectado ✓
8. Projetos → Novo Projeto     → Cria projetos
9. Projeto → Adicionar Serviço → Configura serviços
10. Serviço → Iniciar          → Gerencia processos
```

---

## Comandos úteis

```powershell
# Produção (PM2)
start-pm2.bat                  # Iniciar tudo
npx pm2 status                 # Ver status
npx pm2 logs                   # Ver logs
npx pm2 logs painel-api        # Logs da API
npx pm2 restart all            # Reiniciar tudo

# Desenvolvimento (hot reload)
npm run dev                    # API (terminal 1)
npm run dev:web                # Frontend (terminal 2)
npm run dev:agente             # Agente (terminal 3, precisa de token)

# Banco de dados
npx prisma studio              # Abrir GUI do banco
npx prisma migrate dev         # Criar migration
npx prisma generate            # Regenerar client
```
