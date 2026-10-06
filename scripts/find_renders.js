const fs = require('fs');
const content = fs.readFileSync('src/app/login/page.js', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

for (let i = 7000; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{activeSection ===') || line.includes('{activeSection ==')) {
    console.log((i + 1) + ': ' + line.trim());
  }
}
