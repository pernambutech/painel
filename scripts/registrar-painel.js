const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const raiz = path.resolve(__dirname, '..');
const email = 'william.brito@pernambutech.com';
const senha = '123456';

async function executar() {
  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { nome: 'William Brito', senha: senhaHash, ativo: true },
    create: { nome: 'William Brito', email, senha: senhaHash },
  });

  const organizacao = await prisma.organizacao.upsert({
    where: { slug: 'pernambutech' },
    update: { nome: 'Pernambutech', ativo: true },
    create: { nome: 'Pernambutech', slug: 'pernambutech' },
  });

  await prisma.membroOrganizacao.upsert({
    where: { usuarioId_organizacaoId: { usuarioId: usuario.id, organizacaoId: organizacao.id } },
    update: { papel: 'proprietario' },
    create: { usuarioId: usuario.id, organizacaoId: organizacao.id, papel: 'proprietario' },
  });

  const ambiente = await prisma.ambiente.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { nome: 'Desenvolvimento local', tipo: 'desenvolvimento', sistemaOperacional: 'windows' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Desenvolvimento local',
      tipo: 'desenvolvimento',
      sistemaOperacional: 'windows',
      organizacaoId: organizacao.id,
    },
  });

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
    { nome: 'painel-web', tipo: 'frontend', porta: 3000, diretorio: path.join(raiz, 'apps', 'painel-web'), comando: 'npm run start -- -p 3000' },
    { nome: 'painel-api', tipo: 'api', porta: 3001, diretorio: path.join(raiz, 'apps', 'api-central'), comando: 'npm run start' },
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