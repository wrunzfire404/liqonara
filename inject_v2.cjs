const fs = require('fs');

let content = fs.readFileSync('assets/index-C7MvgsdZ.js', 'utf8');

// Remove any old interceptor
content = content.replace(/^\(function\(\)\{.*?\}\)\(\);\n/s, '');

// Smart interceptor with correct response shapes
const interceptor = `(function(){
  var _f=window.fetch;
  window.fetch=function(url,opts){
    var u=typeof url==='string'?url:(url&&url.url)||'';
    if(u.startsWith('/api/')||u.includes('/api/')){
      console.warn('[liqonara] intercepted:',u);
      var body=null, status=200;
      // /api/token/liq -> {buybacks:{liqBought,solSpent,usd}, price, marketCap, supply}
      if(u.includes('/api/token/liq')) body={price:0,marketCap:0,supply:0,buybacks:{liqBought:0,solSpent:0,usd:0}};
      // /api/metrics -> {tvl,volume24h,tokens,fees}
      else if(u.includes('/api/metrics')) body={tvl:0,volume24h:0,tokens:0,fees:0,buybacks:{liqBought:0,solSpent:0,usd:0}};
      // /api/protocol/fee-config
      else if(u.includes('/api/protocol/fee-config')) body={protocolFeeBps:500,creatorFeeBps:500};
      // /api/tokens -> array
      else if(u.includes('/api/tokens')&&!u.includes('adopt')) body=[];
      // /api/public/coins -> {items, total}
      else if(u.includes('/api/public/coins')) body={items:[],total:0};
      // /api/public/stats
      else if(u.includes('/api/public/stats')) body={totalTokens:0,totalVolume:0,totalFees:0};
      // /api/public/activity
      else if(u.includes('/api/public/activity')) body={items:[]};
      // /api/sol-price
      else if(u.includes('/api/sol-price')) body={price:0};
      // /api/notifications
      else if(u.includes('/api/notifications')&&!u.includes('read')) body={items:[],unread:0};
      // /api/settings
      else if(u.includes('/api/settings')) body={};
      // /api/apikeys
      else if(u.includes('/api/apikeys')) body=[];
      // /api/strategies
      else if(u.includes('/api/strategies')) body=[];
      // /api/executions
      else if(u.includes('/api/executions')) body=[];
      // /api/recommendations
      else if(u.includes('/api/recommendations')) body=[];
      // /api/vault/transactions
      else if(u.includes('/api/vault/transactions')) body={items:[],total:0};
      // /api/vault
      else if(u.includes('/api/vault')) body=null, status=404;
      // /api/liquidity/status
      else if(u.includes('/api/liquidity/status')) body={status:'idle'};
      // /api/liquidity/deployments
      else if(u.includes('/api/liquidity/deployments')) body=[];
      // /api/engine/status
      else if(u.includes('/api/engine/status')) body={running:false};
      // /api/chain/platforms
      else if(u.includes('/api/chain/platforms')) body=[];
      // /api/simulations
      else if(u.includes('/api/simulations')) body=[];
      // fallback
      else body=null, status=404;
      
      return Promise.resolve(new Response(JSON.stringify(body),{
        status:status,
        headers:{'Content-Type':'application/json'}
      }));
    }
    return _f?_f.apply(this,arguments):Promise.reject(new Error('no fetch'));
  };
  
  // Block local WebSocket
  var _WS=window.WebSocket;
  window.WebSocket=function(url,proto){
    if(typeof url==='string'&&(url.includes('localhost')||url.includes('/api/'))){
      console.warn('[liqonara] blocked WS:',url);
      var fake={readyState:3,close:function(){},send:function(){},addEventListener:function(){},removeEventListener:function(){}};
      return fake;
    }
    return new _WS(url,proto);
  };
  window.WebSocket.CONNECTING=0;window.WebSocket.OPEN=1;window.WebSocket.CLOSING=2;window.WebSocket.CLOSED=3;
})();`;

content = interceptor + '\n' + content;
fs.writeFileSync('assets/index-C7MvgsdZ.js', content);
console.log('Done. Size:', content.length);
