-- Add support for multiple days selection in weekly notifications
-- This migration adds selectedDays and isWeekdayRange columns

-- Add selectedDays column to store array of selected days
ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS selectedDays integer[] DEFAULT ARRAY[1];

-- Add isWeekdayRange column to indicate if Monday-Friday range is selected
ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS isWeekdayRange boolean DEFAULT false;

-- Add comments to explain the new fields
COMMENT ON COLUMN public.weekly_notifications.selectedDays IS 'Array of selected days for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.isWeekdayRange IS 'Indicates if the Monday-Friday weekday range is selected';

-- Update existing records to use the new multi-day system
-- Convert existing dayofweek values to selectedDays array
UPDATE public.weekly_notifications 
SET selectedDays = ARRAY[dayofweek]
WHERE selectedDays IS NULL OR selectedDays = ARRAY[]::integer[];

-- Ensure all records have valid selectedDays
UPDATE public.weekly_notifications 
SET selectedDays = ARRAY[1]
WHERE selectedDays IS NULL OR selectedDays = ARRAY[]::integer[];

-- Add constraint to ensure selectedDays contains valid day values (0-6)
ALTER TABLE public.weekly_notifications 
ADD CONSTRAINT check_selectedDays_valid 
CHECK (selectedDays <@ ARRAY[0,1,2,3,4,5,6]);

-- Add index for better performance on selectedDays queries
CREATE INDEX IF NOT EXISTS idx_weekly_notifications_selectedDays 
ON public.weekly_notifications USING GIN (selectedDays);

-- Add index for isWeekdayRange queries
CREATE INDEX IF NOT EXISTS idx_weekly_notifications_isWeekdayRange 
ON public.weekly_notifications (isWeekdayRange);

COMMENT ON TABLE public.weekly_notifications IS 'Table for managing weekly notifications with support for multiple days selection and weekday ranges';