-- Migration: Adiciona campos de perfil ao usuario
-- Campos: sobrenome, avatar, cargo, timezone, ultimoLoginEm

ALTER TABLE "usuarios" ADD COLUMN "sobrenome" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "avatar" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "cargo" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo';
ALTER TABLE "usuarios" ADD COLUMN "ultimo_login_em" TIMESTAMP(3);
