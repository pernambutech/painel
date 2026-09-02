-- AlterTable
ALTER TABLE "agentes" ADD COLUMN     "processos_erro" INTEGER DEFAULT 0,
ADD COLUMN     "processos_online" INTEGER DEFAULT 0,
ADD COLUMN     "processos_parados" INTEGER DEFAULT 0,
ADD COLUMN     "processos_total" INTEGER DEFAULT 0;
