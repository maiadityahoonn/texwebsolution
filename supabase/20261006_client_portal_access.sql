-- 20261006_client_portal_access.sql
-- Public client portal access for project, billing, SMM, and support visibility.
-- Apply only after DB backup. Tokens are opaque and revocable by replacing/clearing portal_token.

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_token TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_last_opened_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_portal_token
  ON public.clients(portal_token)
  WHERE portal_token IS NOT NULL;

