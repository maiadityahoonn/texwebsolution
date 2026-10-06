const fs = require('fs');

const loginCode = fs.readFileSync('src/app/login/page.js', 'utf8');

// Find all unique activeSections
const regex = /activeSection === ['"]([a-zA-Z0-9_]+)['"]/g;
const sections = new Set();
let match;
while ((match = regex.exec(loginCode)) !== null) {
  sections.add(match[1]);
}
console.log('--- UNIQUE ACTIVE SECTIONS IN LOGIN/PAGE.JS ---');
console.log(Array.from(sections));

// Find sidebar navigation menus
const navRegex = /selectSection\(['"]([a-zA-Z0-9_]+)['"]\)/g;
const navItems = new Set();
while ((match = navRegex.exec(loginCode)) !== null) {
  navItems.add(match[1]);
}
console.log('\n--- NAV SECTIONS REFERENCED IN LOGIN/PAGE.JS ---');
console.log(Array.from(navItems));

// Check roles in login/page.js
const roleRegex = /userProfile\?\.role === ['"]([a-zA-Z0-9_]+)['"]|profile\?\.role === ['"]([a-zA-Z0-9_]+)['"]/g;
const roles = new Set();
while ((match = roleRegex.exec(loginCode)) !== null) {
  roles.add(match[1] || match[2]);
}
console.log('\n--- ROLES REFERENCED IN LOGIN/PAGE.JS ---');
console.log(Array.from(roles));
