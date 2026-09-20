# Relatório de Correção — PM2 e Autostart Windows V1

## 1. Problemas Encontrados e Status

| # | Problema | Severidade | Status | Descrição da Correção |
|---|----------|------------|--------|----------------------|
| P1 | install.bat não configura auto-start no Windows | CRÍTICO | **CORRIGIDO** | Adicionado step [10/10] que cria `pm2-startup.bat` + tarefa agendada `PainelPM2` |
| P2 | start-pm2.bat não executa `pm2 save` por padrão | ALTO | **CORRIGIDO** | Script sempre executa `pm2 save` após iniciar; adicionado `--resurrect` |
| P3 | `configurarStartup()` usa `pm2 startup` (não funciona no Windows) | ALTO | **CORRIGIDO** | Substituído por criação de `.bat` + `schtasks` com `pm2 resurrect` |
| P5 | Botão "Salvar PM2" sugere comportamento falso | MÉDIO | **CORRIGIDO** | Textos atualizados para esclarecer que salva lista completa do agente |
| P6 | README diz que PM2 é global (`npm install -g pm2`) | BAIXO | **CORRIGIDO** | Corrigido para "PM2 local, instalado automaticamente via npm install" |
| P7 | Documentação afirma que `pm2 save` garante auto-start | BAIXO | **CORRIGIDO** | Adicionada tabela explicativa sobre diferença entre save, auto-start e resurrect |
| P8 | `removerStartup()` não funciona corretamente no Windows | MÉDIO | **CORRIGIDO** | Remove tarefa `PainelPM2` + remove `.bat`; NÃO remove dump.pm2 |
| P9 | Inconsistência entre install.bat e install.sh | BAIXO | **CORRIGIDO** | Ambos agora possuem step [10/10] para auto-start |

## 2. Arquivos Alterados

| Arquivo | Motivo |
|---------|--------|
| `apps/agente/src/processos/adaptador-pm2.ts` | Correção crítica: `configurarStartup()`, `verificarStartup()`, `removerStartup()` para Windows; adicionados helpers `obterRaizProjeto()` e `resolverCaminhoPm2Local()` |
| `start-pm2.bat` | Reescrito: sempre salva após iniciar; adicionado `--resurrect` e `--status` |
| `scripts/install.bat` | Adicionado step [10/10] para configurar auto-start via tarefa agendada |
| `scripts/install.sh` | Adicionado step [10/10] para configurar auto-start via `pm2 startup` |
| `apps/painel-web/src/app/(painel)/projetos/[id]/page.tsx` | Texto do botão "Salvar PM2" atualizado |
| `apps/painel-web/src/app/(painel)/ambientes/[id]/page.tsx` | Aviso sobre "Salvar PM2" atualizado |
| `README.md` | Corrigido PM2 global→local; documentado auto-start; adicionada tabela de conceitos |

## 3. Comportamento Final

### Instalação (Windows)

```
install.bat
    ↓
[1/10] PM2 kill + limpar dump/logs
[2/10] Verificar node/npm
[3/10] npm install
[4/10] .env + JWT_SECRET
[5/10] prisma generate
[6/10] prisma migrate reset
[7/10] npm run build
[8/10] Registrar usuário + org + ambiente + agente + token
[9/10] pm2 start ecosystem.config.js + pm2 save
[10/10] Criar pm2-startup.bat + tarefa agendada PainelPM2
```

### Startup (Windows)

```
Windows inicia
    ↓
Usuário faz logon
    ↓
Tarefa agendada PainelPM2 executa pm2-startup.bat
    ↓
pm2-startup.bat:
  cd /d <raiz-do-projeto>
  pm2 resurrect
    ↓
PM2 lê dump.pm2 e restaura todos os processos:
  painel-api → online
  painel-web → online
  painel-agente → online
  serviços de terceiros → online (se salvos)
```

### Save

```
Usuário clica "Salvar PM2"
    ↓
PM2_SAVE → agente → adaptadorPm2.salvar()
    ↓
pm2.save() grava ~/.pm2/dump.pm2
    ↓
Lista COMPLETA de processos do daemon é persistida
(não apenas o serviço clicado)
```

### Reboot

```
Windows reinicia
    ↓
Logon do usuário
    ↓
Tarefa PainelPM2 → pm2-startup.bat → pm2 resurrect
    ↓
Todos os processos restaurados
```

### Remoção do Auto-start

```
Usuário clica "Remover Auto-start"
    ↓
PM2_UNSTARTUP → agente → adaptadorPm2.removerStartup()
    ↓
Windows:
  - schtasks /delete /tn "PainelPM2" /f
  - Remove pm2-startup.bat
  - NÃO remove dump.pm2
Linux/macOS:
  - pm2 unstartup -f
    ↓
verificarStartup() → "Não configurado"
```

### Reconfiguração

```
Usuário clica "Configurar Auto-start" novamente
    ↓
configurarStartup():
  - Cria pm2-startup.bat (sobrescreve)
  - schtasks /create /tn "PainelPM2" ... /f (sobrescreve)
  - pm2 save
    ↓
Tarefa funciona novamente
```

## 4. Testes Realizados

| Teste | Ambiente | Comando | Resultado |
|-------|----------|---------|-----------|
| Compilação do agente | Windows | `npx tsc --project apps/agente/tsconfig.json` | ✅ OK |
| Build do agente | Windows | `npm run build -w apps/agente` | ✅ OK |
| PM2 local existe | Windows | `Test-Path node_modules\.bin\pm2.cmd` | ✅ True |
| PM2 não está no PATH | Windows | `where pm2` | ✅ Não encontrado (correto) |
| dump.pm2 existe | Windows | `node -e "..."` | ✅ 9 processos salvos |
| schtasks /query (tarefa não existe) | Windows | `schtasks /query /tn "PainelPM2"` | ✅ "Arquivo não encontrado" (correto) |
| schtasks /create (sem admin) | Windows | `schtasks /create ...` | ⚠️ "Acesso negado" (esperado — requer admin) |
| schtasks /delete (tarefa não existe) | Windows | `schtasks /delete /tn "PainelPM2" /f` | ✅ "Arquivo não encontrado" (tratado pelo catch) |
| Criação do .bat de startup | Windows | PowerShell `Set-Content` | ✅ Arquivo criado corretamente |
| pm2 startup (Windows) | Windows | `pm2 startup` | ❌ "Init system not found" (confirmado — por isso usamos schtasks) |

## 5. Testes que NÃO Puderam Ser Executados

| Teste | Motivo | Como validar manualmente |
|-------|--------|------------------------|
| **Reboot real do Windows** | Ambiente de desenvolvimento sem privilégios de admin | 1. Executar `install.bat` como admin 2. Reiniciar Windows 3. Verificar `pm2 status` |
| **schtasks /create (sucesso)** | Requer privilégios de administrador | Executar em prompt elevado: `schtasks /create /tn "PainelPM2" /tr "\"<caminho>\pm2-startup.bat\"" /sc onlogon /rl highest /f` |
| **Teste de idempotência** | Requer admin para criar tarefa | Executar `schtasks /create` 3 vezes e verificar que só existe 1 tarefa |
| **Teste de remoção + reboot** | Requer admin + reboot | Remover tarefa, reiniciar, confirmar que PM2 não inicia |
| **Teste de reconfiguração** | Requer admin + reboot | Remover, reconfigurar, reiniciar, confirmar que funciona |

### Como validar manualmente (Windows)

```cmd
REM 1. Abrir PowerShell como Administrador
REM 2. Navegar até o projeto
cd C:\Users\perna\Documents\GitHub\painel

REM 3. Executar install.bat
scripts\install.bat

REM 4. Verificar que a tarefa foi criada
schtasks /query /tn "PainelPM2"

REM 5. Verificar que o .bat foi criado
type pm2-startup.bat

REM 6. Verificar processos PM2
node_modules\.bin\pm2.cmd status

REM 7. Reiniciar o Windows

REM 8. Após reiniciar, verificar:
node_modules\.bin\pm2.cmd status
REM Esperado: painel-api, painel-web, painel-agente = online

REM 9. Remover auto-start (pela web ou via agente)
REM 10. Verificar remoção
schtasks /query /tn "PainelPM2"
REM Esperado: "Arquivo não encontrado"

REM 11. Reiniciar novamente
REM 12. Verificar que PM2 NÃO iniciou automaticamente
node_modules\.bin\pm2.cmd status
REM Esperado: PM2 daemon não está rodando
```

## 6. Descobertas Importantes

### `pm2 startup` não funciona no Windows

O comando `pm2 startup` no Windows lança:
```
[PM2][ERROR] Init system not found
```

O PM2 não possui sistema de init nativo no Windows. A solução adotada é:
- Criar um script `.bat` que executa `pm2 resurrect`
- Criar uma tarefa agendada do Windows que executa esse `.bat` no logon

### `schtasks /create` requer privilégios de administrador

A criação de tarefas agendadas no Windows requer elevação. O `install.bat` deve ser executado como administrador para configurar o auto-start. Se não for executado como admin, o step [10/10] emite um aviso com o comando manual.

### `schtasks /query` e `/delete` NÃO requerem admin

A verificação e remoção de tarefas existentes funciona sem elevação.

### `removerStartup()` não deve limpar dump.pm2

O dump.pm2 contém a lista de processos. Mesmo após remover o auto-start, o usuário pode querer restaurar manualmente com `pm2 resurrect`. A limpeza do dump foi removida do método `removerStartup()`.

## 7. Commits Realizados

| Hash | Mensagem |
|------|----------|
| `3d5425a` | corrige autostart do PM2 no Windows |
| `7395e8e` | corrige script start-pm2.bat do Windows |
| `a646a71` | corrige install.bat e install.sh para configurar auto-start |
| `14cef84` | corrige textos do botao Salvar PM2 na interface |
| `3dff2dc` | atualiza documentacao do PM2 e autostart |

## 8. Conclusão

A correção do PM2/autostart para V1 está **código-complete**. O mecanismo implementado é:

1. **Script `.bat`** (`pm2-startup.bat`) que executa `pm2 resurrect` no diretório do projeto
2. **Tarefa agendada** (`PainelPM2`) que executa esse `.bat` no logon do Windows
3. **Idempotente**: usar `/f` no `schtasks /create` sobrescreve tarefa existente
4. **Reversível**: remover a tarefa + `.bat` desativa o auto-start
5. **Não destrutivo**: dump.pm2 é preservado mesmo após remoção do auto-start

**Pendência**: A validação completa requer reboot real do Windows com privilégios de administrador, que não pôde ser executada neste ambiente. O código está preparado e os passos de validação manual estão documentados na seção 5.
