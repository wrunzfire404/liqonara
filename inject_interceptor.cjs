// The real fix: inject a smarter fetch interceptor that returns
// appropriate mock data per endpoint so the app doesn't crash

const fs = require('fs');

// Re-download clean JS first (fix_clean.py already handles name replacements)
// This script just adds the smarter interceptor

let content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// Remove old interceptor if present
content = content.replace(/^\(function\(\)\{const _f=window\.fetch;.*?\}\);\(\);\n?/, '');
content = content.replace(/^\(function\(\)\{const _origFetch.*?\}\)\(\);\n?/, '');

// Build smart interceptor
const interceptor = `
(function() {
  var _origFetch = window.fetch;
  window.fetch = function(url, opts) {
    if (typeof url === 'string' && (url.startsWith('/api/') || url.includes('/api/'))) {
      console.warn('[liqonara] intercepted:', url);
      var body;
      if (url.includes('/api/tokens') && !url.includes('adopt')) body = [];
      else if (url.includes('/api/public/coins')) body = {items:[], total:0};
      else if (url.includes('/api/public/stats')) body = {totalTokens:0, totalVolume:0, totalFees:0};
      else if (url.includes('/api/public/activity')) body = {items:[]};
      else if (url.includes('/api/protocol/fee-config')) body = {protocolFeeBps:500, creatorFeeBps:500};
      else if (url.includes('/api/metrics')) body = {tvl:0, volume24h:0, tokens:0, fees:0};
      else if (url.includes('/api/sol-price')) body = {price:0};
      else if (url.includes('/api/token/liq')) body = {price:0, marketCap:0, supply:0};
      else if (url.includes('/api/notifications')) body = {items:[], unread:0};
      else if (url.includes('/api/settings')) body = {};
      else if (url.includes('/api/apikeys')) body = [];
      else if (url.includes('/api/strategies')) body = [];
      else if (url.includes('/api/executions')) body = [];
      else if (url.includes('/api/recommendations')) body = [];
      else if (url.includes('/api/vault/transactions')) body = {items:[]};
      else if (url.includes('/api/vault')) body = null;
      else if (url.includes('/api/liquidity/status')) body = {status:'idle'};
      else if (url.includes('/api/liquidity/deployments')) body = [];
      else if (url.includes('/api/engine/status')) body = {running:false};
      else if (url.includes('/api/chain/platforms')) body = [];
      else if (url.includes('/api/simulations')) body = [];
      else body = null;
      
      return Promise.resolve(new Response(JSON.stringify(body), {
        status: url.includes('/api/vault') && body === null ? 404 : 200,
        headers: {'Content-Type': 'application/json'}
      }));
    }
    return _origFetch ? _origFetch.apply(this, arguments) : fetch.apply(window, arguments);
  };
  
  // Also suppress WebSocket errors
  var _OrigWS = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    if (typeof url === 'string' && (url.includes('localhost') || url.includes('/api/'))) {
      console.warn('[liqonara] blocked WebSocket to:', url);
      var fakeWs = {
        readyState: 3, // CLOSED
        close: function(){},
        send: function(){},
        addEventListener: function(){},
        removeEventListener: function(){}
      };
      return fakeWs;
    }
    return new _OrigWS(url, protocols);
  };
  window.WebSocket.CONNECTING = 0;
  window.WebSocket.OPEN = 1;
  window.WebSocket.CLOSING = 2;
  window.WebSocket.CLOSED = 3;
})();
`.trim();

content = interceptor + '\n' + content;

fs.writeFileSync('assets/index-C7MvgsdZ.js', content);
console.log('Smart interceptor injected. Length:', content.length);
