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

REM Resolver diretório raiz do projeto (independente de onde o script é chamado)
cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"

echo =========================================
echo    Painel - Instalação Automatizada
echo =========================================
echo.
echo 📁 Diretório do projeto: %RAIZ_DO_PROJETO%
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
    copy ".env.example" ".env" >nul 2>&1
    if exist ".env" (
        echo ✅ Arquivo .env criado a partir do .env.example
    ) else (
        echo ❌ Falha ao criar .env. Copie manualmente: copy .env.example .env
        pause
        exit /b 1
    )
) else (
    echo ✅ Arquivo .env ja existe
)

REM Verificar se JWT_SECRET está vazio ou é o placeholder
findstr /C:"JWT_SECRET=TROQUE" ".env" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  JWT_SECRET está com valor padrão. Gerando valor aleatório...
    for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "NOVO_SECRET=%%i"
    if defined NOVO_SECRET (
        REM Usar PowerShell para substituir o valor no .env
        powershell -Command "(Get-Content '.env') -replace 'JWT_SECRET=TROQUE-POR-UMA-CHAVE-SECRETA-SEGURA-AQUI', 'JWT_SECRET=%NOVO_SECRET%' | Set-Content '.env'" >nul 2>&1
        echo ✅ JWT_SECRET gerado automaticamente
    ) else (
        echo ⚠️  Não foi possível gerar JWT_SECRET. Edite manualmente o .env
    )
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

REM Definir valores padrão
if not defined PAINEL_ADMIN_EMAIL set "PAINEL_ADMIN_EMAIL=admin@painel.local"
if not defined PAINEL_ADMIN_SENHA set "PAINEL_ADMIN_SENHA=admin123"
if not defined PAINEL_ADMIN_NOME set "PAINEL_ADMIN_NOME=Administrador"
if not defined PAINEL_ORG_NOME set "PAINEL_ORG_NOME=Minha Organização"

echo    Email: %PAINEL_ADMIN_EMAIL%
echo    Organização: %PAINEL_ORG_NOME%

REM Registrar o painel com variáveis de ambiente
set "PAINEL_ADMIN_EMAIL=%PAINEL_ADMIN_EMAIL%"
set "PAINEL_ADMIN_SENHA=%PAINEL_ADMIN_SENHA%"
set "PAINEL_ADMIN_NOME=%PAINEL_ADMIN_NOME%"
set "PAINEL_ORG_NOME=%PAINEL_ORG_NOME%"
call npm run pm2:registrar-painel
if %errorlevel% neq 0 (
    echo ⚠️  Falha ao registrar painel. Você pode fazer isso manualmente depois.
) else (
    echo ✅ Registro concluído
)

echo.
echo 🚀 Etapa 6: Iniciando processos...

REM Definir caminho do PM2 local
set "PM2=%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd"

REM Verificar se PM2 local existe
if not exist "%PM2%" (
    echo ❌ PM2 local nao encontrado. Verifique se 'npm install' foi executado.
    pause
    exit /b 1
)

REM Parar processos PM2 antigos antes de iniciar novos
echo    Parando processos PM2 antigos...
"%PM2%" stop all >nul 2>&1
"%PM2%" delete all >nul 2>&1

REM Iniciar via PM2 local
"%PM2%" start ecosystem.config.js
"%PM2%" save
echo ✅ Processos iniciados

echo.
echo =========================================
echo    Instalação Concluída!
echo =========================================
echo.
echo Próximos passos:
echo   1. Acesse: http://localhost:4000
echo   2. Faça login com as credenciais criadas
echo   3. Crie seu primeiro ambiente e agente
echo.
echo Comandos úteis (produção):
echo   npx pm2 status    - Ver status dos processos
echo   npx pm2 logs      - Ver logs em tempo real
echo   start-pm2.bat     - Reiniciar todos os processos
echo.
echo IMPORTANTE: O install.bat inicia os processos em modo producao (PM2).
echo   Para modo desenvolvimento, NÃO use install.bat.
echo   Em vez disso, use em terminais separados:
echo     npm run dev       - API (porta 4001)
echo     npm run dev:web   - Frontend (porta 4000)
echo.
echo Para mais informações, consulte o README.md
echo.
pause