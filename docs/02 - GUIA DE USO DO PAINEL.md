# GUIA DE USO — PAINEL CENTRAL

Guia completo de como usar a plataforma de gerenciamento centralizado de projetos e serviços.

---

## 1. BEM-VINDO

### O que é o Painel?

O Painel é uma plataforma web que permite gerenciar, executar, monitorar e atualizar projetos e serviços em múltiplas máquinas a partir de um único lugar.

Em vez de abrir dezenas de terminais para controlar seus projetos, você gerencia tudo por aqui.

### Arquitetura resumida

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PAINEL     │────▶│  API CENTRAL │────▶│    AGENTE    │
│   (Browser)  │     │  (Porta 4001)│     │  (Máquina)   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │  PM2 / Git   │
                                           │  (Processos) │
                                           └──────────────┘
```

- **Painel**: Interface web que você acessa no navegador
- **API Central**: Backend que processa requisições e gerencia dados
- **Agente**: Software instalado nas máquinas que executa comandos
- **PM2**: Gerenciador de processos Node.js (mantém suas aplicações rodando)
- **Git**: Controle de versão do código

### Para quem serve

- Desenvolvedores individuais
- Freelancers
- Pequenas software houses
- Pequenas equipes de desenvolvimento

---

## 2. PRIMEIROS PASSOS

### Criar conta

1. Acesse a página de cadastro
2. Preencha nome, email e senha (mínimo 6 caracteres)
3. Confirme a senha
4. Clique em "Criar conta"
5. Você será redirecionado para o Dashboard

### Fazer login

1. Acesse a página de login
2. Informe seu email e senha
3. Clique em "Entrar"
4. Você verá o Dashboard com a visão geral

### Entendendo a interface

```
┌─────────────────────────────────────────────────────────┐
│  ☰  [Organização ▼]    2 online  1 offline   🔔  ?  WI │  ← Topbar
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Visão G. │         CONTEÚDO PRINCIPAL                   │
│ Projetos │                                              │
│ Serviços │         (muda conforme a página)             │
│ Ambientes│                                              │
│ Logs     │                                              │
│ Histórico│                                              │
│ ─────── │                                              │
│ Config.  │                                              │
│          │                                              │
│ [WI] Sair│                                              │
└──────────┴──────────────────────────────────────────────┘
   Sidebar        Área de conteúdo
```

**Topbar** (barra superior):
- Seletor de organização (se você pertence a mais de uma)
- Indicadores de ambientes online/offline
- Sininho de notificações (agentes desconectados)
- Botão de ajuda
- Seu perfil (nome, email, configurações, sair)

**Sidebar** (menu lateral):
- Links de navegação principal
- Indicador da página atual (fundo azulado)
- Seu avatar e botão de logout

---

## 3. CONCEITOS IMPORTANTES

Antes de usar, entenda as principais entidades:

### Organização
Uma empresa, software house ou equipe. Tudo o que você cria pertence a uma organização. Você pode trocar de organização pela topbar.

### Ambiente
Uma **máquina ou servidor** onde seus projetos rodam. Pode ser:
- Seu notebook de desenvolvimento
- Um servidor VPS de produção
- Uma máquina de homologação

Cada ambiente pode ter um **agente** conectado.

### Agente
Um software instalado no ambiente que permite ao painel executar comandos remotamente. O agente se comunica com a API central via WebSocket.

### Projeto
Um agrupamento lógico de serviços. Exemplo: "Sistema de Chamados" pode ter frontend + backend + worker.

### Serviço
Uma aplicação ou processo executável. Exemplo: um frontend React, um backend Node.js, um worker de filas.

### PM2
Gerenciador de processos que mantém suas aplicações rodando, reinicia automaticamente em caso de erro e gerencia múltiplos processos.

### Relação entre entidades

```
Organização
    │
    ├── Ambiente (Notebook Dev)
    │       └── Agente (conectado)
    │
    ├── Ambiente (VPS Produção)
    │       └── Agente (conectado)
    │
    ├── Projeto "App Delivery"
    │       ├── Serviço: Frontend (React)
    │       ├── Serviço: Backend (Node.js)
    │       └── Serviço: Worker (filas)
    │
    └── Projeto "Site Institucional"
            └── Serviço: Frontend (Next.js)
```

---

## 4. DASHBOARD (VISÃO GERAL)

**URL:** `/dashboard`

O dashboard é a primeira tela que você vê. Ele mostra um resumo completo da plataforma.

### Cards de estatísticas

| Card | O que mostra | Clicando... |
|------|-------------|-------------|
| **Projetos ativos** | Total de projetos cadastrados | Vai para `/projetos` |
| **Serviços online** | Processos ativos no PM2 | Vai para `/servicos?status=online` |
| **Serviços parados** | Processos parados | Vai para `/servicos?status=stopped` |
| **Com erro** | Processos com erro | Vai para `/servicos?status=erro` |
| **Ambientes online** | Máquinas conectadas | Vai para `/ambientes` |

### Seção "Serviços que precisam de atenção"

Lista ambientes com agente desconectado. Se tudo estiver ok, mostra mensagem verde.

### Atividade recente

Últimas 10 ações executadas na plataforma (iniciar, parar, reiniciar serviços). Mostra quem executou, quando e o resultado.

### Resumo dos ambientes

Lista os primeiros 5 ambientes com status (online/offline) e último heartbeat.

### Tabela de projetos

Lista projetos com contagem de serviços online e parados.

### Atualização automática

O dashboard atualiza sozinho a cada 15 segundos (se a preferência estiver ativada). Também recebe atualizações em tempo real via WebSocket.

---

## 5. AMBIENTES

**URL:** `/ambientes`

### Criar um ambiente

1. Clique em "Novo Ambiente"
2. Preencha:
   - **Nome**: identifique a máquina (ex: "Notebook Desenvolvimento", "VPS Produção")
   - **Tipo**: Local, Desenvolvimento, Homologação ou Produção
   - **Sistema Operacional**: Linux, Windows ou macOS
3. Clique em "Criar Ambiente"

### Conectar o agente

Após criar o ambiente, você precisa conectar um agente:

1. Na página do ambiente, clique em "Gerar Token de Instalação"
2. **Copie o token** (ele só aparece uma vez!)
3. Na máquina alvo, execute o comando fornecido:
   - **Windows**: cole o comando PowerShell
   - **Linux/macOS**: cole o comando bash
4. O agente deve aparecer como "Conectado" no painel

### Detalhes do ambiente

A página mostra:
- **Status do agente**: Conectado/Desconectado
- **Último heartbeat**: quando o agente comunicou pela última vez
- **CPU e Memória**: uso atual (quando online)
- **ID do agente**: identificador único
- **Versão**: versão do agente instalado

### Editar ambiente

1. Clique no ícone de editar (✏️) ao lado do nome
2. Altere o nome e/ou tipo
3. Confirme com ✓ ou cancele com ✕

### Excluir ambiente

1. Clique no ícone de lixeira (🗑️)
2. Confirme a exclusão no modal
3. **Atenção**: esta ação não pode ser desfeita

### Diretórios autorizados (Segurança)

Na seção "Segurança" da página do ambiente, você pode restringir quais diretórios o agente pode acessar:

1. Adicione os paths permitidos (ex: `C:\Projetos` ou `/home/user/projetos`)
2. Clique em "Salvar diretórios"
3. O agente rejeitará comandos de diretórios fora dessa lista

Se a lista estiver vazia, todos os diretórios são permitidos (modo legado).

### Salvar PM2

O botão "Salvar PM2" persiste a lista atual de processos do PM2. Isso faz com que os processos sejam automaticamente reiniciados quando a máquina reiniciar.

---

## 6. PROJETOS

**URL:** `/projetos`

### Criar um projeto

1. Clique em "Novo Projeto"
2. Preencha:
   - **Nome**: identifique o projeto (ex: "Sistema de Chamados")
   - **Descricão** (opcional): descreva brevemente o projeto
3. Clique em "Criar projeto"

### Lista de projetos

- Cards com nome, descrição, data de criação e contagem de serviços
- Filtro "Mostrar arquivados" para ver projetos arquivados
- Clique em um card para ver os detalhes

### Detalhes do projeto

A página mostra:

**Cabeçalho:**
- Nome do projeto (editavel inline)
- Status: Ativo ou Arquivado
- Botões: Editar, Arquivar/Reativar

**Descrição:**
- Texto descritivo do projeto
- Editavel inline

**Serviços do projeto:**
- Lista de todos os serviços cadastrados
- Cada serviço mostra: nome, tipo, status, porta
- Botões de controle: Iniciar, Parar, Reiniciar
- Botões de ação: Logs, Git, Commits, PM2, Editar, Excluir

### Arquivar um projeto

1. Clique em "Arquivar"
2. Confirme no modal
3. O projeto fica oculto da lista principal
4. Você pode reativá-lo a qualquer momento

---

## 7. SERVIÇOS

### Cadastrar um serviço

1. Na página do projeto, clique em "Adicionar serviço"
2. Preencha:
   - **Nome**: identifique o serviço (ex: "Frontend React", "Backend API")
   - **Tipo**: Frontend, Backend, API, Worker, Bot ou Personalizado
   - **Diretório**: caminho completo na máquina (ex: `C:\Projetos\meu-app\frontend`)
   - **Comando**: comando de inicialização (ex: `npm run dev`, `npm start`)
   - **Porta**: porta que a aplicação usa (ex: 3000, 3001)
   - **Ambiente**: máquina onde o serviço vai rodar
3. Clique em "Criar serviço"

### Tipos de serviço

| Tipo | Exemplo | Quando usar |
|------|---------|-------------|
| **Frontend** | React, Vue, Next.js | Interface do usuário |
| **Backend** | NestJS, Express, Django | API e lógica de negócio |
| **API** | REST, GraphQL | Endpoints de comunicação |
| **Worker** | Filas, cron jobs | Processos em segundo plano |
| **Bot** | Telegram, Discord | Bots automatizados |
| **Personalizado** | Qualquer outro | Comando customizado |

### Controles de serviço

Na página do projeto ou na página global `/servicos`:

| Botão | Ação | Quando disponível |
|-------|------|-------------------|
| ▶ **Iniciar** | Executa o serviço via PM2 | Serviço parado/erro |
| ⏹ **Parar** | Para o serviço via PM2 | Serviço rodando |
| 🔄 **Reiniciar** | Reinicia o serviço via PM2 | Serviço rodando |

### Página global de serviços

**URL:** `/servicos`

Lista todos os serviços de todos os projetos. Útil para:
- Ver status de tudo em um só lugar
- Filtrar por status (online, parado, com erro)
- Controlar serviços sem navegar até cada projeto

### Editar um serviço

1. Expanda o painel do serviço (clique nele)
2. Clique em "Editar"
3. Altere os campos desejados
4. Clique em "Salvar"

### Excluir um serviço

1. Expanda o painel do serviço
2. Clique em "Excluir"
3. Confirme no modal
4. **Atenção**: esta ação não pode ser desfeita

---

## 8. LOGS

### Página de logs

**URL:** `/logs`

1. Selecione um serviço no dropdown
2. Escolha o filtro de fonte:
   - **Todos**: mostra tudo
   - **stdout**: saída padrão
   - **stderr**: mensagens de erro
3. Escolha a quantidade de linhas (50, 100 ou 200)
4. Clique em "Atualizar"

### Modal de logs (dentro do projeto)

1. Na página do projeto, expanda um serviço
2. Clique em "Logs"
3. O modal mostra os logs em tempo real
4. Use os filtros para refinar

### Entendendo os logs

```
14:32:15 [INFO] Servidor rodando na porta 3001
14:32:16 [WARN] Conexão com banco lenta
14:32:17 [ERROR] Falha ao conectar no Redis
```

- **Timestamp**: hora do log
- **Nível**: info (informação), warn (aviso), error (erro)
- **Mensagem**: o que aconteceu

---

## 9. GIT

### Modal Git (dentro do projeto)

1. Expanda um serviço
2. Clique em "Git"
3. O modal tem duas abas:

### Aba Status

- **Branch atual**: branch que está sendo usada
- **Arquivos modificados**: lista de alterações locais
  - **M** (amarelo): modificado
  - **A** (verde): adicionado
  - **D** (vermelho): deletado
  - **?** (cinza): não rastreado

### Aba Branches

- Lista todas as branches disponíveis
- A branch atual tem um ponto azul (●)
- Outras branches têm círculo vazio (○)

### Git Pull

1. Na aba Status, clique em "Pull"
2. O código será atualizado do repositório remoto
3. A saída é exibida no modal

### Modal Commits

1. Expanda um serviço
2. Clique em "Commits"
3. O modal mostra o histórico de commits
4. Cada commit tem:
   - Hash (identificador)
   - Mensagem
   - Autor
   - Data/hora
   - Botão para restaurar

### Restaurar um commit

1. No modal de commits, encontre o commit desejado
2. Clique no botão de restaurar (🔄)
3. O agente fará `git checkout` para esse commit
4. **Atenção**: isso muda o código para uma versão anterior

### Voltar ao último commit

Se você restaurou um commit e quer voltar para a branch atual:
1. Clique em "Voltar ao último commit"
2. Confirme no modal
3. O código volta para a versão mais recente da branch

---

## 10. HISTÓRICO

**URL:** `/historico`

### O que é

Linha do tempo de todas as ações executadas na plataforma. Cada iniciar, parar ou reiniciar é registrado aqui.

### Entendendo os status

| Status | Significado |
|--------|-------------|
| ✅ **Sucesso** | Ação executada corretamente |
| ❌ **Falhou** | Ação não pôde ser executada |
| ⏳ **Pendente** | Ação ainda não concluída |

### Paginação

Use os botões "Anterior" e "Próxima" para navegar entre as páginas. A quantidade de itens por página pode ser configurada em Configurações.

---

## 11. CONFIGURAÇÕES

**URL:** `/configuracoes`

### Minha Conta

- **Nome**: seu nome completo
- **Email**: seu email (usado para login)
- **Alterar senha**: informe a senha atual e a nova senha (mínimo 6 caracteres)

### Organização

- **Nome da organização**: nome da empresa/equipe
- **Slug**: identificador único (somente leitura)

### Preferências do Painel

- **Itens por página**: quantos itens mostrar por página no histórico (10, 20, 50 ou 100)
- **Atualizar dados automaticamente**: ativa/desativa a atualização automática do dashboard a cada 15 segundos

As preferências são salvas localmente no navegador.

---

## 12. SEGURANÇA

### Diretórios autorizados

O agente pode ser configurado para aceitar comandos apenas de diretórios específicos. Isso previne que comandos maliciosos acessem arquivos sensíveis.

**Como configurar:**
1. Vá na página do ambiente
2. Na seção "Segurança", adicione os paths permitidos
3. Salve

**Exemplos:**
- Windows: `C:\Projetos`, `D:\Apps`
- Linux: `/home/user/projetos`, `/var/www`

### Whitelist de comandos

A API central apenas aceita 16 tipos de comando pré-definidos. Qualquer tentativa de enviar um tipo não listado é rejeitada automaticamente.

### Proteção contra execução arbitrária

O agente valida o conteúdo dos comandos antes de executar:
- Rejeita comandos de shell perigosos (`rm -rf`, `format`, etc.)
- Valida nomes de branch (sem caracteres especiais)
- Valida hashes de commit (apenas hexadecimal)
- Verifica se o diretório está na lista de autorizados

---

## 13. ATUALIZAÇÃO EM TEMPO REAL

### Como funciona

O painel usa **WebSocket** para receber atualizações instantâneas do servidor. Quando algo muda (um agente fica online, um serviço reinicia), o painel atualiza automaticamente.

### Polling como fallback

Se a conexão WebSocket falhar, o painel usa **polling** (verificação periódica) a cada 15 segundos.

### Configurar

Em **Configurações → Preferências**, você pode ativar ou desativar a atualização automática.

---

## 14. FLUXOS DE TRABALHO EXEMPLOS

### Cenário 1: Freelancer com 2 projetos

**Situação:** Você trabalha com 2 clientes e gerencia tudo do seu notebook.

**Passo a passo:**

1. **Criar 1 ambiente** ("Meu Notebook", tipo Local, Windows/Linux)
2. **Conectar agente** no seu notebook
3. **Criar projeto "App Cliente A"**
   - Serviço: Frontend (React, porta 3000, dir: `C:\Projetos\cliente-a\frontend`)
   - Serviço: Backend (Node.js, porta 3001, dir: `C:\Projetos\cliente-a\backend`)
4. **Criar projeto "Site Cliente B"**
   - Serviço: Frontend (Next.js, porta 3002, dir: `C:\Projetos\cliente-b\site`)
5. **Gerenciar tudo pelo painel**
   - Iniciar/parar serviços conforme necessário
   - Verificar logs quando algo dá errado
   - Usar Git para atualizar código

### Cenário 2: Software house com dev + produção

**Situação:** Sua empresa tem ambientes de desenvolvimento e produção.

**Passo a passo:**

1. **Criar 2 ambientes:**
   - "Notebook Dev" (tipo Desenvolvimento, Windows)
   - "VPS Produção" (tipo Produção, Linux)
2. **Conectar agentes** em ambas as máquinas
3. **Criar projeto "Sistema de Chamados"**
   - No ambiente Dev: Frontend + Backend (portas 3000, 3001)
   - No ambiente Prod: Frontend + Backend (portas 80, 443)
4. **Usar o dashboard** para monitorar tudo
5. **Usar /servicos** para controlar rapidamente

### Cenário 3: Dev fullstack individual

**Situação:** Você desenvolve frontend, backend e worker no mesmo projeto.

**Passo a passo:**

1. **Criar 1 ambiente** ("Desktop Dev", tipo Desenvolvimento)
2. **Conectar agente**
3. **Criar projeto "Sistema Completo"**
   - Serviço: Frontend (React, porta 3000)
   - Serviço: Backend (NestJS, porta 3001)
   - Serviço: Worker (filas, sem porta)
4. **Configurar diretórios autorizados** para segurança
5. **Usar Git** para atualizar código periodicamente
6. **Monitorar logs** em tempo real

### Cenário 4: Equipe remota com múltiplas máquinas

**Situação:** Sua equipe tem 3 máquinas: dev, staging e produção.

**Passo a passo:**

1. **Criar 3 ambientes:**
   - "Dev - João" (notebook do dev)
   - "Staging" (servidor de testes)
   - "Produção" (VPS)
2. **Conectar agentes** em todas
3. **Criar projeto "App Principal"**
   - Configurar serviços em cada ambiente conforme necessário
4. **Usar o painel** para:
   - Verificar status de todas as máquinas
   - Iniciar/parar em ambientes específicos
   - Comparar logs entre ambientes

---

## 15. SOLUÇÃO DE PROBLEMAS (FAQ)

### O agente aparece "Desconectado"

**Possíveis causas:**
- O agente não está rodando na máquina
- A URL da API está incorreta
- O token expirou ou é inválido
- Problema de rede entre a máquina e a API

**Soluções:**
1. Verifique se o processo do agente está ativo
2. Confirme a URL da API (`AGENT_API_URL`)
3. Gere um novo token na página do ambiente
4. Verifique se a porta 4001 está acessível

### O serviço fica em estado "Erro"

**Possíveis causas:**
- Comando de inicialização incorreto
- Diretório não existe na máquina
- Porta já em uso por outro processo
- Erro na aplicação (verifique os logs)

**Soluções:**
1. Verifique os logs do serviço
2. Confirme o diretório e o comando
3. Verifique se a porta está livre
4. Teste o comando manualmente no terminal

### Porta já em uso

**Solução:**
1. Verifique qual processo está usando a porta
2. Pare o processo ou mude a porta do serviço
3. Use a página `/servicos` para ver todos os serviços e suas portas

### Logs não aparecem

**Possíveis causas:**
- Serviço não foi iniciado
- Serviço não gera logs no stdout/stderr
- Agente desconectado

**Soluções:**
1. Inicie o serviço primeiro
2. Verifique se o serviço gera logs
3. Confirme se o agente está online

### Git pull falha

**Possíveis causas:**
- Conflitos de merge
- Repositório remoto inacessível
- Diretório não é um repositório Git

**Soluções:**
1. Verifique se não há alterações locais não commitadas
2. Confirme a URL do repositório remoto
3. Verifique se o diretório está correto

### Comando não encontrado

**Possíveis causas:**
- O comando não está instalado na máquina
- O caminho do comando não está no PATH

**Soluções:**
1. Instale o software necessário (Node.js, Python, etc.)
2. Verifique se o comando funciona no terminal da máquina

### "Nenhum agente encontrado para o ambiente"

**Solução:**
1. Verifique se o ambiente possui um agente associado
2. Gere um token e instale o agente na máquina
3. Confirme que o agente está online

---

## 16. GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Organização** | Empresa, equipe ou grupo que agrupa todos os recursos |
| **Ambiente** | Máquina ou servidor onde os projetos rodam |
| **Agente** | Software instalado no ambiente que executa comandos remotamente |
| **Projeto** | Agrupamento lógico de serviços (ex: "Sistema de Chamados") |
| **Serviço** | Uma aplicação ou processo executável (ex: frontend, backend) |
| **PM2** | Gerenciador de processos que mantém aplicações rodando |
| **Heartbeat** | Sinal periódico que o agente envia para confirmar que está online |
| **Status** | Estado atual de um serviço (online, stopped, errored) |
| **PID** | Identificador único de um processo no sistema operacional |
| **Uptime** | Tempo que um processo está rodando sem interrupção |
| **WebSocket** | Protocolo de comunicação em tempo real entre navegador e servidor |
| **Polling** | Verificação periódica de dados (alternativa ao WebSocket) |
| **Git** | Sistema de controle de versão para código-fonte |
| **Branch** | Linha de desenvolvimento independente no Git |
| **Commit** | Registro de alterações no código no Git |
| **Pull** | Baixar alterações do repositório remoto no Git |
| **Checkout** | Mudar para outra branch ou commit no Git |
| **Token** | Chave de autenticação usada pelo agente para se conectar |
| **Slug** | Identificador único de texto (normalizado para URLs) |
| **Frontend** | Parte visual da aplicação (o que o usuário vê) |
| **Backend** | Parte lógica do servidor (API, regras de negócio) |
| **Worker** | Processo que roda em segundo plano (filas, cron) |
| **Bot** | Aplicação automatizada (Telegram, Discord) |
| **API** | Interface de programação para comunicação entre sistemas |
| **CORS** | Política de segurança que controla requisições entre domínios |
| **JWT** | JSON Web Token — padrão de autenticação |

---

*Guia atualizado em setembro de 2026.*
