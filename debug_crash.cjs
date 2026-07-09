const fs = require('fs');
const content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// Find all API endpoint calls
const patterns = [
  /["']\/api\/[^"']{0,80}/g,
  /wss?:\/\/[^"']{0,80}/g,
  /new WebSocket/g,
  /supabase/gi,
  /\.env\./g,
  /VITE_/g,
];

for (const p of patterns) {
  const matches = [...content.matchAll(p)].slice(0, 5);
  if (matches.length > 0) {
    console.log('\nPattern:', p);
    matches.forEach(m => console.log('  at', m.index, ':', content.substring(m.index, m.index + 100)));
  }
}

// Find error boundaries and crashes
const errBoundaryIdx = content.indexOf('ErrorBoundary');
if (errBoundaryIdx !== -1) {
  console.log('\nErrorBoundary at:', errBoundaryIdx, content.substring(errBoundaryIdx, errBoundaryIdx + 100));
} else {
  console.log('\nNo ErrorBoundary found - app has NO crash protection!');
}

// Find where the app tries to call backend on mount
const queryClient = content.indexOf('QueryClient');
console.log('\nQueryClient found:', queryClient !== -1);

// Find any throw statements near component roots
const throwMatches = [...content.matchAll(/throw new Error/g)].slice(0, 5);
throwMatches.forEach(m => console.log('throw at', m.index, ':', content.substring(m.index, m.index + 80)));
