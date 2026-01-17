/**
 * Test the "All records" GraphQL query
 */

const GRAPHQL_ENDPOINT = 'https://api.ddrarchive.org/graphql';

const query = `
{
  records_v1 {
    id
    pid
    title
    scope_and_content
    copyright_holder
    rights_holders
    date_begin
    date_end
    jpg_derivatives {
      signed_url
      filename
      role
      label
      copyright_holder
      rights_holders
    }
    pdf_files {
      signed_url
      filename
      role
      label
      copyright_holder
      rights_holders
    }
  }
}
`;

async function testAllRecords() {
  try {
    console.log('Testing "All records" GraphQL query...\n');
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }
    
    const records = result.data.records_v1;
    console.log('✅ Query successful!');
    console.log('Total records returned:', records.length);
    console.log('');
    console.log('='.repeat(80));
    console.log('LISTING ALL ASSETS (JPG DISPLAY DERIVATIVES + PDFs):');
    console.log('='.repeat(80));
    console.log('');
    
    let assetCount = 0;
    let totalDisplayJpgs = 0;
    let totalPdfs = 0;
    
    records.forEach(record => {
      const displayJpgs = record.jpg_derivatives?.filter(j => j.role === 'jpg_display') || [];
      const pdfs = record.pdf_files || [];
      
      if (displayJpgs.length > 0 || pdfs.length > 0) {
        console.log(`\n📁 Record ${record.id} - PID: ${record.pid}`);
        console.log(`   Title: ${record.title || 'Untitled'}`);
        console.log(`   -`.repeat(40));
        
        // List each display JPG
        displayJpgs.forEach((jpg, idx) => {
          assetCount++;
          console.log(`   ${assetCount}. [JPG DISPLAY] ${jpg.filename || 'unnamed'}`);
          console.log(`      Role: ${jpg.role}, Label: ${jpg.label || 'N/A'}`);
        });
        
        // List each PDF
        pdfs.forEach((pdf, idx) => {
          assetCount++;
          console.log(`   ${assetCount}. [PDF] ${pdf.filename || 'unnamed'}`);
          console.log(`      Label: ${pdf.label || 'N/A'}`);
        });
        
        totalDisplayJpgs += displayJpgs.length;
        totalPdfs += pdfs.length;
      }
    });
    
    console.log('');
    console.log('='.repeat(80));
    console.log('SUMMARY:');
    console.log('Total JPG display derivatives:', totalDisplayJpgs);
    console.log('Total PDF files:', totalPdfs);
    console.log('GRAND TOTAL OF ASSETS:', assetCount);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAllRecords();
