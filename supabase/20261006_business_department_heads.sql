-- 20261006_business_department_heads.sql
-- Safe profile normalization for the unified TexWeb internal business platform.
-- Run after backing up production data. This does not delete old batch/TL data.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'web_dev';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Team Member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'employee';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reporting_head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

UPDATE public.profiles
SET
  role = 'sales_head',
  department = 'sales',
  domain = COALESCE(NULLIF(domain, ''), 'sales'),
  designation = 'Sales Head',
  employment_type = 'employee',
  updated_at = NOW()
WHERE lower(full_name) = 'priyank patel';

UPDATE public.profiles
SET
  role = 'tech_lead',
  department = 'tech',
  domain = COALESCE(NULLIF(domain, ''), 'web_dev'),
  designation = 'Tech Lead',
  employment_type = 'employee',
  updated_at = NOW()
WHERE lower(full_name) = 'aditya kumar gupta';

UPDATE public.profiles
SET
  role = 'hr',
  department = 'hr',
  domain = COALESCE(NULLIF(domain, ''), 'management'),
  designation = 'HR',
  employment_type = 'employee',
  updated_at = NOW()
WHERE lower(full_name) = 'shashank suman';

UPDATE public.profiles
SET
  role = 'smm_head',
  department = 'smm',
  domain = COALESCE(NULLIF(domain, ''), 'marketing'),
  designation = 'SMM Head',
  employment_type = 'employee',
  updated_at = NOW()
WHERE lower(full_name) = 'thakur kumar';

