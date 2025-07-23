-- Add size column to postit_notes table for resizable notes
ALTER TABLE public.postit_notes 
ADD COLUMN size JSONB NOT NULL DEFAULT '{"width": 288, "height": 208}';

-- Add comment to explain the size column
COMMENT ON COLUMN public.postit_notes.size IS 'Stores the width and height of the note in pixels';
