const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync('supabase/schema.sql', 'utf8');

// Find all CREATE TABLE statements in supabase/schema.sql
const tableMatches = schema.match(/CREATE TABLE IF NOT EXISTS public\.([a-zA-Z0-9_]+)/g) || [];
const tables = tableMatches.map(m => m.replace('CREATE TABLE IF NOT EXISTS public.', ''));
console.log('--- SUPABASE SCHEMA TABLES (' + tables.length + ') ---');
console.log(tables);

// Check roles in schema.sql
const rolesInSchema = schema.match(/role IN \(([^)]+)\)/g) || [];
console.log('\n--- ROLES IN SCHEMA.SQL ---');
console.log(rolesInSchema);

// Check domains in schema.sql
const domainsInSchema = schema.match(/domain IN \(([^)]+)\)/g) || [];
console.log('\n--- DOMAINS IN SCHEMA.SQL ---');
console.log(domainsInSchema);

// Inspect sw.js and manifest.js
const sw = fs.existsSync('public/sw.js') ? fs.readFileSync('public/sw.js', 'utf8') : '';
console.log('\n--- SW.JS STATS ---');
console.log('sw.js lines:', sw.split('\n').length);
console.log('sw.js push notification listeners:', sw.includes('push'), sw.includes('notificationclick'));

// Check PWA manifest
const manifest = fs.existsSync('src/app/manifest.js') ? fs.readFileSync('src/app/manifest.js', 'utf8') : '';
console.log('\n--- MANIFEST.JS ---');
console.log(manifest.slice(0, 300));
