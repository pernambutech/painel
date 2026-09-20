#!/bin/bash
# Painel - Script de Instalacao Automatizada (Linux/macOS)
# Ordem correta: PM2 cleanup → check deps → install → .env → generate → reset → migrate → build → register → pm2

set -e

PAINEL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PAINEL_DIR"

echo "========================================="
echo "   Painel - Instalacao Completa"
echo "========================================="
echo ""
echo "Diretorio: $(pwd)"
echo ""

# Funcao para verificar se comando existe
comando_existe() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================
# [1/9] PM2: parar daemon e limpar estado
# =============================================
echo "[1/10] Limpando PM2..."
if comando_existe pm2; then
    pm2 kill 2>/dev/null || true
elif [ -f "./node_modules/.bin/pm2" ]; then
    ./node_modules/.bin/pm2 kill 2>/dev/null || true
fi
if [ -f "$HOME/.pm2/dump.pm2" ]; then
    rm -f "$HOME/.pm2/dump.pm2"
    echo "   Dump PM2 removido"
fi
if [ -d "$HOME/.pm2/logs" ]; then
    rm -f "$HOME/.pm2/logs/"*.log "$HOME/.pm2/logs/"*.err 2>/dev/null || true
    echo "   Logs PM2 limpos"
fi
echo "   PM2 limpo OK"

# =============================================
# [2/9] Verificar dependencias
# =============================================
echo ""
echo "[2/10] Verificando dependencias..."

if ! comando_existe node; then
    echo "ERRO: Node.js nao encontrado. Instale em https://nodejs.org"
    exit 1
fi
NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "   AVISO: Node.js versao $NODE_VER detectada. Recomenda-se >= 18"
else
    echo "   Node.js $(node --version) OK"
fi

if ! comando_existe npm; then
    echo "ERRO: npm nao encontrado"
    exit 1
fi
echo "   npm $(npm --version) OK"

# =============================================
# [3/9] Instalar dependencias
# =============================================
echo ""
echo "[3/10] Instalando dependencias..."
npm install
echo "   Dependencias instaladas OK"

# =============================================
# [4/9] Configurar .env (JWT_SECRET)
# =============================================
echo ""
echo "[4/10] Configurando variaveis de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   Arquivo .env criado"
else
    echo "   Arquivo .env ja existe"
fi

# Gerar JWT_SECRET via node
echo "   Gerando JWT_SECRET..."
NOVO_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
if [ -n "$NOVO_SECRET" ]; then
    node -e "const fs=require('fs'),c=fs.readFileSync('.env','utf8').split(/\r?\n/);const o=c.map(l=>l.startsWith('JWT_SECRET=')?'JWT_SECRET=$NOVO_SECRET':l);fs.writeFileSync('.env',o.join('\n'),'utf8')"
    echo "   JWT_SECRET gerado OK"
else
    echo "   AVISO: Nao foi possivel gerar JWT_SECRET"
fi
echo "   Variaveis de ambiente OK"

# =============================================
# [5/9] Prisma: generate
# =============================================
echo ""
echo "[5/10] Gerando Prisma Client..."
npx prisma generate --schema=apps/api-central/prisma/schema.prisma
echo "   Prisma Client gerado OK"

# =============================================
# [6/9] Resetar banco de dados
# =============================================
echo ""
echo "[6/10] Resetando banco de dados..."
npx prisma migrate reset --force --schema=apps/api-central/prisma/schema.prisma
echo "   Banco resetado OK"

# =============================================
# [7/9] Build dos projetos
# =============================================
echo ""
echo "[7/10] Compilando projetos..."
npm run build
echo "   Build concluido OK"

# =============================================
# [8/9] Registrar: usuario + org + ambiente + agente + token
# =============================================
echo ""
echo "[8/10] Registrando primeiro usuario..."
PAINEL_ADMIN_EMAIL="${PAINEL_ADMIN_EMAIL:-admin@painel.local}"
PAINEL_ADMIN_SENHA="${PAINEL_ADMIN_SENHA:-admin123}"
PAINEL_ADMIN_NOME="${PAINEL_ADMIN_NOME:-Administrador}"
PAINEL_ORG_NOME="${PAINEL_ORG_NOME:-Minha Organizacao}"

PAINEL_ADMIN_EMAIL="$PAINEL_ADMIN_EMAIL" \
PAINEL_ADMIN_SENHA="$PAINEL_ADMIN_SENHA" \
PAINEL_ADMIN_NOME="$PAINEL_ADMIN_NOME" \
PAINEL_ORG_NOME="$PAINEL_ORG_NOME" \
npm run pm2:registrar-painel
echo "   Usuario + ambiente + agente + token registrados OK"
echo "   Email: $PAINEL_ADMIN_EMAIL"
echo "   Senha: $PAINEL_ADMIN_SENHA"

# =============================================
# [9/10] Iniciar processos via PM2
# =============================================
echo ""
echo "[9/10] Iniciando processos via PM2..."
PM2="./node_modules/.bin/pm2"
if [ ! -f "$PM2" ]; then
    echo "ERRO: PM2 nao encontrado em: $PM2"
    exit 1
fi
$PM2 start ecosystem.config.js
$PM2 save
$PM2 status

# =============================================
# [10/10] Configurar auto-start no Linux/macOS
# =============================================
echo ""
echo "[10/10] Configurando auto-start..."
if comando_existe pm2; then
    STARTUP_OUTPUT=$(pm2 startup -u "$USER" 2>&1 || true)
    # Extrair comando sudo retornado pelo pm2 startup
    SUDO_CMD=$(echo "$STARTUP_OUTPUT" | grep -o 'sudo .*' | head -1)
    if [ -n "$SUDO_CMD" ]; then
        echo "   Executando: $SUDO_CMD"
        eval "$SUDO_CMD" 2>/dev/null || echo "   AVISO: Necessario executar manualmente como root: $SUDO_CMD"
    else
        echo "   PM2 startup ja configurado ou nao disponivel"
    fi
    $PM2 save > /dev/null 2>&1
    echo "   Auto-start configurado"
else
    echo "   AVISO: PM2 global nao encontrado. Auto-start requer pm2 global."
    echo "   Para configurar manualmente: npm install -g pm2 && pm2 startup && pm2 save"
fi

# =============================================
# SUCESSO
# =============================================
echo ""
echo "========================================="
echo "   Instalacao Concluida com Sucesso!"
echo "========================================="
echo ""
echo "Acesse: http://localhost:4000"
echo ""
echo "Credenciais:"
echo "  Email: $PAINEL_ADMIN_EMAIL"
echo "  Senha: $PAINEL_ADMIN_SENHA"
echo ""
echo "O agente PM2 ja esta rodando com token configurado."
echo ""
echo "Comandos uteis:"
echo "  npx pm2 status    Ver status"
echo "  npx pm2 logs      Ver logs"
echo "  npm run dev       Modo desenvolvimento"
echo ""
