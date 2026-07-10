// Diagnose exactly what each API endpoint expects
const fs = require('fs');
const content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// Find all API endpoints
const endpoints = new Map();
const matches = [...content.matchAll(/"(\/api\/[^"]+)"/g)];
matches.forEach(m => {
  if (!endpoints.has(m[1])) endpoints.set(m[1], m.index);
});

console.log('All unique API endpoints:');
for (const [ep, idx] of endpoints) {
  // Look for what the response is destructured into - look 200 chars after endpoint
  const context = content.substring(idx + ep.length, idx + ep.length + 300);
  console.log(`\n  ${ep}`);
  // Look for destructuring pattern
  const destr = context.match(/\{([^}]{0,100})\}/);
  if (destr) console.log(`    response shape hint: ${destr[0]}`);
}
