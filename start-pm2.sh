#!/bin/bash
# Inicia o Painel via PM2 (Linux/macOS)
# Utiliza o PM2 local do projeto (node_modules/.bin/pm2)

set -e

PAINEL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PAINEL_DIR"

echo "🚀 Iniciando o Painel via PM2..."
echo ""

# Definir caminho do PM2 local
PM2="./node_modules/.bin/pm2"

# Verificar se PM2 local existe
if [ ! -f "$PM2" ]; then
    echo "❌ PM2 local nao encontrado em: $PM2"
    echo ""
    echo "   Execute primeiro:"
    echo "     npm install"
    echo ""
    echo "   Ou execute o instalador:"
    echo "     scripts/install.sh"
    exit 1
fi

# Verificar se node esta disponivel
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nao encontrado no PATH."
    exit 1
fi

# Verificar se os builds existem
if [ ! -f "apps/api-central/dist/main.js" ]; then
    echo "⚓ Build da API nao encontrado. Execute 'npm run build' primeiro."
    exit 1
fi

if [ ! -f "apps/agente/dist/index.js" ]; then
    echo "⚓ Build do agente nao encontrado. Execute 'npm run build' primeiro."
    exit 1
fi

# Iniciar processos via PM2 usando ecosystem.config.js
echo "⚙️  Iniciando processos PM2..."
$PM2 start ecosystem.config.js

# Salvar estado para reinicialização automática
echo ""
echo "💾 Salvando estado do PM2..."
$PM2 save

echo ""
echo "✅ Painel iniciado com sucesso!"
echo ""
echo "Comandos úteis:"
echo "  npm run status:pm2  - Ver status dos processos"
echo "  npm run logs:pm2    - Ver logs em tempo real"
echo "  npm run restart:pm2 - Reiniciar todos os serviços"
echo ""
echo "Ou diretamente:"
echo "  npx pm2 status"
echo "  npx pm2 logs"
echo ""
echo "Para ver o painel:"
echo "  http://localhost:4000"
