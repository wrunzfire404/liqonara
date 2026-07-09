with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('href="/assets/', 'href="./assets/')
html = html.replace('src="/assets/', 'src="./assets/')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
