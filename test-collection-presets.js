/**
 * Test collection presets to verify JPG/PDF content
 */

const GRAPHQL_ENDPOINT = 'https://api.ddrarchive.org/graphql';

const PRESETS = [
  {
    id: 'kennethAgnewCollection',
    label: 'Kenneth Agnew collection',
    query: `{
  all_media_items: record_v1(id: "451248821104") {
    attached_media {
      id
      pid
      title
      jpg_derivatives {
        role
        filename
      }
      pdf_files {
        filename
      }
    }
  }
}`
  },
  {
    id: 'bruceArcherCollection',
    label: 'Bruce Archer collection',
    query: `{
  all_media_items: record_v1(id: "873981573030") {
    attached_media {
      id
      pid
      title
      jpg_derivatives {
        role
        filename
      }
      pdf_files {
        filename
      }
    }
  }
}`
  },
  {
    id: 'rcaProspectuses',
    label: 'RCA Prospectuses | 1965-85',
    query: `{
  all_media_items: record_v1(id: "125") {
    attached_media {
      id
      pid
      title
      jpg_derivatives {
        role
        filename
      }
      pdf_files {
        filename
      }
    }
  }
}`
  }
];

async function testPreset(preset) {
  console.log(`\nTesting: ${preset.label} (${preset.id})`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: preset.query })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return;
    }
    
    const items = result.data.all_media_items.attached_media;
    console.log(`Found ${items.length} media items`);
    
    let totalJpgDisplay = 0;
    let totalJpgThumb = 0;
    let totalPdfs = 0;
    let itemsWithDisplayJpgs = 0;
    
    items.forEach((item) => {
      const displayJpgs = item.jpg_derivatives?.filter(j => j.role === 'jpg_display') || [];
      const thumbJpgs = item.jpg_derivatives?.filter(j => j.role === 'jpg_thumb') || [];
      const pdfCount = item.pdf_files?.length || 0;
      
      totalJpgDisplay += displayJpgs.length;
      totalJpgThumb += thumbJpgs.length;
      totalPdfs += pdfCount;
      
      if (displayJpgs.length > 0) itemsWithDisplayJpgs++;
    });
    
    console.log(`\nAsset Summary:`);
    console.log(`  JPG Display images: ${totalJpgDisplay}`);
    console.log(`  JPG Thumbnails: ${totalJpgThumb}`);
    console.log(`  PDF Files: ${totalPdfs}`);
    console.log(`  Items with display JPGs: ${itemsWithDisplayJpgs}`);
    
    // Determine what should be shown
    if (totalJpgDisplay > 0 && totalPdfs === 0) {
      console.log(`\n✅ Show: JPG images only`);
    } else if (totalPdfs > 0 && totalJpgDisplay === 0) {
      console.log(`\n✅ Show: PDF files only (using jpg_thumb for thumbnails)`);
    } else if (totalPdfs > 0 && totalJpgDisplay > 0) {
      console.log(`\n⚠️  Has both JPG display images AND PDFs`);
      console.log(`   Current behavior: Shows both JPGs and PDFs`);
      console.log(`   Should we show PDFs only for this collection?`);
    } else {
      console.log(`\n⚠️  No display images or PDFs found`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testAll() {
  for (const preset of PRESETS) {
    await testPreset(preset);
  }
}

testAll();
