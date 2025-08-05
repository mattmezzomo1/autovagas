# Configuração do Supabase para o Dashboard Administrativo

Este documento descreve como configurar o Supabase para suportar as funcionalidades do dashboard administrativo.

## 1. Configuração das Variáveis de Ambiente

Primeiro, você precisa configurar as variáveis de ambiente do Supabase no arquivo `.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Como obter essas informações:

1. **SUPABASE_URL**: Vá para o seu projeto no Supabase Dashboard > Settings > API > Project URL
2. **SUPABASE_KEY**: Vá para Settings > API > Project API keys > anon public
3. **SUPABASE_SERVICE_KEY**: Vá para Settings > API > Project API keys > service_role (secret)
4. **SUPABASE_JWT_SECRET**: Vá para Settings > API > JWT Settings > JWT Secret

## 2. Executar as Migrações do Banco de Dados

Execute o script SQL fornecido para criar as tabelas necessárias:

```sql
-- Execute este script no SQL Editor do Supabase
-- Arquivo: migrations/system_settings.sql

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
```

## 3. Configurar as Políticas de Segurança (RLS)

Configure as políticas de Row Level Security para as tabelas:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bot_logs" ENABLE ROW LEVEL SECURITY;

-- Política para system_settings (apenas admins podem acessar)
CREATE POLICY "Admin access to system_settings" ON "system_settings"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users" 
      WHERE "users"."id" = auth.uid() 
      AND "users"."role" = 'admin'
    )
  );

-- Política para bot_logs (admins podem ver todos, usuários apenas os seus)
CREATE POLICY "Admin access to all bot_logs" ON "bot_logs"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users" 
      WHERE "users"."id" = auth.uid() 
      AND "users"."role" = 'admin'
    )
  );

CREATE POLICY "User access to own bot_logs" ON "bot_logs"
  FOR SELECT USING ("userId" = auth.uid());
```

## 4. Criar um Usuário Administrador

Para acessar o dashboard administrativo, você precisa de um usuário com role 'admin':

```sql
-- Inserir um usuário administrador (substitua os valores)
INSERT INTO "users" (
  "email",
  "fullName",
  "password",
  "role",
  "status"
) VALUES (
  'admin@autovagas.com',
  'Administrador',
  '$2b$10$hashedpassword', -- Use bcrypt para gerar o hash da senha
  'admin',
  'active'
);
```

## 5. Verificar a Configuração

Após executar as migrações, verifique se tudo está funcionando:

1. **Tabelas criadas**: Verifique se as tabelas `system_settings` e `bot_logs` foram criadas
2. **Dados inseridos**: Verifique se as configurações padrão foram inseridas na tabela `system_settings`
3. **Usuário admin**: Verifique se o usuário administrador foi criado com a role correta
4. **Políticas RLS**: Verifique se as políticas de segurança estão ativas

## 6. Testar a API

Após configurar o Supabase, teste as APIs administrativas:

```bash
# Fazer login como administrador
POST /api/auth/login
{
  "email": "admin@autovagas.com",
  "password": "sua_senha"
}

# Testar endpoint de usuários (com token de admin)
GET /api/admin/users
Authorization: Bearer your_admin_token

# Testar endpoint de estatísticas
GET /api/admin/stats
Authorization: Bearer your_admin_token
```

## Troubleshooting

### Erro: "process is not defined"
- Certifique-se de que as variáveis de ambiente estão configuradas corretamente
- Verifique se o arquivo `.env` está na raiz do projeto

### Erro: "Invalid API key"
- Verifique se as chaves do Supabase estão corretas
- Certifique-se de usar a service_role key para operações administrativas

### Erro: "Row Level Security"
- Verifique se as políticas RLS estão configuradas corretamente
- Certifique-se de que o usuário tem a role 'admin'

### Erro: "Table does not exist"
- Execute as migrações SQL no Supabase Dashboard
- Verifique se todas as tabelas foram criadas corretamente
