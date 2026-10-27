# creates a manifest for event pages because github pages doesn't see file directory
import json
from pathlib import Path

ROOT = Path("assets/photos/event_gallery")
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

for folder in ROOT.iterdir():
    if not folder.is_dir():
        continue

    manifest = folder / "manifest.json"

    # find all images currently in the folder
    actual_images = {
        p.name for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in EXTENSIONS
    }

    # load existing manifest if available
    if manifest.exists():
        with manifest.open("r", encoding="utf-8") as f:
            existing = json.load(f)
    else:
        existing = []

    # keep existing images in their original order
    images = [
        name for name in existing
        if name in actual_images
    ]


    new_images = sorted(actual_images - set(images), key=str.lower)
    images.extend(new_images)

    # place header images first
    images.sort(key=lambda name: not name.lower().startswith("header."))

    # update manifest only if content changed
    if images != existing or not manifest.exists():
        manifest.write_text(
            json.dumps(images, indent=2) + "\n",
            encoding="utf-8"
        )
        print(f"Updated {folder.name}: +{len(new_images)} new images")
    else:
        print(f"Unchanged {folder.name}: {len(images)} images")
