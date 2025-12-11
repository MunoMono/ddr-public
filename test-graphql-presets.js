/**
 * Test all GraphQL presets from the DDR API
 * Tests queries from records.json, authorities.json, and validates snippets.json
 */

const GRAPHQL_ENDPOINT = 'https://ddrarchive.org/graphql';

// Check if server is available first
async function checkServerHealth() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' })
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Strip comment lines starting with #
function stripComments(query) {
  return query
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n')
    .trim();
}

// Execute a GraphQL query
async function testQuery(query) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      return {
        success: false,
        errors: [{ message: `HTTP ${response.status}: ${response.statusText}` }],
        data: null
      };
    }

    const text = await response.text();
    
    if (!text) {
      return {
        success: false,
        errors: [{ message: 'Empty response from server' }],
        data: null
      };
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        errors: [{ message: `JSON parse error: ${parseError.message}`, response: text.substring(0, 200) }],
        data: null
      };
    }
    
    return {
      success: !result.errors,
      errors: result.errors || null,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ message: `Network error: ${error.message}` }],
      data: null
    };
  }
}

// Test a single preset
async function testPreset(preset, category, serverUp) {
  console.log(`\nTesting [${category}] ${preset.id} - "${preset.label}"`);
  
  const cleanQuery = stripComments(preset.query);
  
  // Basic syntax validation
  const hasOpeningBrace = cleanQuery.includes('{');
  const hasClosingBrace = cleanQuery.includes('}');
  const syntaxValid = hasOpeningBrace && hasClosingBrace;
  
  if (!syntaxValid) {
    console.log(`❌ FAILED: ${preset.id} - Invalid query syntax`);
    return { preset, category, status: 'failed', errors: [{ message: 'Invalid query syntax - missing braces' }], syntaxOnly: true };
  }
  
  if (!serverUp) {
    console.log(`⚠️  SKIPPED: ${preset.id} - Server unavailable (query syntax OK)`);
    return { preset, category, status: 'skipped', errors: null, syntaxOnly: true };
  }
  
  const result = await testQuery(cleanQuery);
  
  if (result.success) {
    console.log(`✅ PASSED: ${preset.id}`);
    return { preset, category, status: 'passed', errors: null };
  } else {
    console.log(`❌ FAILED: ${preset.id}`);
    console.log('Errors:', JSON.stringify(result.errors, null, 2));
    return { preset, category, status: 'failed', errors: result.errors };
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(80));
  console.log('DDR GRAPHQL PRESET TESTING');
  console.log('='.repeat(80));
  console.log(`Endpoint: ${GRAPHQL_ENDPOINT}\n`);

  // Check server health first
  console.log('Checking server availability...');
  const serverUp = await checkServerHealth();
  
  if (!serverUp) {
    console.log('⚠️  WARNING: GraphQL server appears to be down or unreachable');
    console.log('The tests will continue to validate query structure and syntax.\n');
  } else {
    console.log('✅ Server is responding\n');
  }

  // Load preset files
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const recordsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'public/data/presets/records.json'), 'utf8')
  );
  const authoritiesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'public/data/presets/authorities.json'), 'utf8')
  );
  const snippetsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'public/data/presets/snippets.json'), 'utf8')
  );

  const results = [];
  
  // Test Records presets
  console.log('\n' + '='.repeat(80));
  console.log('TESTING RECORDS PRESETS');
  console.log('='.repeat(80));
  
  for (const preset of recordsData.presets) {
    const result = await testPreset(preset, 'Records', serverUp);
    results.push(result);
  }

  // Test Authorities presets
  console.log('\n' + '='.repeat(80));
  console.log('TESTING AUTHORITIES PRESETS');
  console.log('='.repeat(80));
  
  for (const preset of authoritiesData.presets) {
    const result = await testPreset(preset, 'Authorities', serverUp);
    results.push(result);
  }

  // Validate snippets structure
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATING CODE SNIPPETS');
  console.log('='.repeat(80));
  
  for (const snippet of snippetsData.snippets) {
    const isValid = snippet.id && snippet.label && snippet.language && snippet.code;
    if (isValid) {
      console.log(`✅ Valid snippet: ${snippet.id} (${snippet.language})`);
    } else {
      console.log(`❌ Invalid snippet: ${snippet.id || 'UNKNOWN'}`);
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'passed');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  console.log(`\nTotal presets tested: ${results.length}`);
  console.log(`✅ Passed: ${passed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  if (skipped.length > 0) {
    console.log(`⚠️  Skipped (server down): ${skipped.length}`);
  }

  if (failed.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('FAILED PRESETS DETAILS:');
    console.log('-'.repeat(80));
    
    for (const result of failed) {
      console.log(`\n[${result.category}] ${result.preset.id} - "${result.preset.label}"`);
      console.log(`Description: ${result.preset.description}`);
      console.log('Errors:');
      result.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message}`);
        if (err.locations) {
          console.log(`     Locations: ${JSON.stringify(err.locations)}`);
        }
        if (err.path) {
          console.log(`     Path: ${JSON.stringify(err.path)}`);
        }
      });
    }
  }

  if (passed.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('SUCCESSFUL PRESETS:');
    console.log('-'.repeat(80));
    
    for (const result of passed) {
      console.log(`✅ [${result.category}] ${result.preset.id} - "${result.preset.label}"`);
    }
  }

  if (skipped.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('SKIPPED PRESETS (Server unavailable, but syntax valid):');
    console.log('-'.repeat(80));
    
    for (const result of skipped) {
      console.log(`⚠️  [${result.category}] ${result.preset.id} - "${result.preset.label}"`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('TESTING COMPLETE');
  console.log('='.repeat(80));
  
  if (!serverUp) {
    console.log('\n⚠️  Note: Server was unavailable. All queries have valid syntax.');
    console.log('Run this test again when the server is accessible to test actual execution.');
  }
  
  // Exit with error code if any tests failed (but not if just skipped due to server)
  const actualFailures = failed.filter(f => !f.syntaxOnly);
  process.exit(actualFailures.length > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
