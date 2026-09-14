@echo off
REM ================================================
REM Painel - Instalacao Completa (Windows)
REM ================================================

REM Se executado pelo PowerShell, reabre em cmd para manter janela aberta
if defined PSModulePath (
    cmd /c "%~f0"
    exit /b
)

cd /d "%~dp0.."

echo.
echo =========================================
echo    Painel - Instalacao Completa
echo =========================================
echo.
echo Diretorio: %cd%
echo.

REM [1/8] Dependencias
echo [1/8] Verificando dependencias...
where.exe node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. Instale em https://nodejs.org
    goto :fim
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo   Node.js %NODE_VER% OK
where.exe npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado.
    goto :fim
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   npm %NPM_VER% OK

REM [2/8] Dependencias
echo.
echo [2/8] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias.
    goto :fim
)
echo   Dependencias instaladas OK

REM [3/8] Variaveis de ambiente
echo.
echo [3/8] Configurando variaveis de ambiente...
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
)
if exist ".env" (
    echo   Arquivo .env OK
) else (
    echo ERRO: Nao foi possivel criar o .env
    goto :fim
)

REM Gerar JWT_SECRET se ainda estiver com placeholder
findstr /C:"JWT_SECRET=TROQUE" ".env" >nul 2>&1
if %errorlevel% equ 0 (
    echo   Gerando JWT_SECRET...
    for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "NOVO_SECRET=%%i"
    if defined NOVO_SECRET (
        powershell -Command "(Get-Content '.env') -replace 'JWT_SECRET=TROQUE-POR-UMA-CHAVE-SECRETA-SEGURA-AQUI', 'JWT_SECRET=%NOVO_SECRET%' | Set-Content '.env'" >nul 2>&1
        echo   JWT_SECRET gerado OK
    )
)
echo   Variaveis de ambiente OK

REM [4/8] Prisma
echo.
echo [4/8] Gerando Prisma Client...
call npx prisma generate --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client.
    goto :fim
)
echo   Prisma Client gerado OK

REM [5/8] Migracoes
echo.
echo [5/8] Aplicando migracoes do banco de dados...
call npx prisma migrate deploy --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo ERRO: Falha ao aplicar migracoes.
    echo Verifique se o PostgreSQL esta rodando e o banco 'painel' existe.
    echo Crie com: psql -U postgres -c "CREATE DATABASE painel;"
    goto :fim
)
echo   Migracoes aplicadas OK

REM [6/8] Build
echo.
echo [6/8] Compilando projetos...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao compilar projetos. Verifique os erros acima.
    goto :fim
)
echo   Build concluido OK

REM [7/8] Registro
echo.
echo [7/8] Registrando primeiro usuario...
set "PAINEL_ADMIN_EMAIL=admin@painel.local"
set "PAINEL_ADMIN_SENHA=admin123"
set "PAINEL_ADMIN_NOME=Administrador"
set "PAINEL_ORG_NOME=Minha Organizacao"
call npm run pm2:registrar-painel
if %errorlevel% neq 0 (
    echo   AVISO: Falha ao registrar. Execute depois: npm run pm2:registrar-painel
) else (
    echo   Usuario registrado OK
)
echo   Email: %PAINEL_ADMIN_EMAIL%
echo   Senha: %PAINEL_ADMIN_SENHA%

REM [8/8] PM2
echo.
echo [8/8] Iniciando processos via PM2...
set "PM2=%cd%\node_modules\.bin\pm2.cmd"
if not exist "%PM2%" (
    echo ERRO: PM2 nao encontrado.
    goto :fim
)
"%PM2%" stop all >nul 2>&1
"%PM2%" delete all >nul 2>&1
"%PM2%" start ecosystem.config.js
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar PM2.
    goto :fim
)
"%PM2%" save
echo   Processos iniciados OK
"%PM2%" status

REM SUCESSO
echo.
echo =========================================
echo    Instalacao Concluida com Sucesso!
echo =========================================
echo.
echo Acesse: http://localhost:4000
echo Email: %PAINEL_ADMIN_EMAIL%
echo Senha: %PAINEL_ADMIN_SENHA%

:fim
echo.
echo =========================================
echo    FIM DA INSTALACAO
echo =========================================
echo.
pause
echo.
