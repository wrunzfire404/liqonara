const fs = require('fs');
let content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// =============================================
// FIX 1: Make xTe() return null - this disables the /api/ws websocket
// Original: function xTe(){return`${...}://${...}/api/ws`}
// Replace with: function xTe(){return null}
// =============================================
content = content.replace(
  /function xTe\(\)\{return`\$\{window\.location\.protocol[^`]+`\}/,
  'function xTe(){return null}'
);

// =============================================
// FIX 2: Guard the new WebSocket(xTe()) call so it doesn't crash when null
// Original: new WebSocket(xTe());yE=e,e.onopen=()=>Cq(!0)
// =============================================
content = content.replace(
  'new WebSocket(xTe());yE=e,e.onopen',
  'if(xTe()){new WebSocket(xTe());yE=e,e.onopen'
);
// We need to close the if block - find a natural end point
// After the socket setup block, there's typically a return or a }
// Let's find what comes after e.onerror and add closing brace
const wsIdx = content.indexOf('if(xTe()){new WebSocket(xTe());yE=e,e.onopen');
if (wsIdx !== -1) {
  // Find onerror assignment and close after it
  const errorIdx = content.indexOf('e.onerror=', wsIdx);
  if (errorIdx !== -1) {
    const semicolonIdx = content.indexOf(';', errorIdx + 10);
    if (semicolonIdx !== -1) {
      content = content.substring(0, semicolonIdx + 1) + '}' + content.substring(semicolonIdx + 1);
      console.log('Added closing brace after e.onerror');
    }
  }
}

// =============================================
// FIX 3: Disable the ws://localhost:8080 autoconnect (already done in previous patch)
// =============================================
// Verify it was changed
if (content.includes('autoconnect:n=!1')) {
  console.log('autoconnect already disabled');
} else {
  content = content.replace(
    'ws://localhost:8080",{autoconnect:n=!0',
    'ws://localhost:8080",{autoconnect:n=!1'
  );
  console.log('Disabled autoconnect for localhost:8080');
}

// =============================================
// FIX 4: Make all /api/ fetches fail gracefully instead of crashing React
// Wrap the main fetch function that calls /api/... to return mock empty data
// =============================================
// The main API base function pattern: Pt(TEe(), ...) where TEe() returns "/api/tokens"
// Find the Pt function (api caller)
const ptIdx = content.indexOf('async function Pt(');
if (ptIdx === -1) {
  // Try arrow form
  const ptAlt = content.indexOf('Pt=async(');
  console.log('Pt function at:', ptAlt);
}

// Easier approach: inject a fetch interceptor at the top of the file
// that returns empty responses for /api/ calls
const interceptor = `
(function() {
  const _origFetch = window.fetch;
  window.fetch = function(url, opts) {
    if (typeof url === 'string' && url.includes('/api/')) {
      console.warn('[liqonara] Intercepted API call to:', url, '- returning empty response');
      return Promise.resolve(new Response(JSON.stringify({data: [], items: [], tokens: [], total: 0}), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
      }));
    }
    return _origFetch.apply(this, arguments);
  };
})();
`;

// Inject at the very start of the JS
content = interceptor + content;

fs.writeFileSync('assets/index-C7MvgsdZ.js', content);
console.log('Done! All patches applied.');
