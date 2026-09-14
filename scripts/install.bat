@echo off
REM ================================================
REM Painel - Instalacao Completa (Windows)
REM ================================================
REM
REM Executa TUDO necessario para instalar o Painel.
REM Apos executar, o Painel estara pronto em http://localhost:4000

@echo on
REM Resolver diretorio raiz do projeto
cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"
set "ERRO=0"

echo.
echo =========================================
echo    Painel - Instalacao Completa
echo =========================================
echo.
echo Diretorio: %RAIZ_DO_PROJETO%
echo.

REM =============================================
REM VERIFICACAO DE DEPENDENCIAS
REM =============================================

echo [1/8] Verificando dependencias...

where.exe node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado.
    echo Instale o Node.js ^>= 18.0.0 em: https://nodejs.org
    set "ERRO=1"
    goto :fim
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo   Node.js %NODE_VER% OK

where.exe npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado.
    set "ERRO=1"
    goto :fim
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   npm %NPM_VER% OK

REM =============================================
REM INSTALACAO DE PACOTES
REM =============================================

echo.
echo [2/8] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias.
    set "ERRO=1"
    goto :fim
)
echo   Dependencias instaladas OK

REM =============================================
REM CRIACAO DO .ENV
REM =============================================

echo.
echo [3/8] Configurando variaveis de ambiente...

REM Criar .env se nao existir
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    if exist ".env" (
        echo   Arquivo .env criado a partir do .env.example
    ) else (
        echo ERRO: Nao foi possivel criar o arquivo .env
        set "ERRO=1"
        goto :fim
    )
) else (
    echo   Arquivo .env ja existe
)

REM Verificar se JWT_SECRET esta com valor placeholder
findstr /C:"JWT_SECRET=TROQUE" ".env" >nul 2>&1
if %errorlevel% equ 0 (
    echo   Gerando JWT_SECRET aleatorio...
    for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "NOVO_SECRET=%%i"
    if defined NOVO_SECRET (
        powershell -Command "(Get-Content '.env') -replace 'JWT_SECRET=TROQUE-POR-UMA-CHAVE-SECRETA-SEGURA-AQUI', 'JWT_SECRET=%NOVO_SECRET%' | Set-Content '.env'" >nul 2>&1
        echo   JWT_SECRET gerado com sucesso
    ) else (
        echo   AVISO: Nao foi possivel gerar JWT_SECRET automaticamente
    )
)

REM Verificar se DATABASE_URL esta configurado
findstr /C:"DATABASE_URL=" ".env" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: DATABASE_URL nao encontrado no .env
    set "ERRO=1"
    goto :fim
)
echo   Variaveis de ambiente OK

REM =============================================
REM PRISMA
REM =============================================

echo.
echo [4/8] Gerando Prisma Client...
call npx prisma generate --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client
    set "ERRO=1"
    goto :fim
)
echo   Prisma Client gerado OK

REM =============================================
REM MIGRACOES
REM =============================================

echo.
echo [5/8] Aplicando migracoes do banco de dados...
call npx prisma migrate deploy --schema=apps/api-central/prisma/schema.prisma
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao aplicar migracoes.
    echo Possiveis causas:
    echo   - PostgreSQL nao esta rodando
    echo   - Banco de dados 'painel' nao existe
    echo   - DATABASE_URL incorreto no .env
    echo.
    echo Crie o banco manualmente:
    echo   psql -U postgres -c "CREATE DATABASE painel;"
    echo.
    set "ERRO=1"
    goto :fim
)
echo   Migracoes aplicadas OK

REM =============================================
REM BUILD
REM =============================================

echo.
echo [6/8] Compilando projetos...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao compilar projetos.
    echo Verifique os erros acima.
    echo.
    set "ERRO=1"
    goto :fim
)
echo   Build concluido OK

REM =============================================
REM REGISTRO DO PRIMEIRO USUARIO
REM =============================================

echo.
echo [7/8] Registrando primeiro usuario...

if not defined PAINEL_ADMIN_EMAIL set "PAINEL_ADMIN_EMAIL=admin@painel.local"
if not defined PAINEL_ADMIN_SENHA set "PAINEL_ADMIN_SENHA=admin123"
if not defined PAINEL_ADMIN_NOME set "PAINEL_ADMIN_NOME=Administrador"
if not defined PAINEL_ORG_NOME set "PAINEL_ORG_NOME=Minha Organizacao"

set "PAINEL_ADMIN_EMAIL=%PAINEL_ADMIN_EMAIL%"
set "PAINEL_ADMIN_SENHA=%PAINEL_ADMIN_SENHA%"
set "PAINEL_ADMIN_NOME=%PAINEL_ADMIN_NOME%"
set "PAINEL_ORG_NOME=%PAINEL_ORG_NOME%"
call npm run pm2:registrar-painel
if %errorlevel% neq 0 (
    echo   AVISO: Falha ao registrar usuario.
    echo   Voce pode fazer manualmente depois com: npm run pm2:registrar-painel
) else (
    echo   Usuario registrado OK
)
echo   Email: %PAINEL_ADMIN_EMAIL%
echo   Senha: %PAINEL_ADMIN_SENHA%

REM =============================================
REM INICIO VIA PM2
REM =============================================

echo.
echo [8/8] Iniciando processos via PM2...

set "PM2=%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd"

if not exist "%PM2%" (
    echo ERRO: PM2 local nao encontrado em: %PM2%
    set "ERRO=1"
    goto :fim
)

REM Parar processos antigos
"%PM2%" stop all >nul 2>&1
"%PM2%" delete all >nul 2>&1

REM Iniciar todos os processos
"%PM2%" start ecosystem.config.js
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar processos PM2
    set "ERRO=1"
    goto :fim
)
"%PM2%" save
echo   Processos iniciados OK

REM =============================================
REM CONCLUIDO
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
echo Comandos uteis:
echo   npx pm2 status         Ver status dos processos
echo   npx pm2 logs           Ver logs em tempo real
echo   start-pm2.bat          Reiniciar processos
echo.
goto :fim

REM =============================================
REM ERRO - NUNCA FECHA SEM MOSTRAR O QUE ACONTECEU
REM =============================================

:fim
echo.
if "%ERRO%"=="1" (
    echo =========================================
    echo    Instalacao com ERROS
    echo =========================================
    echo.
    echo Corrija os erros acima e execute novamente:
    echo   scripts\install.bat
    echo.
)
echo Pressione qualquer tecla para fechar...
pause >nul
