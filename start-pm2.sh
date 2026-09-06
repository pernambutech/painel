#!/bin/bash
# Inicia o Painel via PM2 (Linux/macOS)
# Garante que os processos da API, Web e Agente sejam iniciais automaticamente

set -e

PAINEL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PAINEL_DIR"

echo "🚀 Iniciando o Painel via PM2..."
echo ""

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não encontrado. Instalando..."
    npm install -g pm2
fi

# Build dos projetos (gerar arquivos de produção)
echo "📦 Build dos projetos..."
npm run build 2>&1 | tail -20

# Iniciar processos via PM2 usando ecosystem.config.js
echo ""
echo "⚙️  Iniciando processos PM2..."
pm2 start ecosystem.config.js

# Salvar estado para reinicialização automática
echo ""
echo "💾 Salvando estado do PM2..."
pm2 save

# Configurar inicialização automática no boot
echo ""
echo "🔄 Configurando inicialização automática..."
pm2 startup

echo ""
echo "✅ Painel iniciado com sucesso!"
echo ""
echo "Comandos úteis:"
echo "  pm2 status    - Ver status dos processos"
echo "  pm2 logs      - Ver logs em tempo real"
echo "  pm2 restart all - Reiniciar todos os serviços"
echo ""
echo "Para ver o painel:"
echo "  http://localhost:4000"