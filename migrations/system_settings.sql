-- Criação da tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "key" character varying NOT NULL,
  "value" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("key")
);

-- Inserção de configurações padrão
INSERT INTO "system_settings" ("key", "value")
VALUES
  ('siteName', 'Autovagas'),
  ('siteDescription', 'Plataforma de automação para busca de empregos'),
  ('maintenanceMode', 'false'),
  ('emailNotifications', 'true'),
  ('adminAlerts', 'true'),
  ('userRegistrationNotifications', 'true'),
  ('paymentNotifications', 'true')
ON CONFLICT ("key") DO NOTHING;

-- Adiciona coluna status na tabela de usuários se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "status" character varying DEFAULT 'active';
  END IF;
END $$;

-- Adiciona coluna autoRenew na tabela de assinaturas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'autoRenew'
  ) THEN
    ALTER TABLE "subscriptions" ADD COLUMN "autoRenew" boolean DEFAULT true;
  END IF;
END $$;

-- Cria a tabela de logs de bots se não existir
CREATE TABLE IF NOT EXISTS "bot_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid REFERENCES "users" ("id"),
  "action" character varying NOT NULL,
  "status" character varying NOT NULL,
  "details" jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Cria índices para melhorar a performance
CREATE INDEX IF NOT EXISTS "idx_system_settings_key" ON "system_settings" ("key");
CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_autoRenew" ON "subscriptions" ("autoRenew");
CREATE INDEX IF NOT EXISTS "idx_bot_logs_userId" ON "bot_logs" ("userId");
CREATE INDEX IF NOT EXISTS "idx_bot_logs_createdAt" ON "bot_logs" ("createdAt");
