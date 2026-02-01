/**
 * Test RCA Prospectuses preset to verify JPG/PDF content
 */

const GRAPHQL_ENDPOINT = 'https://api.ddrarchive.org/graphql';

const QUERY = `# RCA Prospectuses | 1965-85 (record ID: 125, PID: 880612075513)
{
  all_media_items: record_v1(id: "125") {
    attached_media {
      id
      pid
      title
      status
      caption
      parent_collection
      
      jpg_derivatives {
        role
        url
        signed_url
        filename
        label
        display_date
        normalized_date
        date_qualifier
        date_unknown
        copyright_holder
        rights_holders
      }
      
      pdf_files {
        role
        url
        signed_url
        filename
        label
        display_date
        normalized_date
        date_qualifier
        date_unknown
        copyright_holder
        rights_holders
      }
    }
  }
}`;

async function testRcaPreset() {
  console.log('Testing RCA Prospectuses preset...\n');
  
  const cleanQuery = QUERY
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n')
    .trim();
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: cleanQuery })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return;
    }
    
    const items = result.data.all_media_items.attached_media;
    console.log(`Found ${items.length} media items\n`);
    
    let totalJpgs = 0;
    let totalPdfs = 0;
    let jpgOnlyItems = 0;
    let pdfOnlyItems = 0;
    let bothItems = 0;
    
    items.forEach((item, idx) => {
      const jpgCount = item.jpg_derivatives?.length || 0;
      const pdfCount = item.pdf_files?.length || 0;
      
      totalJpgs += jpgCount;
      totalPdfs += pdfCount;
      
      if (jpgCount > 0 && pdfCount === 0) jpgOnlyItems++;
      if (pdfCount > 0 && jpgCount === 0) pdfOnlyItems++;
      if (jpgCount > 0 && pdfCount > 0) bothItems++;
      
      if (idx < 5) {
        console.log(`Item ${idx + 1}: ${item.title || item.pid}`);
        console.log(`  JPG derivatives: ${jpgCount}`);
        if (jpgCount > 0) {
          item.jpg_derivatives.forEach(jpg => {
            console.log(`    - ${jpg.role}: ${jpg.filename}`);
          });
        }
        console.log(`  PDF files: ${pdfCount}`);
        if (pdfCount > 0) {
          item.pdf_files.forEach(pdf => {
            console.log(`    - ${pdf.filename}`);
          });
        }
        console.log();
      }
    });
    
    console.log('=== SUMMARY ===');
    console.log(`Total media items: ${items.length}`);
    console.log(`Total JPG derivatives: ${totalJpgs}`);
    console.log(`Total PDF files: ${totalPdfs}`);
    console.log(`Items with only JPGs: ${jpgOnlyItems}`);
    console.log(`Items with only PDFs: ${pdfOnlyItems}`);
    console.log(`Items with both JPGs and PDFs: ${bothItems}`);
    
    if (jpgOnlyItems > 0) {
      console.log('\n⚠️  WARNING: There are items with JPG derivatives only!');
    }
    
    if (bothItems > 0) {
      console.log(`\n✅ ${bothItems} items have both JPG derivatives (for thumbnails) and PDF files`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRcaPreset();
