-- CreateTable
CREATE TABLE "execucoes" (
    "id" UUID NOT NULL,
    "organizacao_id" UUID NOT NULL,
    "projeto_id" UUID,
    "servico_id" UUID NOT NULL,
    "ambiente_id" UUID,
    "acao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "resultado" JSONB,
    "erro" TEXT,
    "usuario_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "execucoes_organizacao_id_idx" ON "execucoes"("organizacao_id");

-- CreateIndex
CREATE INDEX "execucoes_servico_id_idx" ON "execucoes"("servico_id");

-- CreateIndex
CREATE INDEX "execucoes_usuario_id_idx" ON "execucoes"("usuario_id");

-- CreateIndex
CREATE INDEX "execucoes_criado_em_idx" ON "execucoes"("criado_em");

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_ambiente_id_fkey" FOREIGN KEY ("ambiente_id") REFERENCES "ambientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
