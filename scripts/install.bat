@echo off
REM ================================================
REM Painel - Instalacao Completa (Windows)
REM Ordem correta: .env → install → reset → generate → migrate → build → register → pm2
REM ================================================

cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"

echo.
echo =========================================
echo    Painel - Instalacao Completa
echo =========================================
echo.
echo Diretorio: %cd%
echo.

REM =============================================
REM [1/9] PM2: parar daemon e limpar estado
REM =============================================
echo [1/9] Limpando PM2...
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    pm2 kill >nul 2>&1
) else if exist "%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd" (
    call "%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd" kill >nul 2>&1
)
if exist "%USERPROFILE%\.pm2\dump.pm2" (
    del /q "%USERPROFILE%\.pm2\dump.pm2" >nul 2>&1
    echo   Dump PM2 removido
)
if exist "%USERPROFILE%\.pm2\logs" (
    del /q "%USERPROFILE%\.pm2\logs\*.log" >nul 2>&1
    del /q "%USERPROFILE%\.pm2\logs\*.err" >nul 2>&1
    echo   Logs PM2 limpos
)
echo   PM2 limpo OK

REM =============================================
REM [2/9] Verificar dependencias (node, npm)
REM =============================================
echo.
echo [2/9] Verificando dependencias...
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

REM =============================================
REM [3/9] Instalar dependencias
REM =============================================
echo.
echo [3/9] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias.
    goto :fim
)
echo   Dependencias instaladas OK

REM =============================================
REM [4/9] Configurar .env (JWT_SECRET + DATABASE_URL)
REM =============================================
echo.
echo [4/9] Configurando variaveis de ambiente...
if not exist ".env" (
    copy ".env.example" .env >nul 2>&1
)
if exist ".env" (
    echo   Arquivo .env OK
) else (
    echo ERRO: Nao foi possivel criar o .env
    goto :fim
)
REM Gerar JWT_SECRET via node
echo   Gerando JWT_SECRET...
for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "NOVO_SECRET=%%i"
if defined NOVO_SECRET (
    node -e "const fs=require('fs'),c=fs.readFileSync('.env','utf8').split(/\r?\n/);const o=c.map(l=>l.startsWith('JWT_SECRET=')?'JWT_SECRET=%NOVO_SECRET%':l);fs.writeFileSync('.env',o.join('\n'),'utf8');console.log('ok')"
    echo   JWT_SECRET gerado OK
) else (
    echo   AVISO: Nao foi possivel gerar JWT_SECRET
)
echo   Variaveis de ambiente OK

REM =============================================
REM [5/9] Prisma: generate
REM =============================================
echo.
echo [5/9] Gerando Prisma Client...
call npx prisma generate --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client.
    goto :fim
)
echo   Prisma Client gerado OK

REM =============================================
REM [6/9] Resetar banco de dados (drop + recreate)
REM Agora .env ja existe com DATABASE_URL
REM =============================================
echo.
echo [6/9] Resetando banco de dados...
call npx prisma migrate reset --force --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo ERRO: Falha ao resetar banco.
    echo Verifique se o PostgreSQL esta rodando e o banco 'painel' existe.
    echo Crie com: psql -U postgres -c "CREATE DATABASE painel;"
    goto :fim
)
echo   Banco resetado OK

REM =============================================
REM [7/9] Build dos projetos
REM =============================================
echo.
echo [7/9] Compilando projetos...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao compilar projetos. Verifique os erros acima.
    goto :fim
)
echo   Build concluido OK

REM =============================================
REM [8/9] Registrar: usuario + org + ambiente + agente + token
REM =============================================
echo.
echo [8/9] Registrando primeiro usuario...
set "PAINEL_ADMIN_EMAIL=admin@painel.local"
set "PAINEL_ADMIN_SENHA=admin123"
set "PAINEL_ADMIN_NOME=Administrador"
set "PAINEL_ORG_NOME=Minha Organizacao"
call npm run pm2:registrar-painel
if %errorlevel% neq 0 (
    echo   AVISO: Falha ao registrar. Execute depois: npm run pm2:registrar-painel
) else (
    echo   Usuario + ambiente + agente + token registrados OK
)
echo   Email: %PAINEL_ADMIN_EMAIL%
echo   Senha: %PAINEL_ADMIN_SENHA%

REM =============================================
REM [9/9] Iniciar processos via PM2
REM =============================================
echo.
echo [9/9] Iniciando processos via PM2...
set "PM2=%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd"
if not exist "%PM2%" (
    echo ERRO: PM2 nao encontrado em: %PM2%
    goto :fim
)
call "%PM2%" start ecosystem.config.js
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar PM2.
    goto :fim
)
call "%PM2%" save >nul 2>&1
call "%PM2%" status

REM =============================================
REM SUCESSO
REM =============================================
echo.
echo =========================================
echo    Instalacao Concluida com Sucesso!
echo =========================================
echo.
echo Acesse: http://localhost:4000
echo.
echo Credenciais:
echo   Email: %PAINEL_ADMIN_EMAIL%
echo   Senha: %PAINEL_ADMIN_SENHA%
echo.
echo O agente PM2 ja esta rodando com token configurado.
echo.
echo Comandos uteis:
echo   npx pm2 status       Ver status
echo   npx pm2 logs         Ver logs
echo   start-pm2.bat        Reiniciar
echo.

:fim
echo.
echo =========================================
echo    INSTALACAO FINALIZADA
echo =========================================
echo.
echo.
