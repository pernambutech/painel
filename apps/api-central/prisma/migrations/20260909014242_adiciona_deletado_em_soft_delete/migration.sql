-- AlterTable
ALTER TABLE "ambientes" ADD COLUMN     "deletado_em" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projetos" ADD COLUMN     "deletado_em" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "deletado_em" TIMESTAMP(3);
