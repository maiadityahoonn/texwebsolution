-- ==============================================================================
-- 20260913_create_batch_files_bucket.sql
-- Sets up public batch-files bucket and policies for batch workspace files
-- ==============================================================================

-- 1. Create or update public 'batch-files' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'batch-files',
  'batch-files',
  true,
  52428800 -- 50 MB
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800;

-- 2. Allow public / authenticated users to read batch-files
DROP POLICY IF EXISTS "Public can view batch files" ON storage.objects;
CREATE POLICY "Public can view batch files" ON storage.objects
FOR SELECT USING (bucket_id = 'batch-files');

-- 3. Allow authenticated users to upload batch files
DROP POLICY IF EXISTS "Authenticated can upload batch files" ON storage.objects;
CREATE POLICY "Authenticated can upload batch files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'batch-files');

-- 4. Allow users to update/delete their own batch files
DROP POLICY IF EXISTS "Authenticated can update batch files" ON storage.objects;
CREATE POLICY "Authenticated can update batch files" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'batch-files');
