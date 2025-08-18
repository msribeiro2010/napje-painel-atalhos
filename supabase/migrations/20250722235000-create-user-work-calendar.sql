CREATE TABLE public.user_work_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('presencial', 'remoto', 'ferias', 'folga', 'plantao')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, date)
); 