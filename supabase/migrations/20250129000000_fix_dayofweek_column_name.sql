-- Fix column name inconsistency: rename dayOfWeek to dayofweek
-- This ensures consistency between database schema and TypeScript types

ALTER TABLE public.weekly_notifications 
RENAME COLUMN "dayOfWeek" TO dayofweek;

-- Update the comment to reflect the correct column name
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';