@echo off
REM Painel - Script de Instalação Automatizada (Windows)
REM Suporta: Windows
REM
REM Este script executa todas as etapas necessárias para uma instalação do zero:
REM 1. Verificação de dependências
REM 2. Instalação de pacotes
REM 3. Configuração de ambiente
REM 4. Migrações de banco
REM 5. Registro do primeiro usuário
REM 6. Início dos processos

echo =========================================
echo    Painel - Instalação Automatizada
echo =========================================
echo.

REM Função para verificar se comando existe
where.exe node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js >= 18.0.0
    echo    https://nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo ✅ Node.js %NODE_VER% encontrado
)

where.exe npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo ✅ npm %NPM_VER% encontrado
)

echo.
echo 🔍 Dependências verificadas com sucesso!
echo.

echo 📦 Etapa 1: Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo.
echo 🌍 Etapa 2: Configurando ambiente...

REM Copiar .env.example se .env não existir
if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ Arquivo .env criado a partir do .env.example
    echo    ⚠️  Lembre-se de editar o arquivo .env com suas configurações
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🗄️  Etapa 3: Configurando banco de dados...

REM Gerar cliente Prisma
npm run prisma:generate -w apps/api-central
if %errorlevel% neq 0 (
    echo ❌ Falha ao gerar Prisma Client
    pause
    exit /b 1
)

REM Aplicar migrações
echo    Aplicando migrações...
npm run prisma:migrate -w apps/api-central
if %errorlevel% neq 0 (
    echo ❌ Falha ao aplicar migrações
    pause
    exit /b 1
)
echo ✅ Banco de dados configurado

echo.
echo 🏗️  Etapa 4: Build dos projetos...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Falha no build
    pause
    exit /b 1
)
echo ✅ Build concluído

echo.
echo 👤 Etapa 5: Registrando primeiro usuário...

REM Registrar o painel (usando valores padrão para não travar)
REM O usuário pode personalizar via variáveis de ambiente se necessário
call npm run pm2:registrar-painel
if %errorlevel% neq 0 (
    echo ⚠️  Falha ao registrar painel. Você pode fazer isso manualmente depois.
)
echo ✅ Registro concluído

echo.
echo 🚀 Etapa 6: Iniciando processos...

REM Iniciar via PM2
pm2 start ecosystem.config.js
pm2 save
echo ✅ Processos iniciados

echo.
echo =========================================
echo    Instalação Concluída! 🎉
echo =========================================
echo.
echo Próximos passos:
echo   1. Acesse: http://localhost:4000
echo   2. Faça login com as credenciais criadas
echo   3. Crie seu primeiro ambiente e agente
echo.
echo Comandos úteis:
echo   pm2 status    - Ver status dos processos
echo   pm2 logs      - Ver logs em tempo real
echo   npm run dev   - Reiniciar em modo desenvolvimento
echo.
echo Para mais informações, consulte o README.md
echo.
pause