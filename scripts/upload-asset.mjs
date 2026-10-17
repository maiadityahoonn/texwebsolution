import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local
const envFile = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf-8');
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
Usage:
  node scripts/upload-asset.mjs <local_file_path> <supabase_dest_path>

Examples:
  node scripts/upload-asset.mjs ./new_mockup.jpg customized/new_app.jpg
  node scripts/upload-asset.mjs ./banner.png common/banner.png
`);
  process.exit(0);
}

const [localPath, destPath] = args;
const resolvedLocalPath = path.resolve(process.cwd(), localPath);

if (!fs.existsSync(resolvedLocalPath)) {
  console.error(`Error: Local file not found: ${resolvedLocalPath}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(resolvedLocalPath);
const cleanDestPath = destPath.replace(/^\/+/, '');

// Guess MIME type
const ext = path.extname(cleanDestPath).toLowerCase();
const mimeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};
const contentType = mimeMap[ext] || 'application/octet-stream';

console.log(`Uploading ${localPath} (${(fileBuffer.length / 1024).toFixed(1)} KB) to 'site-assets/${cleanDestPath}'...`);

const { data, error } = await supabase.storage
  .from('site-assets')
  .upload(cleanDestPath, fileBuffer, {
    contentType,
    upsert: true,
  });

if (error) {
  console.error('Upload failed:', error.message);
  process.exit(1);
}

const publicUrl = `${supabaseUrl}/storage/v1/object/public/site-assets/${cleanDestPath}`;
console.log('\n✅ Upload successful!');
console.log(`Direct Supabase CDN URL:\n  ${publicUrl}\n`);
