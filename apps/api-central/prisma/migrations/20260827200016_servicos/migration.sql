-- CreateTable
CREATE TABLE "servicos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'custom',
    "diretorio" TEXT,
    "comando" TEXT,
    "porta" INTEGER,
    "projeto_id" UUID NOT NULL,
    "ambiente_id" UUID,
    "organizacao_id" UUID NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "servicos_projeto_id_idx" ON "servicos"("projeto_id");

-- CreateIndex
CREATE INDEX "servicos_ambiente_id_idx" ON "servicos"("ambiente_id");

-- CreateIndex
CREATE INDEX "servicos_organizacao_id_idx" ON "servicos"("organizacao_id");

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_ambiente_id_fkey" FOREIGN KEY ("ambiente_id") REFERENCES "ambientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
