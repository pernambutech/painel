@echo off
REM ================================================
REM Painel - Iniciar processos via PM2 (Windows)
REM ================================================
REM
REM Este script inicia todos os processos do Painel via PM2.
REM Funciona a partir de qualquer diretorio.
REM
REM Uso:
REM   start-pm2.bat              (inicia processos)
REM   start-pm2.bat --save       (inicia e salva estado)
REM   start-pm2.bat --resurrect  (restaura estado salvo)

REM Resolver diretorio raiz do projeto (independente de onde o script e chamado)
cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"

echo =========================================
echo    Painel - Iniciando via PM2
echo =========================================
echo.
echo 📁 Diretorio: %RAIZ_DO_PROJETO%

REM Verificar se PM2 esta disponivel
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 nao encontrado no PATH.
    echo    Instale com: npm install -g pm2
    pause
    exit /b 1
)

REM Verificar se node esta disponivel
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado no PATH.
    pause
    exit /b 1
)

REM Verificar se ecosystem.config.js existe
if not exist "%RAIZ_DO_PROJETO%\ecosystem.config.js" (
    echo ❌ ecosystem.config.js nao encontrado em: %RAIZ_DO_PROJETO%
    pause
    exit /b 1
)

REM Verificar se os builds existem
if not exist "%RAIZ_DO_PROJETO%\apps\api-central\dist\main.js" (
    echo ⚓ Build da API nao encontrado. Execute 'npm run build' primeiro.
    pause
    exit /b 1
)

if not exist "%RAIZ_DO_PROJETO%\apps\agente\dist\index.js" (
    echo ⚓ Build do agente nao encontrado. Execute 'npm run build' primeiro.
    pause
    exit /b 1
)

REM Verificar argumento
if "%1"=="--resurrect" (
    echo.
    echo 🔄 Restaurando estado salvo do PM2...
    pm2 resurrect
    if %errorlevel% neq 0 (
        echo ⚠️  Nenhum estado salvo encontrado. Iniciando do zero...
        pm2 start ecosystem.config.js
    )
) else (
    echo.
    echo ⚙️  Iniciando processos...
    pm2 start ecosystem.config.js
)

REM Salvar estado se solicitado
if "%1"=="--save" (
    echo.
    echo 💾 Salvando estado do PM2...
    pm2 save
)

echo.
echo ✅ Processos iniciados!
echo.
echo Comandos uteis:
echo   pm2 status            - Ver status dos processos
echo   pm2 logs              - Ver logs em tempo real
echo   pm2 restart all       - Reiniciar todos
echo   pm2 stop all          - Parar todos
echo   pm2 save              - Salvar estado
echo   pm2 resurrect         - Restaurar estado salvo
echo.
echo Para ver o painel:
echo   http://localhost:4000
echo.
pause
