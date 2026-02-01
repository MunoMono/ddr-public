import json

with open('/tmp/rca-test.json', 'r') as f:
    data = json.load(f)

item = data['data']['all_media_items']['attached_media'][0]
pdfs = item['pdf_files']
jpgs = item['jpg_derivatives']

print(f"Total PDFs: {len(pdfs)}")
print(f"Total JPG thumbs: {len(jpgs)}\n")

# Check first 3 matches
for i, pdf in enumerate(pdfs[:3]):
    pdf_filename = pdf['filename']
    pdf_base = pdf_filename.split('__')[0]
    
    print(f"PDF {i+1}: {pdf_filename}")
    print(f"  Base: {pdf_base}")
    
    # Find matching thumbnail
    matched = False
    for jpg in jpgs:
        if jpg['role'] != 'jpg_thumb':
            continue
        jpg_filename = jpg['filename']
        jpg_base = jpg_filename.split('__')[0]
        
        if jpg_filename.startswith(pdf_base):
            print(f"  ✅ Matched thumb: {jpg_filename}")
            matched = True
            break
    
    if not matched:
        print(f"  ❌ No matching thumbnail found!")
    print()
