import re
content = open('assets/index-C7MvgsdZ.js', encoding='utf-8').read()

# Fix 1: e.twitter?`https://x.com/liqonara"")}`:""
content = content.replace('e.twitter?`https://x.com/liqonara"")}`:""', 'e.twitter?`https://x.com/liqonara`:""')

# Fix 2: {href:`https://x.com/liqonara"").replace(/^https?:\/\/(x|twitter)\.com\//,"")}`
content = content.replace('{href:`https://x.com/liqonara"").replace(/^https?:\\/\\/(x|twitter)\\.com\\//,"")}`', '{href:`https://x.com/liqonara`}')

open('assets/index-C7MvgsdZ.js', 'w', encoding='utf-8').write(content)
