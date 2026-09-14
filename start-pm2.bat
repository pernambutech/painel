@echo off
REM ================================================
REM Painel - Iniciar processos via PM2 (Windows)
REM ================================================
REM
REM Este script inicia todos os processos do Painel via PM2.
REM Utiliza o PM2 local do projeto (node_modules/.bin/pm2.cmd).
REM Funciona a partir de qualquer diretorio.
REM
REM Uso:
REM   start-pm2.bat              (inicia processos)
REM   start-pm2.bat --save       (inicia e salva estado)
REM   start-pm2.bat --resurrect  (restaura estado salvo)

REM Resolver diretorio raiz do projeto (independente de onde o script e chamado)
cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"

REM Definir caminho do PM2 local
set "PM2=%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd"

echo =========================================
echo    Painel - Iniciando via PM2
echo =========================================
echo.
echo 📁 Diretorio: %RAIZ_DO_PROJETO%

REM Verificar se node esta disponivel
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado no PATH.
    pause
    exit /b 1
)

REM Verificar se PM2 local existe
if not exist "%PM2%" (
    echo ❌ PM2 local nao encontrado em: %PM2%
    echo.
    echo    Execute primeiro:
    echo      npm install
    echo.
    echo    Ou execute o instalador:
    echo      scripts\install.bat
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

REM Parar processos antigos antes de iniciar novos
echo.
echo 🛑 Parando processos PM2 antigos...
"%PM2%" stop all >nul 2>&1
"%PM2%" delete all >nul 2>&1

REM Verificar argumento
if "%1"=="--resurrect" (
    echo.
    echo 🔄 Restaurando estado salvo do PM2...
    "%PM2%" resurrect
    if %errorlevel% neq 0 (
        echo ⚠️  Nenhum estado salvo encontrado. Iniciando do zero...
        "%PM2%" start ecosystem.config.js
    )
) else (
    echo.
    echo ⚙️  Iniciando processos...
    "%PM2%" start ecosystem.config.js
)

REM Salvar estado se solicitado
if "%1"=="--save" (
    echo.
    echo 💾 Salvando estado do PM2...
    "%PM2%" save
)

echo.
echo ✅ Processos iniciados!
echo.
echo Comandos uteis (via npm):
echo   npm run status:pm2     - Ver status dos processos
echo   npm run logs:pm2       - Ver logs em tempo real
echo   npm run restart:pm2    - Reiniciar todos
echo   npm run stop:pm2       - Parar todos
echo   npm run save:pm2       - Salvar estado
echo.
echo Ou diretamente:
echo   npx pm2 status
echo   npx pm2 logs
echo.
echo Para ver o painel:
echo   http://localhost:4000
echo.
pause
