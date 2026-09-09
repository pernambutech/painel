-- AlterTable: Adicionar campos variaveisAmbiente e healthCheckUrl ao Servico
ALTER TABLE "servicos" ADD COLUMN "variaveis_ambiente" JSONB,
ADD COLUMN "health_check_url" TEXT;
