"""
Re-download the original JS, apply safe targeted replacements, and save.
"""
import requests
import re

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})

# Step 1: Get original JS URL from the original site
res = session.get("https://liqora.app/")
html = res.text

# Find the JS file name
js_match = re.search(r'/assets/(index-[^"\']+\.js)', html)
css_match = re.search(r'/assets/(index-[^"\']+\.css)', html)

if not js_match:
    print("ERROR: Cannot find JS file in HTML")
    exit(1)

js_file = js_match.group(1)
css_file = css_match.group(1) if css_match else None
print(f"JS: {js_file}")
print(f"CSS: {css_file}")

# Step 2: Download original JS
js_url = f"https://liqora.app/assets/{js_file}"
js_content = session.get(js_url).text
print(f"Downloaded JS: {len(js_content)} chars")

# Step 3: Apply SAFE replacements
# 3a. Brand name replacements (just strings, no JS syntax involved)
js_content = js_content.replace("Liqora", "Liqonara")
js_content = js_content.replace("liqora", "liqonara")
js_content = js_content.replace("LIQORA", "LIQONARA")

# 3b. Contract address replacement
js_content = js_content.replace(
    "y1jzEuqzGGy58gYwoMsLTq8DfxHpehUqKgPiTCy9Liq",
    "coming soon on pump.fun"
)
# Also short form if it appears
js_content = re.sub(r'y1jz[A-Za-z0-9]{30,40}Liq', 'coming soon on pump.fun', js_content)

# 3c. Twitter URL - SAFE replacement that handles JS template literals
# Pattern: the value is always inside a string or template literal
# We do NOT use a regex that strips surrounding chars - just replace the URL value itself
# Replace plain string assignments: "https://twitter.com/liqora.app" or "https://x.com/liqora"
# These are now already renamed to "liqonara" by step 3a above, so we just need:
# Replace any x.com/liqonara that's NOT already correct (i.e. not already /liqonara)
# Actually after step 3a, all "liqora" -> "liqonara", so x.com/liqonara should be correct.
# But the ORIGINAL had dynamic twitter URL building from user data - we leave those alone.
# We only change the hardcoded static Twitter link in the navbar/footer:
js_content = js_content.replace('"https://x.com/liqonara"', '"https://x.com/liqonara"')  # already fine after rename

# Save
out_path = f"assets/{js_file}"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Saved: {out_path}")

# Step 4: Download original CSS
if css_file:
    css_url = f"https://liqora.app/assets/{css_file}"
    css_content = session.get(css_url).text
    css_content = css_content.replace("Liqora", "Liqonara")
    css_content = css_content.replace("liqora", "liqonara")
    with open(f"assets/{css_file}", "w", encoding="utf-8") as f:
        f.write(css_content)
    print(f"Saved CSS: assets/{css_file}")

# Step 5: Also fix index.html to use original JS/CSS filenames
html_content = open("index.html", encoding="utf-8").read()
# Update script src to point to original filename (might have changed)
html_content = re.sub(
    r'src="./assets/index-[^"]+\.js"',
    f'src="./assets/{js_file}"',
    html_content
)
html_content = re.sub(
    r'href="./assets/index-[^"]+\.css"',
    f'href="./assets/{css_file}"' if css_file else '',
    html_content
)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)
print("Updated index.html")

print("\nDone! Now verify with: node -c assets/" + js_file)
