@echo off
REM ================================================
REM Painel - Iniciar processos via PM2 (Windows)
REM ================================================
REM
REM Comportamento:
REM   start-pm2.bat              - Inicia do zero (ecosystem.config.js) e salva
REM   start-pm2.bat --resurrect  - Restaura processos do dump.pm2
REM   start-pm2.bat --status     - Apenas mostra status
REM
REM O PM2 utilizado e o local do projeto (node_modules/.bin/pm2.cmd).

REM Resolver diretorio raiz do projeto (independente de onde o script e chamado)
cd /d "%~dp0.."
set "RAIZ_DO_PROJETO=%cd%"

REM Definir caminho do PM2 local
set "PM2=%RAIZ_DO_PROJETO%\node_modules\.bin\pm2.cmd"

echo =========================================
echo    Painel - Iniciando via PM2
echo =========================================
echo.
echo Diretorio: %RAIZ_DO_PROJETO%

REM Verificar se node esta disponivel
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado no PATH.
    pause
    exit /b 1
)

REM Verificar se PM2 local existe
if not exist "%PM2%" (
    echo ERRO: PM2 local nao encontrado em: %PM2%
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
    echo ERRO: ecosystem.config.js nao encontrado em: %RAIZ_DO_PROJETO%
    pause
    exit /b 1
)

REM Verificar argumento: --status
if "%1"=="--status" (
    echo.
    echo Status dos processos PM2:
    call "%PM2%" status
    goto :fim
)

REM Verificar argumento: --resurrect
if "%1"=="--resurrect" (
    echo.
    echo Restaurando processos do dump.pm2...
    if not exist "%USERPROFILE%\.pm2\dump.pm2" (
        echo AVISO: Nenhum dump.pm2 encontrado. Iniciando do zero...
        "%PM2%" start ecosystem.config.js
    ) else (
        call "%PM2%" resurrect
        if %errorlevel% neq 0 (
            echo AVISO: Falha ao restaurar. Iniciando do zero...
            "%PM2%" start ecosystem.config.js
        )
    )
    call "%PM2%" save >nul 2>&1
    call "%PM2%" status
    goto :fim
)

REM =============================================
REM Fluxo padrao: iniciar do zero via ecosystem
REM =============================================
echo.
echo Parando processos antigos...
call "%PM2%" stop all >nul 2>&1
call "%PM2%" delete all >nul 2>&1

echo Iniciando processos...
"%PM2%" start ecosystem.config.js
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar processos via PM2.
    pause
    exit /b 1
)

REM Sempre salvar apos iniciar (consistente com start-pm2.sh)
echo Salvando estado...
call "%PM2%" save >nul 2>&1

echo.
echo Status dos processos:
call "%PM2%" status

echo.
echo =========================================
echo    Processos iniciados com sucesso!
echo =========================================
echo.
echo Comandos uteis:
echo   start-pm2.bat --status     Ver status
echo   start-pm2.bat --resurrect  Restaurar dump anterior
echo   npx pm2 logs               Ver logs em tempo real
echo   npx pm2 stop all           Parar todos
echo   npx pm2 restart all        Reiniciar todos
echo.
echo Para ver o painel:
echo   http://localhost:4000
echo.

:fim
