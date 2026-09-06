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

PAINEL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PAINEL_DIR"

echo "========================================="
echo "   Painel - Instalação Automatizada"
echo "========================================="
echo ""

# Função para verificar se comando existe
comando_existe() {
    command -v "$1" >/dev/null 2>&1
}

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

# Iniciar via PM2
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Inicialização automática..."
pm2 startup 2>/dev/null || echo "   (pule o pm2 startup se não tiver permissão)"

echo ""
echo "========================================="
echo "   Instalação Concluída! 🎉"
echo "========================================="
echo ""
echo "Próximos passos:"
echo "  1. Acesse: http://localhost:4000"
echo "  2. Faça login com:"
echo "     Email: $PAINEL_EMAIL"
echo "     Senha: $PAINEL_SENHA"
echo "  3. Crie seu primeiro ambiente e agente"
echo "  4. Configure seus projetos e serviços"
echo ""
echo "Comandos úteis:"
echo "  pm2 status    - Ver status dos processos"
echo "  pm2 logs      - Ver logs em tempo real"
echo "  npm run dev   - Reiniciar em modo desenvolvimento"
echo ""
echo "Para mais informações, consulte o README.md"