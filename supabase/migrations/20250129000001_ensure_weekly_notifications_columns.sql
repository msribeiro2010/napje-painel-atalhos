-- Ensure weekly_notifications table has all required columns with correct names
-- This migration handles various possible states of the table

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS public.weekly_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add dayofweek column (lowercase) if it doesn't exist
DO $$
BEGIN
    -- Check if dayofweek column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weekly_notifications' 
                   AND column_name = 'dayofweek') THEN
        
        -- Check if dayOfWeek exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weekly_notifications' 
                   AND column_name = 'dayOfWeek') THEN
            ALTER TABLE public.weekly_notifications 
            RENAME COLUMN "dayOfWeek" TO dayofweek;
        ELSE
            -- Create new column if neither exists
            ALTER TABLE public.weekly_notifications 
            ADD COLUMN dayofweek integer DEFAULT 1 CHECK (dayofweek >= 0 AND dayofweek <= 6);
        END IF;
    END IF;
END $$;

-- Add time column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weekly_notifications' 
                   AND column_name = 'time') THEN
        ALTER TABLE public.weekly_notifications 
        ADD COLUMN time text DEFAULT '09:00' CHECK (time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
    END IF;
END $$;

-- Update any existing records that might have NULL values
UPDATE public.weekly_notifications 
SET dayofweek = 1 
WHERE dayofweek IS NULL;

UPDATE public.weekly_notifications 
SET time = '09:00' 
WHERE time IS NULL;

-- Make the columns NOT NULL if they aren't already
DO $$
BEGIN
    -- Make dayofweek NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_notifications' 
               AND column_name = 'dayofweek' 
               AND is_nullable = 'YES') THEN
        ALTER TABLE public.weekly_notifications 
        ALTER COLUMN dayofweek SET NOT NULL;
    END IF;
    
    -- Make time NOT NULL  
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_notifications' 
               AND column_name = 'time' 
               AND is_nullable = 'YES') THEN
        ALTER TABLE public.weekly_notifications 
        ALTER COLUMN time SET NOT NULL;
    END IF;
END $$;

-- Add comments to explain the fields
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.time IS 'Time for notification in HH:MM format (24-hour)';

-- Ensure RLS is enabled
ALTER TABLE public.weekly_notifications ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist
DO $$
BEGIN
    -- Create SELECT policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_notifications' AND policyname = 'Users can view all weekly notifications') THEN
        CREATE POLICY "Users can view all weekly notifications" ON public.weekly_notifications
            FOR SELECT USING (true);
    END IF;
    
    -- Create INSERT policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_notifications' AND policyname = 'Users can insert weekly notifications') THEN
        CREATE POLICY "Users can insert weekly notifications" ON public.weekly_notifications
            FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Create UPDATE policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_notifications' AND policyname = 'Users can update weekly notifications') THEN
        CREATE POLICY "Users can update weekly notifications" ON public.weekly_notifications
            FOR UPDATE USING (true);
    END IF;
    
    -- Create DELETE policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_notifications' AND policyname = 'Users can delete weekly notifications') THEN
        CREATE POLICY "Users can delete weekly notifications" ON public.weekly_notifications
            FOR DELETE USING (true);
    END IF;
END $$;

-- Ensure updated_at function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists
DROP TRIGGER IF EXISTS handle_weekly_notifications_updated_at ON public.weekly_notifications;
CREATE TRIGGER handle_weekly_notifications_updated_at
    BEFORE UPDATE ON public.weekly_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();