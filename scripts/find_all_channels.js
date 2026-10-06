const fs = require('fs');
const content = fs.readFileSync('src/app/login/page.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('supabase.channel(')) {
    console.log((i + 1) + ': ' + lines[i].trim());
  }
}
