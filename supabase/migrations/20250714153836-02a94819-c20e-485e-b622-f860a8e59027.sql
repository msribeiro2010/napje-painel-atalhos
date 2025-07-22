-- Adicionar coluna favorite_buttons na tabela user_shortcuts_preferences
ALTER TABLE public.user_shortcuts_preferences 
ADD COLUMN favorite_buttons text[] DEFAULT NULL;