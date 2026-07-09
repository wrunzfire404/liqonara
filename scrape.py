import os
import requests
import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

url_base = "https://liqora.app/"
target_dir = r"c:\Tools\project crypto\liqonara"

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})

print("Downloading index.html...")
res = session.get(url_base)
res.raise_for_status()
html_content = res.text

# Find all assets in HTML (Vite format usually uses /assets/...)
assets = set(re.findall(r'(/assets/[a-zA-Z0-9_.-]+)', html_content))
images = set(re.findall(r'(/[^"\'<>]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp|\.gif|\.ico|\.mp4|\.webm))', html_content))
assets.update(images)

def process_content(file_content):
    if not isinstance(file_content, str):
        return file_content
    # Name replacements
    file_content = file_content.replace("Liqora", "Liqonara")
    file_content = file_content.replace("liqora", "liqonara")
    file_content = file_content.replace("LIQORA", "LIQONARA")
    
    # Twitter replacement
    file_content = re.sub(r'https://(?:www\.)?(?:twitter|x)\.com/[^\s"\'<>\\]+', 'https://x.com/liqonara', file_content)
    
    # CA replacement
    file_content = file_content.replace("y1jzEuqzGGy58gYwoMsLTq8DfxHpehUqKgPiTCy9Liq", "coming soon on pump.fun")
    # Truncated CA replacement if exists (sometimes UI shortens it like y1jz...Liq)
    # The user specifically mentioned the full CA, I will replace the full CA. 
    # Let's also replace a shortened version if it exists
    file_content = re.sub(r'y1jz[^\s"\'<>\\]*Liq', 'coming soon on pump.fun', file_content)
    file_content = file_content.replace("y1jz…Liq", "coming soon on pump.fun")
    
    # Lovable traces
    file_content = re.sub(r'lovable-badge[^"\'>]*', '', file_content, flags=re.IGNORECASE)
    file_content = re.sub(r'Made with Lovable', 'Made with ❤️', file_content, flags=re.IGNORECASE)
    
    return file_content

def download_and_process(path):
    local_path = path.split('?')[0].lstrip('/')
    file_url = urllib.parse.urljoin(url_base, path)
    r = session.get(file_url)
    
    if r.status_code == 200 and not r.text.startswith('<!DOCTYPE html>'):
        is_text = False
        if local_path.endswith(".js") or local_path.endswith(".css") or local_path.endswith(".svg"):
            is_text = True
        
        # for Vite, we put assets in public/assets (or directly in root/assets? Vercel Vite build expects static files in public/ if they are referenced by absolute paths, but if we just serve it static, we just mirror it)
        # Actually, if we're building with Vite, assets should go in `public/assets` or `public/` depending on how they are referenced.
        # But wait! If `index.html` references `/assets/xyz.js`, Vite `build` expects `index.html` to have relative or root-relative module scripts.
        # If we download the already built Vite assets, it's already a static site! We don't need to `vite build` it! We can just deploy it as static files without Vite!
        # But the user asked for `vite build` and `vercel.json` config!
        # If we use Vite to build a PRE-BUILT Vite site, we can just put everything in `public/` and `index.html` at the root, and Vite will just copy it.
        # Wait, last time for megabee we put it in `public/`.
        save_path = os.path.join(target_dir, "public", local_path)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        if is_text:
            try:
                content_str = r.text
                file_content = process_content(content_str)
                with open(save_path, "w", encoding="utf-8") as f:
                    f.write(file_content)
                
                # find more assets inside CSS/JS
                new_matches = set(re.findall(r'(/assets/[a-zA-Z0-9_.-]+)', file_content))
                new_images = set(re.findall(r'(/[^"\'<>]+(?:\.png|\.jpg|\.jpeg|\.svg|\.webp|\.gif|\.ico|\.mp4|\.webm))', file_content))
                return new_matches.union(new_images)
            except Exception:
                with open(save_path, "wb") as f:
                    f.write(r.content)
                return set()
        else:
            with open(save_path, "wb") as f:
                f.write(r.content)
            return set()
    return set()

print(f"Downloading {len(assets)} chunks...")
processed = set()
to_process = set(assets)

with ThreadPoolExecutor(max_workers=10) as executor:
    while to_process:
        batch = list(to_process - processed)
        to_process.clear()
        processed.update(batch)
        
        if not batch:
            break
            
        futures = [executor.submit(download_and_process, p) for p in batch]
        for future in futures:
            new_matches = future.result()
            to_process.update(new_matches - processed)

html_content = process_content(html_content)

with open(os.path.join(target_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("Full scrape completed!")
