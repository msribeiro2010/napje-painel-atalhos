-- =====================================================
-- CONFIGURAÇÃO DO BANCO DE DADOS PARA ATALHOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar tabela de grupos de atalhos
CREATE TABLE IF NOT EXISTS shortcut_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de atalhos
CREATE TABLE IF NOT EXISTS shortcuts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES shortcut_groups(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_shortcut_groups_order ON shortcut_groups("order");
CREATE INDEX IF NOT EXISTS idx_shortcuts_group_id ON shortcuts(group_id);
CREATE INDEX IF NOT EXISTS idx_shortcuts_order ON shortcuts("order");

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE shortcut_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para shortcut_groups (todos podem ler, apenas admins podem modificar)
CREATE POLICY "shortcut_groups_select_policy" ON shortcut_groups
  FOR SELECT USING (true);

CREATE POLICY "shortcut_groups_insert_policy" ON shortcut_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "shortcut_groups_update_policy" ON shortcut_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "shortcut_groups_delete_policy" ON shortcut_groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 6. Políticas para shortcuts (todos podem ler, apenas admins podem modificar)
CREATE POLICY "shortcuts_select_policy" ON shortcuts
  FOR SELECT USING (true);

CREATE POLICY "shortcuts_insert_policy" ON shortcuts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "shortcuts_update_policy" ON shortcuts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "shortcuts_delete_policy" ON shortcuts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Triggers para atualizar updated_at
CREATE TRIGGER update_shortcut_groups_updated_at 
  BEFORE UPDATE ON shortcut_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shortcuts_updated_at 
  BEFORE UPDATE ON shortcuts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- Descomente as linhas abaixo se quiser dados de teste
-- =====================================================

/*
-- Inserir grupos de exemplo
INSERT INTO shortcut_groups (title, icon, "order") VALUES
('Google Apps', '🌐', 1),
('PJe', '⚖️', 2),
('Sistemas Administrativos', '🏢', 3),
('Acesso a Outros Sistemas', '🔒', 4);

-- Inserir atalhos de exemplo
INSERT INTO shortcuts (title, url, icon, group_id, "order") VALUES
('Gmail', 'https://mail.google.com', '📧', (SELECT id FROM shortcut_groups WHERE title = 'Google Apps'), 1),
('Google Drive', 'https://drive.google.com', '📁', (SELECT id FROM shortcut_groups WHERE title = 'Google Apps'), 2),
('Google Calendar', 'https://calendar.google.com', '📅', (SELECT id FROM shortcut_groups WHERE title = 'Google Apps'), 3),
('PJe 1º Grau', 'https://pje.trt15.jus.br/primeirograu/login.seam', '⚖️', (SELECT id FROM shortcut_groups WHERE title = 'PJe'), 1),
('PJe 2º Grau', 'https://pje.trt15.jus.br/segundograu/login.seam', '⚖️', (SELECT id FROM shortcut_groups WHERE title = 'PJe'), 2),
('SEI', 'https://sei.trt15.jus.br/sei/', '📄', (SELECT id FROM shortcut_groups WHERE title = 'Sistemas Administrativos'), 1),
('Portal Corporativo', 'https://corporativo.trt15.jus.br/', '🌍', (SELECT id FROM shortcut_groups WHERE title = 'Sistemas Administrativos'), 2),
('Citrix', 'https://ctxvirtualdesktop.trt15.jus.br/', '🖥️', (SELECT id FROM shortcut_groups WHERE title = 'Acesso a Outros Sistemas'), 1);
*/ 