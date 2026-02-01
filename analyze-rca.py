import json

with open('/tmp/rca-test.json', 'r') as f:
    data = json.load(f)

items = data['data']['all_media_items']['attached_media']
print(f"Found {len(items)} media items in RCA Prospectuses\n")

total_jpg_display = 0
total_jpg_thumb = 0
total_pdfs = 0

# Check first item in detail
item = items[0]
jpgs = item.get('jpg_derivatives', [])
pdfs = item.get('pdf_files', [])

display_jpgs = [j for j in jpgs if j.get('role') == 'jpg_display']
thumb_jpgs = [j for j in jpgs if j.get('role') == 'jpg_thumb']

print(f"Item 1: {item.get('title') or item['pid']}")
print(f"  jpg_display: {len(display_jpgs)}")
print(f"  jpg_thumb: {len(thumb_jpgs)}")
print(f"  PDFs: {len(pdfs)}")
print()

# Count all items
for item in items:
    jpgs = item.get('jpg_derivatives', [])
    pdfs = item.get('pdf_files', [])
    total_jpg_display += len([j for j in jpgs if j.get('role') == 'jpg_display'])
    total_jpg_thumb += len([j for j in jpgs if j.get('role') == 'jpg_thumb'])
    total_pdfs += len(pdfs)

print("=== TOTALS ===")
print(f"Total items: {len(items)}")
print(f"jpg_display images: {total_jpg_display}")
print(f"jpg_thumb images: {total_jpg_thumb}")
print(f"PDF files: {total_pdfs}")
print()
if total_jpg_display > 0:
    print("⚠️  WARNING: jpg_display images found - these WILL be shown as separate images")
    print("   Our fix will SKIP these for rcaProspectuses preset")
else:
    print("✅ No jpg_display images found!")
    print("   Only jpg_thumb (for PDF thumbnails) and PDF files")
    print("   Our fix will skip jpg processing and only show PDFs")
