-- Fix weekly_notifications table structure to ensure selectedDays and isWeekdayRange columns exist
-- This migration ensures compatibility with the frontend code

-- First, check if columns exist and add them if they don't
DO $$
BEGIN
    -- Add selectedDays column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_notifications' 
        AND column_name = 'selectedDays'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.weekly_notifications 
        ADD COLUMN selectedDays integer[] DEFAULT ARRAY[1];
        
        -- Populate with existing dayofweek values
        UPDATE public.weekly_notifications 
        SET selectedDays = ARRAY[dayofweek]
        WHERE selectedDays IS NULL;
    END IF;

    -- Add isWeekdayRange column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_notifications' 
        AND column_name = 'isWeekdayRange'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.weekly_notifications 
        ADD COLUMN isWeekdayRange boolean DEFAULT false;
    END IF;

    -- Ensure dayofweek column exists (compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_notifications' 
        AND column_name = 'dayofweek'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.weekly_notifications 
        ADD COLUMN dayofweek integer DEFAULT 1 CHECK (dayofweek >= 0 AND dayofweek <= 6);
    END IF;

    -- Ensure time column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_notifications' 
        AND column_name = 'time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.weekly_notifications 
        ADD COLUMN time text DEFAULT '09:00' CHECK (time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
    END IF;
END $$;

-- Ensure all existing records have valid data
UPDATE public.weekly_notifications 
SET selectedDays = ARRAY[COALESCE(dayofweek, 1)]
WHERE selectedDays IS NULL OR selectedDays = ARRAY[]::integer[];

UPDATE public.weekly_notifications 
SET isWeekdayRange = false
WHERE isWeekdayRange IS NULL;

UPDATE public.weekly_notifications 
SET dayofweek = 1
WHERE dayofweek IS NULL;

UPDATE public.weekly_notifications 
SET time = '09:00'
WHERE time IS NULL OR time = '';

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add constraint for selectedDays if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'weekly_notifications' 
        AND constraint_name = 'check_selectedDays_valid'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.weekly_notifications 
        ADD CONSTRAINT check_selectedDays_valid 
        CHECK (selectedDays <@ ARRAY[0,1,2,3,4,5,6]);
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_weekly_notifications_selectedDays 
ON public.weekly_notifications USING GIN (selectedDays);

CREATE INDEX IF NOT EXISTS idx_weekly_notifications_isWeekdayRange 
ON public.weekly_notifications (isWeekdayRange);

CREATE INDEX IF NOT EXISTS idx_weekly_notifications_dayofweek 
ON public.weekly_notifications (dayofweek);

CREATE INDEX IF NOT EXISTS idx_weekly_notifications_time 
ON public.weekly_notifications (time);

-- Add comments
COMMENT ON COLUMN public.weekly_notifications.selectedDays IS 'Array of selected days for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.isWeekdayRange IS 'Indicates if the Monday-Friday weekday range is selected';
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Single day of the week for compatibility (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.time IS 'Time for notification in HH:MM format (24-hour)';

COMMENT ON TABLE public.weekly_notifications IS 'Table for managing weekly notifications with support for multiple days selection and weekday ranges - Updated schema';