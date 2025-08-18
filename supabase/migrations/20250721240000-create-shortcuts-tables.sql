-- Criar tabela de grupos de atalhos
CREATE TABLE IF NOT EXISTS shortcut_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de atalhos
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_shortcut_groups_order ON shortcut_groups("order");
CREATE INDEX IF NOT EXISTS idx_shortcuts_group_id ON shortcuts(group_id);
CREATE INDEX IF NOT EXISTS idx_shortcuts_order ON shortcuts("order");

-- Habilitar RLS (Row Level Security)
ALTER TABLE shortcut_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Políticas para shortcut_groups (todos podem ler, apenas admins podem modificar)
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

-- Políticas para shortcuts (todos podem ler, apenas admins podem modificar)
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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_shortcut_groups_updated_at 
  BEFORE UPDATE ON shortcut_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shortcuts_updated_at 
  BEFORE UPDATE ON shortcuts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 