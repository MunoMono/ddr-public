#!/bin/bash

# Test RCA Prospectuses preset via curl

curl -s -X POST https://api.ddrarchive.org/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ all_media_items: record_v1(id: \"125\") { attached_media { id pid title jpg_derivatives { role filename } pdf_files { filename } } } }"
  }' | python3 << 'EOF'
import sys, json

data = json.load(sys.stdin)
items = data['data']['all_media_items']['attached_media']
print(f"Found {len(items)} media items in RCA Prospectuses\n")

total_jpg_display = 0
total_jpg_thumb = 0
total_pdfs = 0

# Show first 5 items in detail
for i, item in enumerate(items[:5]):
    jpgs = item.get('jpg_derivatives', [])
    pdfs = item.get('pdf_files', [])
    
    display_jpgs = [j for j in jpgs if j['role'] == 'jpg_display']
    thumb_jpgs = [j for j in jpgs if j['role'] == 'jpg_thumb']
    
    print(f"Item {i+1}: {item.get('title') or item['pid']}")
    print(f"  jpg_display: {len(display_jpgs)}")
    print(f"  jpg_thumb: {len(thumb_jpgs)}")
    print(f"  PDFs: {len(pdfs)}")
    if pdfs:
        for pdf in pdfs[:2]:
            print(f"    - {pdf['filename']}")
    print()

# Count all items
for item in items:
    jpgs = item.get('jpg_derivatives', [])
    pdfs = item.get('pdf_files', [])
    total_jpg_display += len([j for j in jpgs if j['role'] == 'jpg_display'])
    total_jpg_thumb += len([j for j in jpgs if j['role'] == 'jpg_thumb'])
    total_pdfs += len(pdfs)

print("=== TOTALS ===")
print(f"Total items: {len(items)}")
print(f"jpg_display images: {total_jpg_display}")
print(f"jpg_thumb images: {total_jpg_thumb}")
print(f"PDF files: {total_pdfs}")
print()
if total_jpg_display > 0:
    print("⚠️  WARNING: jpg_display images found - these should NOT be shown")
else:
    print("✅ No jpg_display images - only PDFs with thumbnails")
EOF
