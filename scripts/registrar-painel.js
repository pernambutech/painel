/**
 * Script de registro do Painel
 * 
 * Registra o próprio painel no banco de dados, criando:
 * - Usuário administrador inicial
 * - Organização padrão
 * - Ambiente local (detectado automaticamente)
 * - Projeto Painel Central com seus serviços
 * 
 * Uso:
 *   node scripts/registrar-painel.js
 * 
 * Variáveis de ambiente (opcionais):
 *   PAINEL_ADMIN_EMAIL=email@exemplo.com
 *   PAINEL_ADMIN_SENHA=senha
 *   PAINEL_ADMIN_NOME=Nome do Admin
 *   PAINEL_ORG_NOME=Nome da Organização
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Configurações (podem ser sobrescritas por variáveis de ambiente)
const CONFIG = {
  // Usuário admin
  email: process.env.PAINEL_ADMIN_EMAIL || 'admin@painel.local',
  senha: process.env.PAINEL_ADMIN_SENHA || 'admin123',
  nome: process.env.PAINEL_ADMIN_NOME || 'Administrador',
  
  // Organização
  orgNome: process.env.PAINEL_ORG_NOME || 'Minha Organização',
  orgSlug: process.env.PAINEL_ORG_SLUG || 'minha-organizacao',
};

const prisma = new PrismaClient();
const raiz = path.resolve(__dirname, '..');

/**
 * Detecta o sistema operacional atual
 */
function detectarSistemaOperacional() {
  const plataforma = process.platform;
  
  switch (plataforma) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      return 'linux'; // Padrão para outros Unix-like
  }
}

async function executar() {
  console.log('🔧 Iniciando registro do Painel...\n');
  
  // Detectar SO
  const sistemaOperacional = detectarSistemaOperacional();
  console.log(`📟 Sistema operacional detectado: ${sistemaOperacional}`);
  
  // Criar/atualizar usuário admin
  console.log(`\n👤 Criando usuário administrador...`);
  console.log(`   Email: ${CONFIG.email}`);
  
  const senhaHash = await bcrypt.hash(CONFIG.senha, 10);
  const usuario = await prisma.usuario.upsert({
    where: { email: CONFIG.email },
    update: { nome: CONFIG.nome, senha: senhaHash, ativo: true },
    create: { nome: CONFIG.nome, email: CONFIG.email, senha: senhaHash },
  });
  console.log(`   ID: ${usuario.id}`);

  // Criar/atualizar organização
  console.log(`\n🏢 Criando organização: ${CONFIG.orgNome}`);
  const organizacao = await prisma.organizacao.upsert({
    where: { slug: CONFIG.orgSlug },
    update: { nome: CONFIG.orgNome, ativo: true },
    create: { nome: CONFIG.orgNome, slug: CONFIG.orgSlug },
  });
  console.log(`   ID: ${organizacao.id}`);

  // Associar usuário à organização como proprietário
  console.log(`\n🔗 Vinculando usuário à organização como proprietário...`);
  await prisma.membroOrganizacao.upsert({
    where: { usuarioId_organizacaoId: { usuarioId: usuario.id, organizacaoId: organizacao.id } },
    update: { papel: 'proprietario' },
    create: { usuarioId: usuario.id, organizacaoId: organizacao.id, papel: 'proprietario' },
  });

  // Criar/atualizar ambiente local
  const nomeAmbiente = sistemaOperacional === 'windows' 
    ? 'Windows Local' 
    : sistemaOperacional === 'macos' 
      ? 'macOS Local' 
      : 'Linux Local';
      
  console.log(`\n🖥️  Criando ambiente: ${nomeAmbiente}`);
  const ambiente = await prisma.ambiente.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { 
      nome: nomeAmbiente, 
      tipo: 'desenvolvimento', 
      sistemaOperacional: sistemaOperacional,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: nomeAmbiente,
      tipo: 'desenvolvimento',
      sistemaOperacional: sistemaOperacional,
      organizacaoId: organizacao.id,
    },
  });
  console.log(`   ID: ${ambiente.id}`);

  const projeto = await prisma.projeto.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: { nome: 'Painel Central', descricao: 'A própria plataforma gerenciada pelo Painel', ativo: true },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nome: 'Painel Central',
      descricao: 'A própria plataforma gerenciada pelo Painel',
      organizacaoId: organizacao.id,
    },
  });

  const servicos = [
    { nome: 'painel-web', tipo: 'frontend', porta: 4000, diretorio: path.join(raiz, 'apps', 'painel-web'), comando: 'npm run start -- -p 4000' },
    { nome: 'painel-api', tipo: 'api', porta: 4001, diretorio: path.join(raiz, 'apps', 'api-central'), comando: 'npm run start' },
    { nome: 'painel-agente', tipo: 'worker', porta: null, diretorio: path.join(raiz, 'apps', 'agente'), comando: 'npm run start' },
  ];

  for (const servico of servicos) {
    const existente = await prisma.servico.findFirst({ where: { nome: servico.nome, projetoId: projeto.id, organizacaoId: organizacao.id } });
    const dados = { ...servico, ambienteId: ambiente.id, ativo: true };
    if (existente) await prisma.servico.update({ where: { id: existente.id }, data: dados });
    else await prisma.servico.create({ data: { ...dados, projetoId: projeto.id, organizacaoId: organizacao.id } });
  }

  console.log(`Painel registrado: ${organizacao.nome} / ${projeto.nome} / ${servicos.length} serviços`);
}

executar()
  .catch((erro) => {
    console.error('Falha ao registrar o painel:', erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());