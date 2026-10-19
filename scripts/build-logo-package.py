import subprocess
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_DIR = os.path.join(ROOT, "design/logo")
PUBLIC_DIR = os.path.join(ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")

print("1. Refreshing master SVGs via Node...")
subprocess.run(["node", "scripts/generate-master-assets.js"], cwd=ROOT, check=True)

print("2. Exporting variants and web icons...")
export_script = "/Users/dandisetiyawan/.gemini/config/plugins/logo-design-skill/skills/logo-design/scripts/export_variants.py"
master_symbol = os.path.join(LOGO_DIR, "emasku-symbol.svg")
favicon_source = os.path.join(LOGO_DIR, "emasku-favicon-source.svg")

cmd = [
    "python3", export_script,
    master_symbol,
    "--name", "emasku",
    "--favicon-source", favicon_source,
    "--web-icons",
    "--icon-bg", "#18181B",
    "--icon-fg", "keep",
    "--icon-scale", "0.72",
    "--mono", "#F59E0B",
    "--title", "emasKu — Portofolio Emas Fisik",
    "--out-dir", LOGO_DIR,
    "--png", "32", "64", "128", "192", "256", "512"
]
subprocess.run(cmd, cwd=ROOT, check=True)

print("3. Syncing web and PWA icons into public/...")
os.makedirs(ICONS_DIR, exist_ok=True)

# Copy web icons to public/
shutil.copy2(os.path.join(LOGO_DIR, "favicon.ico"), os.path.join(PUBLIC_DIR, "favicon.ico"))
shutil.copy2(os.path.join(LOGO_DIR, "favicon.svg"), os.path.join(PUBLIC_DIR, "favicon.svg"))
shutil.copy2(os.path.join(LOGO_DIR, "apple-touch-icon.png"), os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))

# Copy PWA icons to public/icons/
shutil.copy2(os.path.join(LOGO_DIR, "icon-192.png"), os.path.join(ICONS_DIR, "icon-192x192.png"))
shutil.copy2(os.path.join(LOGO_DIR, "icon-512.png"), os.path.join(ICONS_DIR, "icon-512x512.png"))
shutil.copy2(os.path.join(LOGO_DIR, "maskable-512.png"), os.path.join(ICONS_DIR, "maskable-512x512.png"))
shutil.copy2(os.path.join(LOGO_DIR, "emasku-symbol.svg"), os.path.join(ICONS_DIR, "icon.svg"))

print("4. Regenerating presentation board...")
board_script = "/Users/dandisetiyawan/.gemini/config/plugins/logo-design-skill/skills/logo-design/scripts/presentation_board.py"
spec_file = os.path.join(LOGO_DIR, "spec.json")
pres_out = os.path.join(LOGO_DIR, "presentation.html")
slides_dir = os.path.join(LOGO_DIR, "slides")

subprocess.run([
    "python3", board_script,
    spec_file,
    "-o", pres_out,
    "--png-dir", slides_dir
], cwd=ROOT, check=True)

print("5. Generating preview test sheet...")
preview_script = "/Users/dandisetiyawan/.gemini/config/plugins/logo-design-skill/skills/logo-design/scripts/preview_sheet.py"
subprocess.run([
    "python3", preview_script,
    master_symbol,
    os.path.join(LOGO_DIR, "emasku-avatar.svg"),
    "--name", "emasKu",
    "--brand-color", "#F59E0B",
    "-o", os.path.join(LOGO_DIR, "preview.html")
], cwd=ROOT, check=True)

print("All production assets generated successfully!")
