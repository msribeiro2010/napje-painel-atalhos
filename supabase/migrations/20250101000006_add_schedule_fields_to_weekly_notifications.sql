-- Add schedule fields to weekly_notifications table
ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS dayOfWeek integer DEFAULT 1 CHECK (dayOfWeek >= 0 AND dayOfWeek <= 6),
ADD COLUMN IF NOT EXISTS time text DEFAULT '09:00' CHECK (time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

-- Add comments to explain the fields
COMMENT ON COLUMN public.weekly_notifications.dayOfWeek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.time IS 'Time for notification in HH:MM format (24-hour)';

-- Update existing records to have default values
UPDATE public.weekly_notifications 
SET dayOfWeek = 1, time = '09:00' 
WHERE dayOfWeek IS NULL OR time IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE public.weekly_notifications 
ALTER COLUMN dayOfWeek SET NOT NULL,
ALTER COLUMN time SET NOT NULL;