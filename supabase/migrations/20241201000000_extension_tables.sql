-- Migration para criar tabelas da extensão Chrome
-- Criado em: 2024-12-01

-- Tabela para armazenar configurações da extensão por usuário
CREATE TABLE IF NOT EXISTS extension_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  UNIQUE(user_id)
);

-- Tabela para armazenar estatísticas da extensão
CREATE TABLE IF NOT EXISTS extension_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('job_found', 'application_submitted', 'error', 'session_start', 'session_end')),
  data JSONB NOT NULL DEFAULT '{}',
  tab_url TEXT,
  platform VARCHAR(20) NOT NULL DEFAULT 'unknown',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  INDEX idx_extension_statistics_user_id (user_id),
  INDEX idx_extension_statistics_event_type (event_type),
  INDEX idx_extension_statistics_platform (platform),
  INDEX idx_extension_statistics_timestamp (timestamp),
  INDEX idx_extension_statistics_created_at (created_at)
);

-- Tabela para armazenar aplicações feitas pela extensão
CREATE TABLE IF NOT EXISTS extension_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('linkedin', 'infojobs', 'catho', 'indeed', 'vagas')),
  url TEXT NOT NULL,
  salary VARCHAR(100),
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'rejected', 'interview', 'hired')),
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  INDEX idx_extension_applications_user_id (user_id),
  INDEX idx_extension_applications_platform (platform),
  INDEX idx_extension_applications_applied_at (applied_at),
  INDEX idx_extension_applications_status (status),
  INDEX idx_extension_applications_created_at (created_at),
  
  -- Índice composto para consultas de limite
  INDEX idx_extension_applications_user_applied (user_id, applied_at),
  
  -- Evita aplicações duplicadas
  UNIQUE(user_id, job_id, platform)
);

-- Tabela para armazenar sessões da extensão
CREATE TABLE IF NOT EXISTS extension_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  jobs_found INTEGER DEFAULT 0,
  applications_submitted INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  user_agent TEXT,
  extension_version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  INDEX idx_extension_sessions_user_id (user_id),
  INDEX idx_extension_sessions_platform (platform),
  INDEX idx_extension_sessions_started_at (started_at),
  
  -- Sessão única por usuário/plataforma ativa
  UNIQUE(user_id, platform, session_id)
);

-- Tabela para armazenar logs de erro da extensão
CREATE TABLE IF NOT EXISTS extension_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES extension_sessions(id) ON DELETE CASCADE,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  platform VARCHAR(20),
  url TEXT,
  user_agent TEXT,
  extension_version VARCHAR(20),
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  INDEX idx_extension_error_logs_user_id (user_id),
  INDEX idx_extension_error_logs_error_type (error_type),
  INDEX idx_extension_error_logs_platform (platform),
  INDEX idx_extension_error_logs_created_at (created_at)
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_extension_settings_updated_at 
  BEFORE UPDATE ON extension_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_applications_updated_at 
  BEFORE UPDATE ON extension_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar dados antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_extension_data()
RETURNS void AS $$
BEGIN
  -- Remove estatísticas mais antigas que 90 dias
  DELETE FROM extension_statistics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove logs de erro mais antigos que 30 dias
  DELETE FROM extension_error_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Remove sessões mais antigas que 30 dias
  DELETE FROM extension_sessions 
  WHERE started_at < NOW() - INTERVAL '30 days';
  
  -- Log da limpeza
  RAISE NOTICE 'Extension data cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS (Row Level Security)
ALTER TABLE extension_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_error_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para extension_settings
CREATE POLICY "Users can view their own extension settings" ON extension_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension settings" ON extension_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extension settings" ON extension_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para extension_statistics
CREATE POLICY "Users can view their own extension statistics" ON extension_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension statistics" ON extension_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para extension_applications
CREATE POLICY "Users can view their own extension applications" ON extension_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension applications" ON extension_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extension applications" ON extension_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para extension_sessions
CREATE POLICY "Users can view their own extension sessions" ON extension_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension sessions" ON extension_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extension sessions" ON extension_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para extension_error_logs
CREATE POLICY "Users can view their own extension error logs" ON extension_error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension error logs" ON extension_error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentários nas tabelas
COMMENT ON TABLE extension_settings IS 'Configurações personalizadas da extensão por usuário';
COMMENT ON TABLE extension_statistics IS 'Estatísticas de uso da extensão Chrome';
COMMENT ON TABLE extension_applications IS 'Aplicações para vagas feitas através da extensão';
COMMENT ON TABLE extension_sessions IS 'Sessões de uso da extensão';
COMMENT ON TABLE extension_error_logs IS 'Logs de erro da extensão para debugging';

-- Comentários nas colunas principais
COMMENT ON COLUMN extension_applications.job_id IS 'ID único da vaga na plataforma';
COMMENT ON COLUMN extension_applications.platform IS 'Plataforma onde a vaga foi encontrada';
COMMENT ON COLUMN extension_applications.applied_at IS 'Data/hora quando a aplicação foi submetida';
COMMENT ON COLUMN extension_applications.status IS 'Status atual da aplicação';

COMMENT ON COLUMN extension_statistics.event_type IS 'Tipo de evento: job_found, application_submitted, error, session_start, session_end';
COMMENT ON COLUMN extension_statistics.platform IS 'Plataforma onde o evento ocorreu';

-- Inserir configurações padrão para usuários existentes (opcional)
-- INSERT INTO extension_settings (user_id, settings)
-- SELECT id, '{
--   "platforms": {
--     "linkedin": true,
--     "infojobs": true,
--     "catho": true,
--     "indeed": true,
--     "vagas": true
--   },
--   "searchCriteria": {
--     "keywords": [],
--     "locations": [],
--     "jobTypes": ["CLT", "PJ"],
--     "workModels": ["Remoto", "Híbrido", "Presencial"],
--     "salaryMin": 0,
--     "experienceLevel": "any"
--   },
--   "applicationSettings": {
--     "coverLetterTemplate": "",
--     "autoFillProfile": true,
--     "skipAppliedJobs": true,
--     "delayBetweenApplications": 5000
--   }
-- }'::jsonb
-- FROM users 
-- WHERE subscription->>'plan' = 'basic'
-- ON CONFLICT (user_id) DO NOTHING;
