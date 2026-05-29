import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html_files = list(root.rglob('*.html'))

replacements = [
    (re.compile(r' style="box-sizing: border-box"'), ''),
    (re.compile(r'<hr[^>]*style="[^"]*height:\s*\d+px;\s*background-color:\s*#[0-9a-fA-F]+;?"[^>]*>'), '<hr class="section-rule" />'),
    (re.compile(r'<div style="margin-top: 40px; padding: 20px; background: rgba\(255,\s*255,\s*255,\s*0\.9\); border-radius: 15px; text-align: center;">'), '<div class="info-panel">'),
    (re.compile(r'class="back-button"\s*style="margin-top: 15px;"'), 'class="back-button"'),
    (re.compile(r'style="margin-top:\s*15px;"'), ''),
    (re.compile(r'style="margin-top:\s*10px; font-size: 0\.9rem;"'), ''),
    (re.compile(r'style="display:\s*inline-block;.*?"'), ''),
]

# Additional semantic replacements: convert inline index links and brown clear buttons to classes
extra_replacements = [
    (re.compile(r'href="\.\./index.html"\s+style="[^"]*"'), 'href="../index.html" class="back-button"'),
    (re.compile(r'style="background-color:\s*brown;\s*width:\s*auto;"'), 'class="btn btn-danger"'),
    (re.compile(r'style="background-color:\s*brown;"'), 'class="btn btn-danger"'),
    (re.compile(r'style="display:\s*block; width:\s*200px; margin:\s*0 auto; background-color:\s*#[0-9a-fA-F]+; border-radius:\s*5px; text-align:\s*center;"'), 'class="back-button"'),
]

# safer heuristics for common heading, image, embed, and alignment inline-styles
extra_replacements += [
    (re.compile(r'style="margin-top:\s*50px;"'), 'class="section-title"'),
    (re.compile(r'style="text-align:\s*center;\s*margin-top:\s*20px;"'), 'class="center-top"'),
    (re.compile(r'style="width:\s*25px;"'), 'class="img-25"'),
    (re.compile(r'style="max-width:\s*100px;\s*height:\s*auto;"'), 'class="img-qr"'),
    (re.compile(r'style="width:\s*100%;\s*height:\s*100%;\s*justify-self:\s*center"'), 'class="embed-responsive"'),
    (re.compile(r'style="font-weight:\s*bolder;"'), 'class="strong-message"'),
    (re.compile(r'style="display:\s*flex;\s*justify-content:\s*center;\s*align-items:\s*center;"'), 'class="center-flex"'),
]

changed = 0
for f in html_files:
    text = f.read_text(encoding='utf-8')
    orig = text
    for pattern, repl in replacements:
        text = pattern.sub(repl, text)
    for pattern, repl in extra_replacements:
        text = pattern.sub(repl, text)
    if text != orig:
        f.write_text(text, encoding='utf-8')
        changed += 1

print(f"Processed {len(html_files)} files, updated {changed} files.")
