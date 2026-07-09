import re
content = open('assets/index-C7MvgsdZ.js', encoding='utf-8').read()

matches = re.finditer(r'.{0,50}jsxs\("a",\{href:`https://x\.com/liqonara.{0,50}', content)
for m in matches:
    print(m.group(0))

matches = re.finditer(r'.{0,50}https://x\.com/liqonara.{0,50}', content)
for m in matches:
    print(m.group(0))
