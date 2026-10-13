-- 20261014_profiles_sales_head_role_constraint.sql
-- Allow current CRM business roles in profiles.role, then normalize Priyank Patel.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (
    role IN (
      'super_admin',
      'hr',
      'hr_head',
      'team_leader',
      'mentor',
      'intern',
      'sales_head',
      'sales_executive',
      'telecaller',
      'tech_lead',
      'pm',
      'smm_head',
      'finance_head',
      'support_head'
    )
  );

UPDATE public.profiles
SET
  role = 'sales_head',
  department = 'sales',
  domain = 'sales',
  designation = 'Sales Head',
  status = 'active',
  updated_at = NOW()
WHERE id = 'accdb4bc-c806-405f-95cd-721b78804d77'
   OR lower(email) = 'priyank@texwebsolution.in'
   OR lower(full_name) = 'priyank patel';
