Crie o design completo de UX e UI para uma plataforma web SaaS de gerenciamento centralizado de projetos, serviços, processos e ambientes de desenvolvimento.

O produto será inicialmente utilizado por desenvolvedores, freelancers, pequenas software houses e pequenas equipes técnicas.

IMPORTANTE:

Não crie apenas uma tela de dashboard.

Crie um sistema visual completo e coerente, incluindo:

- Design system.
- Arquitetura de navegação.
- Fluxos de usuário.
- Dashboard.
- Telas de gerenciamento.
- Estados dos componentes.
- Estados vazios.
- Estados de carregamento.
- Estados de erro.
- Responsividade.
- Experiência desktop prioritária.

A interface deve transmitir:

- Controle.
- Organização.
- Visibilidade.
- Segurança.
- Tecnologia.
- Confiabilidade.
- Clareza operacional.

O produto deve parecer uma plataforma profissional moderna para desenvolvedores, mas sem parecer excessivamente complexa ou corporativa.

Evitar aparência genérica de painel administrativo.

A interface deve ter identidade própria.

==================================================
1. CONTEXTO DO PRODUTO
==================================================

A plataforma permite centralizar o gerenciamento de múltiplos projetos e serviços.

Exemplo:

Projeto: Sistema de Chamados

Serviços:

- Frontend
- Backend
- Worker

Cada serviço pode possuir:

- Diretório.
- Comando de execução.
- Porta.
- Ambiente.
- Status.
- Logs.
- Configurações.

A plataforma também permite gerenciar:

- Máquinas.
- Servidores.
- Ambientes.
- Agentes instalados nas máquinas.
- Processos.
- Execuções.
- Logs.
- Histórico.
- Git.

O usuário deve conseguir controlar seus serviços através de uma única interface.

Ações principais:

- Iniciar serviço.
- Parar serviço.
- Reiniciar serviço.
- Visualizar status.
- Visualizar logs.
- Consultar informações do Git.
- Executar Git Pull.
- Configurar projetos.
- Configurar serviços.
- Visualizar ambientes.
- Monitorar agentes.

==================================================
2. PERFIL DO USUÁRIO
==================================================

Usuários principais:

- Desenvolvedor individual.
- Freelancer.
- Desenvolvedor full stack.
- Dono de pequena software house.
- Pequena equipe de desenvolvimento.

Características do usuário:

- Trabalha com vários projetos.
- Utiliza frontend e backend.
- Utiliza múltiplos terminais.
- Utiliza Git.
- Utiliza PM2.
- Pode trabalhar com servidores remotos.
- Precisa visualizar rapidamente o estado dos serviços.

A interface deve reduzir esforço cognitivo.

O usuário deve conseguir responder rapidamente:

- O que está funcionando?
- O que está parado?
- O que apresentou erro?
- Onde esse serviço está executando?
- Qual projeto precisa de atenção?
- Qual foi a última ação realizada?

==================================================
3. PERSONALIDADE VISUAL
==================================================

A interface deve ser:

- Moderna.
- Tecnológica.
- Profissional.
- Minimalista.
- Inteligente.
- Escura ou com suporte a tema escuro.
- Voltada para produtividade.
- Inspirada em ferramentas utilizadas por desenvolvedores.

Referências conceituais:

- Linear.
- Vercel.
- GitHub.
- Railway.
- Render.
- Raycast.
- Datadog.
- Grafana.
- Stripe Dashboard.

IMPORTANTE:

Não copiar nenhuma interface.

Utilizar apenas como referência de qualidade, organização e experiência.

Evitar:

- Interface excessivamente futurista.
- Muitos efeitos.
- Excesso de gradientes.
- Excesso de cards.
- Excesso de informação.
- Visual de template genérico.
- Poluição visual.
- Ícones sem significado.
- Dashboards com dezenas de métricas irrelevantes.

Priorizar:

- Hierarquia visual.
- Espaçamento.
- Legibilidade.
- Status facilmente identificáveis.
- Ações rápidas.
- Feedback imediato.

==================================================
4. ESTRUTURA PRINCIPAL DA APLICAÇÃO
==================================================

Criar uma aplicação com:

SIDEBAR PRINCIPAL

Itens:

- Visão Geral
- Projetos
- Serviços
- Ambientes
- Execuções
- Logs
- Histórico

Área inferior:

- Configurações
- Perfil do usuário

No topo:

- Organização atual.
- Seletor de organização preparado para futuro.
- Status geral dos ambientes.
- Notificações.
- Perfil do usuário.

A navegação deve ser simples.

O usuário deve entender onde está.

Utilizar breadcrumbs quando necessário.

==================================================
5. DASHBOARD PRINCIPAL
==================================================

Criar uma dashboard operacional.

A dashboard deve responder rapidamente:

- Quantos projetos existem?
- Quantos serviços estão online?
- Quantos serviços estão parados?
- Quantos possuem erro?
- Quantos ambientes estão online?
- Existe algum agente offline?

Estrutura sugerida:

TOPO:

Título:

Visão Geral

Subtítulo curto explicando a situação geral.

SEÇÃO 1:

Cards compactos:

- Projetos ativos.
- Serviços online.
- Serviços parados.
- Serviços com erro.
- Ambientes online.

SEÇÃO 2:

Serviços que precisam de atenção.

Exemplo:

Backend
Projeto: Sistema de Chamados
Status: Erro

Bot
Projeto: Automação
Status: Parado

Cada item deve permitir ação rápida.

Exemplo:

[ Iniciar ]
[ Reiniciar ]
[ Ver detalhes ]

SEÇÃO 3:

Atividade recente.

Exemplo:

- Backend reiniciado.
- Git Pull executado.
- Agente conectado.
- Serviço parado.
- Serviço apresentou erro.

SEÇÃO 4:

Resumo dos ambientes.

Exemplo:

Notebook Desenvolvimento
ONLINE

VPS Produção
ONLINE

Servidor Homologação
OFFLINE

Não transformar o dashboard em uma página cheia de gráficos.

Priorizar status operacional.

==================================================
6. TELA DE PROJETOS
==================================================

Criar tela de listagem de projetos.

Cada projeto deve mostrar:

- Nome.
- Descrição curta.
- Quantidade de serviços.
- Ambiente.
- Status geral.
- Última atividade.

Criar duas possibilidades de visualização:

- Lista.
- Cards.

O layout principal deve priorizar produtividade.

Adicionar:

- Busca.
- Filtros.
- Ordenação.
- Botão "Novo Projeto".

Estados:

- Sem projetos.
- Carregando.
- Erro.
- Resultado vazio após filtro.

==================================================
7. DETALHE DO PROJETO
==================================================

Criar uma das telas mais importantes do sistema.

Exemplo:

Sistema de Chamados

Informações:

- Status geral.
- Ambiente.
- Diretório principal.
- Última atualização.
- Última atividade.

Abaixo:

Serviços do projeto.

Exemplo:

Frontend

ONLINE
Porta: 3000

[ Reiniciar ]
[ Parar ]
[ Logs ]

Backend

ONLINE
Porta: 3001

[ Reiniciar ]
[ Parar ]
[ Logs ]

Worker

PARADO

[ Iniciar ]

Criar abas:

- Visão Geral
- Serviços
- Execuções
- Git
- Configurações

A tela deve permitir compreender rapidamente a situação completa do projeto.

==================================================
8. DETALHE DO SERVIÇO
==================================================

Criar tela detalhada de um serviço.

Exemplo:

Backend

Informações principais:

- Status.
- Projeto.
- Ambiente.
- Porta.
- PID.
- Tempo de execução.

Ações principais:

[ Iniciar ]

[ Parar ]

[ Reiniciar ]

[ Ver Logs ]

Criar área de informações técnicas:

- Diretório.
- Comando.
- Gerenciador de processo.
- Variáveis de ambiente.
- Última alteração.
- Último erro.

Criar abas:

- Visão Geral
- Logs
- Execuções
- Configurações

==================================================
9. TELA DE AMBIENTES
==================================================

Criar gerenciamento de ambientes.

Exemplo:

Notebook Desenvolvimento

Status:

ONLINE

Informações:

- Nome.
- Sistema operacional.
- Último contato.
- Versão do agente.
- Projetos associados.
- Serviços executando.

VPS Produção

Status:

ONLINE

Servidor Homologação

Status:

OFFLINE

Utilizar indicadores claros.

O status dos ambientes deve ser visualmente importante.

==================================================
10. TELA DE DETALHE DO AMBIENTE
==================================================

Criar tela com:

- Status do ambiente.
- Status do agente.
- Último heartbeat.
- Sistema operacional.
- Versão do agente.
- Serviços executando.
- Projetos associados.

Criar uma seção:

"Serviços neste ambiente"

Cada serviço deve permitir acesso rápido.

Preparar área futura para:

- CPU.
- Memória.
- Disco.

Não destacar métricas complexas inicialmente.

==================================================
11. TELA DE EXECUÇÕES
==================================================

Criar uma tela para acompanhar ações executadas.

Exemplos:

REINICIAR_SERVICO

Status:

SUCESSO

GIT_PULL

Status:

EM EXECUÇÃO

INICIAR_SERVICO

Status:

FALHOU

A tabela deve possuir:

- Tipo.
- Projeto.
- Serviço.
- Ambiente.
- Status.
- Usuário.
- Início.
- Duração.

Criar filtros.

Ao clicar:

Abrir detalhe da execução.

Mostrar:

- Linha do tempo.
- Status.
- Resultado.
- Mensagem de erro.
- Data.
- Usuário responsável.

==================================================
12. TELA DE LOGS
==================================================

Criar uma experiência inspirada em terminal, mas moderna.

Características:

- Fundo visual semelhante a console.
- Texto monoespaçado.
- Boa legibilidade.
- Linha temporal.
- Auto-scroll controlável.
- Busca.
- Filtros.
- Pausar atualização.
- Copiar logs.

Permitir:

- Selecionar projeto.
- Selecionar serviço.
- Selecionar período.

Criar estados:

- Sem logs.
- Carregando.
- Serviço offline.
- Erro ao carregar.

==================================================
13. TELA DE HISTÓRICO
==================================================

Mostrar eventos relevantes.

Exemplo:

10:42

João reiniciou Backend.

10:38

Agente VPS Produção conectado.

10:32

Git Pull executado.

Utilizar linha do tempo.

Permitir filtros.

==================================================
14. TELA DE CRIAÇÃO DE PROJETO
==================================================

Criar fluxo simples.

Não criar um formulário enorme.

Utilizar passos se necessário.

Fluxo sugerido:

PASSO 1

Informações do projeto:

- Nome.
- Descrição.

PASSO 2

Selecionar ambiente.

PASSO 3

Adicionar serviços.

PASSO 4

Revisar.

==================================================
15. CRIAÇÃO DE SERVIÇO
==================================================

Campos:

- Nome.
- Tipo.
- Diretório.
- Comando.
- Porta.
- Ambiente.

Criar ajuda contextual.

Exemplo:

Diretório:

"Caminho onde o serviço está localizado."

Comando:

"Comando utilizado para iniciar o serviço."

Evitar linguagem excessivamente técnica.

==================================================
16. GIT
==================================================

Criar interface simples.

Mostrar:

- Branch atual.
- Status.
- Último commit.
- Informações de alterações.

Ações:

[ Atualizar informações ]

[ Git Pull ]

A ação Git Pull deve possuir confirmação.

Mostrar progresso da execução.

==================================================
17. CONFIGURAÇÕES
==================================================

Criar áreas:

- Organização.
- Perfil.
- Segurança.
- Preferências.

Manter simples na primeira versão.

==================================================
18. ESTADOS DO SISTEMA
==================================================

Criar componentes visuais para:

STATUS:

- Online.
- Offline.
- Executando.
- Parado.
- Erro.
- Atenção.
- Desconhecido.

STATUS DE EXECUÇÃO:

- Pendente.
- Enviada.
- Em execução.
- Sucesso.
- Falhou.
- Cancelada.
- Expirada.

Os estados devem ser identificáveis mesmo sem depender exclusivamente de cores.

Utilizar:

- Texto.
- Ícones.
- Indicadores visuais.

==================================================
19. COMPONENTES DO DESIGN SYSTEM
==================================================

Criar componentes reutilizáveis:

- Botões.
- Botões de ação destrutiva.
- Botões de ação operacional.
- Inputs.
- Select.
- Checkbox.
- Switch.
- Modal.
- Drawer.
- Tooltip.
- Badge.
- Status.
- Card.
- Tabela.
- Dropdown.
- Tabs.
- Sidebar.
- Breadcrumb.
- Pagination.
- Skeleton.
- Empty state.
- Alert.
- Toast.
- Confirmation dialog.

Criar variantes.

==================================================
20. AÇÕES CRÍTICAS
==================================================

Criar UX especial para:

- Parar serviço.
- Reiniciar serviço.
- Git Pull.

Exemplo:

Parar serviço:

Modal:

"Parar Backend?"

"Este serviço ficará indisponível até ser iniciado novamente."

Botões:

[ Cancelar ]

[ Parar serviço ]

Evitar confirmações desnecessárias para todas as ações.

Criar confirmação principalmente para ações potencialmente impactantes.

==================================================
21. ESTADOS VAZIOS
==================================================

Criar telas vazias úteis.

Exemplo:

SEM PROJETOS

"Você ainda não possui projetos."

Botão:

[ Criar primeiro projeto ]

SEM AMBIENTES

"Conecte uma máquina para começar a gerenciar seus serviços."

Botão:

[ Adicionar ambiente ]

Os estados vazios devem orientar o usuário.

==================================================
22. ESTADOS DE ERRO
==================================================

Criar componentes claros para erros.

Exemplo:

"Não foi possível carregar os serviços."

Botões:

[ Tentar novamente ]

[ Voltar ]

Evitar mensagens técnicas para usuários.

Detalhes técnicos podem existir em uma área secundária.

==================================================
23. RESPONSIVIDADE
==================================================

Prioridade:

Desktop.

Também criar comportamento para:

- Tablet.
- Mobile.

No mobile:

- Sidebar recolhida.
- Navegação simplificada.
- Ações principais visíveis.
- Tabelas adaptadas.
- Informações secundárias ocultáveis.

Não tentar simplesmente diminuir a interface desktop.

Redesenhar a hierarquia quando necessário.

==================================================
24. ACESSIBILIDADE
==================================================

Garantir:

- Contraste adequado.
- Navegação por teclado.
- Estados de foco.
- Ícones com contexto.
- Texto legível.
- Áreas clicáveis adequadas.

==================================================
25. DESIGN SYSTEM VISUAL
==================================================

Criar uma base visual consistente.

Definir:

- Tipografia.
- Escala de tamanhos.
- Espaçamento.
- Bordas.
- Radius.
- Sombras.
- Hierarquia.
- Estados.
- Tokens de design.

Utilizar espaçamento consistente.

A interface deve possuir sensação de produto profissional.

==================================================
26. MODO VISUAL
==================================================

Criar:

Tema escuro como prioridade.

Preparar o design system para tema claro futuro.

O tema escuro deve:

- Não utilizar preto absoluto excessivamente.
- Possuir contraste confortável.
- Diferenciar níveis de superfície.
- Manter logs legíveis.
- Manter status claros.

==================================================
27. FLUXOS PRINCIPAIS
==================================================

Desenhar visualmente os seguintes fluxos:

FLUXO 1

Criar conta
↓
Criar organização
↓
Acessar dashboard

FLUXO 2

Adicionar ambiente
↓
Instalar agente
↓
Agente conecta
↓
Ambiente fica online

FLUXO 3

Criar projeto
↓
Adicionar serviços
↓
Configurar diretório
↓
Configurar comando
↓
Definir porta

FLUXO 4

Abrir projeto
↓
Visualizar serviços
↓
Selecionar Backend
↓
Reiniciar serviço
↓
Acompanhar execução
↓
Visualizar resultado

FLUXO 5

Serviço apresenta erro
↓
Dashboard destaca problema
↓
Usuário acessa serviço
↓
Visualiza logs
↓
Reinicia serviço

==================================================
28. PRIORIDADE DE TELAS
==================================================

Criar primeiro:

1. Dashboard.
2. Lista de projetos.
3. Detalhe do projeto.
4. Detalhe do serviço.
5. Lista de ambientes.
6. Detalhe do ambiente.
7. Execuções.
8. Logs.
9. Criação de projeto.
10. Criação de serviço.
11. Git.
12. Configurações.

==================================================
29. RESULTADO ESPERADO
==================================================

Criar um design completo que permita posteriormente implementar o frontend utilizando:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.

O design deve ser:

- Implementável.
- Consistente.
- Responsivo.
- Componentizado.
- Reutilizável.

Criar uma estrutura visual organizada no Figma com:

01. Design System
02. Componentes
03. Dashboard
04. Projetos
05. Serviços
06. Ambientes
07. Execuções
08. Logs
09. Histórico
10. Configurações
11. Fluxos
12. Responsividade

IMPORTANTE:

Não criar apenas imagens bonitas.

Pensar como um Product Designer experiente.

Criar uma experiência completa de produto SaaS técnico.

A prioridade máxima é:

CLAREZA OPERACIONAL

O usuário deve conseguir olhar para a interface e entender rapidamente:

- O que está funcionando.
- O que está parado.
- O que está com erro.
- O que precisa de atenção.
- Qual ação pode ser executada.