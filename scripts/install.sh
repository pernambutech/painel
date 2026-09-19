#!/bin/bash
# Painel - Script de Instalação Automatizada
# Suporta: Linux, macOS
# 
# Este script executa todas as etapas necessárias para uma instalação do zero:
# 1. Verificação de dependências
# 2. Instalação de pacotes
# 3. Configuração de ambiente
# 4. Migrações de banco
# 5. Registro do primeiro usuário
# 6. Início dos processos

set -e

PAINEL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PAINEL_DIR"

echo "========================================="
echo "   Painel - Instalação Automatizada"
echo "========================================="
echo ""

# Função para verificar se comando existe
comando_existe() {
    command -v "$1" >/dev/null 2>&1
}

echo "🧹 Etapa 0: Limpando estado anterior..."

# Parar e matar daemon PM2
if comando_existe pm2; then
    pm2 kill 2>/dev/null || true
elif [ -f "./node_modules/.bin/pm2" ]; then
    ./node_modules/.bin/pm2 kill 2>/dev/null || true
fi

# Deletar dump do PM2 (lista de processos salvos)
if [ -f "$HOME/.pm2/dump.pm2" ]; then
    rm -f "$HOME/.pm2/dump.pm2"
    echo "   Dump PM2 removido"
fi

# Limpar logs antigos do PM2
if [ -d "$HOME/.pm2/logs" ]; then
    rm -f "$HOME/.pm2/logs/"*.log "$HOME/.pm2/logs/"*.err 2>/dev/null
    echo "   Logs PM2 limpos"
fi

# Resetar banco de dados
if [ -f "./node_modules/.bin/prisma" ] || comando_existe npx; then
    echo "   Resetando banco de dados..."
    npx prisma migrate reset --force --schema=apps/api-central/prisma/schema.prisma 2>/dev/null || true
    echo "   Banco resetado OK"
fi
echo "   Estado limpo OK"

echo ""
echo "🔍 Etapa 1: Verificando dependências..."

# Verificar Node.js
if ! comando_existe node; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js >= 18.0.0"
    exit 1
else
    NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -lt 18 ]; then
        echo "⚠️  Node.js versão $NODE_VER detectada. Recomenda-se >= 18.0.0"
    else
        echo "✅ Node.js $(node --version) encontrado"
    fi
fi

# Verificar npm
if ! comando_existe npm; then
    echo "❌ npm não encontrado"
    exit 1
else
    echo "✅ npm $(npm --version) encontrado"
fi

# Verificar PostgreSQL
if ! comando_existe psql && ! comando_existe pg_isready; then
    echo "⚠️  PostgreSQL não encontrado no PATH. Verifique se está instalado."
    echo "   Em Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   Em macOS: brew install postgresql"
    read -p "Deseja continuar mesmo assim? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Etapa 2: Instalando dependências..."

npm install

echo ""
echo "🌍 Etapa 3: Configurando ambiente..."

# Copiar .env.example se .env não existir
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado a partir do .env.example"
    echo "   ⚠️  Lembre-se de editar o arquivo .env com suas configurações"
else
    echo "✅ Arquivo .env já existe"
fi

# Detectar SO para configurações específicas
OS=$(uname -s)
case "$OS" in
    Linux*) 
        PLATFORM="linux"
        echo "🐧 Sistema detectado: Linux"
        ;;
    Darwin*) 
        PLATFORM="macos"
        echo "🍎 Sistema detectado: macOS"
        ;;
    *) 
        PLATFORM="unknown"
        echo "❓ Sistema desconhecido: $OS"
        ;;
esac

echo ""
echo "🗄️  Etapa 4: Configurando banco de dados..."

# Gerar cliente Prisma
npm run prisma:generate -w apps/api-central

# Aplicar migrações
echo "   Aplicando migrações..."
npm run prisma:migrate -w apps/api-central 2>&1 | tail -10

echo ""
echo "🏗️  Etapa 5: Build dos projetos..."

# Build dos projetos
npm run build 2>&1 | tail -20

echo ""
echo "👤 Etapa 6: Registrando primeiro usuário..."

# Registrar o painel (com valores padrões ou solicitar ao usuário)
DEFAULT_EMAIL="admin@painel.local"
DEFAULT_SENHA="admin123"

read -p "Deseja usar e-mail padrão (admin@painel.local)? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    PAINEL_EMAIL=$DEFAULT_EMAIL
else
    read -p "Digite o e-mail do admin: " PAINEL_EMAIL
fi

read -p "Digite a senha do admin (ou Enter para usar $DEFAULT_SENHA): " PAINEL_SENHA
if [ -z "$PAINEL_SENHA" ]; then
    PAINEL_SENHA=$DEFAULT_SENHA
fi

read -p "Digite o nome do admin (ou Enter para usar 'Administrador'): " PAINEL_NOME
if [ -z "$PAINEL_NOME" ]; then
    PAINEL_NOME="Administrador"
fi

read -p "Digite o nome da organização (ou Enter para usar 'Minha Organização'): " PAINEL_ORG
if [ -z "$PAINEL_ORG" ]; then
    PAINEL_ORG="Minha Organização"
fi

# Executar registro
PAINEL_ADMIN_EMAIL="$PAINEL_EMAIL" \
PAINEL_ADMIN_SENHA="$PAINEL_SENHA" \
PAINEL_ADMIN_NOME="$PAINEL_NOME" \
PAINEL_ORG_NOME="$PAINEL_ORG" \
npm run pm2:registrar-painel

echo ""
echo "🚀 Etapa 7: Iniciando processos..."

# Definir caminho do PM2 local
PM2="./node_modules/.bin/pm2"

# Verificar se PM2 local existe
if [ ! -f "$PM2" ]; then
    echo "❌ PM2 local nao encontrado. Verifique se 'npm install' foi executado."
    exit 1
fi

# Iniciar via PM2 local
$PM2 start ecosystem.config.js
$PM2 save

echo ""
echo "========================================="
echo "   Instalação Concluída! 🎉"
echo "========================================="
echo ""
echo "Próximos passos:"
echo "  1. Acesse: http://localhost:4000"
echo "  2. Faça login com:"
echo "     Email: $PAINEL_EMAIL"
echo "     Senha: (a senha que você definiu)"
echo "  3. Crie seu primeiro ambiente e agente"
echo "  4. Configure seus projetos e serviços"
echo ""
echo "Comandos úteis:"
echo "  npx pm2 status    - Ver status dos processos"
echo "  npx pm2 logs      - Ver logs em tempo real"
echo "  npm run dev       - Iniciar em modo desenvolvimento"
echo ""
echo "Para mais informações, consulte o README.md"