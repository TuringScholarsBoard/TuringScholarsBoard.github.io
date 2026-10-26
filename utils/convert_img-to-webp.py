from PIL import Image
from pathlib import Path

# use the / in front of directories which you are trying to access from the project home
# otherwise, this script will try to locate a folder from the relative directory
# may throw a filenotfounderror
# just try to add or remove a / in front of the string
input_path = "assets/photos/event_gallery/jane_street/"
output_path = "assets/photos/event_gallery/jane_street/webp/"


input_folder = Path(input_path)
output_folder = Path(output_path)

# fallback incase the folder doesn't exist
output_folder.mkdir(parents=True, exist_ok=True)

for file in input_folder.iterdir():
    if file.suffix.lower() in (".png", ".jpg", ".jpeg"):
        output_file = output_folder / (file.stem + ".webp")

        # skip if already converted so we can add more photos
        # without deleting the entire subdirectory to remake
        if output_file.exists():
            print(f"Skipped: {file.name}")
            continue

        with Image.open(file) as img:
            img.save(output_file, "WEBP", quality=85)

        print(f"Converted: {file.name}")