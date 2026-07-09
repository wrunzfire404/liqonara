const fs = require('fs');
let content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// The problem: original code is:
// const e=new WebSocket(xTe());yE=e,...
// We need to replace the WHOLE block, not just wrap it

// Find the full WS init block
const marker = 'function TZ(){if(yE||typeof window>"u")return;const e=new WebSocket(xTe())';
const markerIdx = content.indexOf(marker);
if (markerIdx !== -1) {
  // Find where this function ends (next top-level function)
  let depth = 0;
  let start = markerIdx + 'function TZ(){'.length;
  let i = markerIdx;
  let funcEnd = -1;
  while (i < content.length) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        funcEnd = i;
        break;
      }
    }
    i++;
  }
  if (funcEnd !== -1) {
    const fullFunc = content.substring(markerIdx, funcEnd + 1);
    console.log('Full TZ function:', fullFunc.substring(0, 300));
    
    // Replace the entire function body to be a no-op (disable the WebSocket init)
    const replacement = 'function TZ(){/* WebSocket disabled - static deployment */}';
    content = content.substring(0, markerIdx) + replacement + content.substring(funcEnd + 1);
    console.log('Replaced TZ() function with no-op');
  }
} else {
  console.log('TZ marker not found, trying alternate...');
  // Maybe the function was already patched, look for the patched version
  const altMarker = 'function TZ(){if(yE||typeof window>"u")return;const e=if(xTe())';
  const altIdx = content.indexOf(altMarker);
  if (altIdx !== -1) {
    let depth = 0;
    let i = altIdx;
    let funcEnd = -1;
    while (i < content.length) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') {
        depth--;
        if (depth === 0) { funcEnd = i; break; }
      }
      i++;
    }
    if (funcEnd !== -1) {
      const replacement = 'function TZ(){/* WebSocket disabled - static deployment */}';
      content = content.substring(0, altIdx) + replacement + content.substring(funcEnd + 1);
      console.log('Replaced patched TZ() function with no-op');
    }
  }
}

// Verify xTe is disabled
if (content.includes('function xTe(){return null}')) {
  console.log('xTe already disabled');
} else {
  content = content.replace(
    /function xTe\(\)\{return`\$\{window\.location\.protocol[^`]+`\}/,
    'function xTe(){return null}'
  );
  console.log('Disabled xTe()');
}

// Disable localhost:8080 websocket autoconnect
if (content.includes('autoconnect:n=!1')) {
  console.log('localhost:8080 WS already disabled');
} else {
  content = content.replace(
    'ws://localhost:8080",{autoconnect:n=!0',
    'ws://localhost:8080",{autoconnect:n=!1'
  );
  console.log('Disabled localhost:8080 WS');
}

// Add fetch interceptor at the top (only if not already there)
if (!content.includes('Intercepted API call')) {
  const interceptor = `(function(){const _f=window.fetch;window.fetch=function(u,o){if(typeof u==="string"&&u.startsWith("/api/")){console.warn("[liqonara] blocked API call:",u);return Promise.resolve(new Response(JSON.stringify({data:[],items:[],tokens:[],total:0,tokenId:null}),{status:200,headers:{"Content-Type":"application/json"}}));}return _f?_f.apply(this,arguments):Promise.reject(new Error("fetch unavailable"));};})();`;
  content = interceptor + content;
  console.log('Added fetch interceptor');
}

fs.writeFileSync('assets/index-C7MvgsdZ.js', content);
console.log('Saved!');
