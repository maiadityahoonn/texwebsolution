ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignment_scope TEXT DEFAULT 'intern' CHECK (assignment_scope IN ('tl', 'intern', 'both'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reference_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_size BIGINT;
