#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRAPHQL_ENDPOINT = 'https://ddrarchive.org/graphql';

// Read JSON files
const recordsPath = path.join(__dirname, '../public/data/presets/records.json');
const authoritiesPath = path.join(__dirname, '../public/data/presets/authorities.json');

const recordsData = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
const authoritiesData = JSON.parse(fs.readFileSync(authoritiesPath, 'utf8'));

const allPresets = [
  ...recordsData.presets.map(p => ({ ...p, category: 'Records' })),
  ...authoritiesData.presets.map(p => ({ ...p, category: 'Authorities' }))
];

console.log(`\n🧪 Testing ${allPresets.length} GraphQL presets...\n`);

const results = {
  passed: [],
  failed: []
};

async function testPreset(preset) {
  // Strip comments from query
  const query = preset.query
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n')
    .trim();

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      results.failed.push({
        id: preset.id,
        label: preset.label,
        category: preset.category,
        errors: [`HTTP ${response.status}: ${response.statusText}`]
      });
      console.log(`❌ ${preset.category} > ${preset.label}`);
      console.log(`   Error: HTTP ${response.status} ${response.statusText}`);
      return;
    }

    const text = await response.text();
    if (!text) {
      results.failed.push({
        id: preset.id,
        label: preset.label,
        category: preset.category,
        errors: ['Empty response from server']
      });
      console.log(`❌ ${preset.category} > ${preset.label}`);
      console.log(`   Error: Empty response from server`);
      return;
    }

    const data = JSON.parse(text);

    if (data.errors) {
      results.failed.push({
        id: preset.id,
        label: preset.label,
        category: preset.category,
        errors: data.errors.map(e => e.message)
      });
      console.log(`❌ ${preset.category} > ${preset.label}`);
      console.log(`   Error: ${data.errors[0].message}`);
    } else {
      results.passed.push({
        id: preset.id,
        label: preset.label,
        category: preset.category
      });
      console.log(`✅ ${preset.category} > ${preset.label}`);
    }
  } catch (error) {
    results.failed.push({
      id: preset.id,
      label: preset.label,
      category: preset.category,
      errors: [error.message]
    });
    console.log(`❌ ${preset.category} > ${preset.label}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  for (const preset of allPresets) {
    await testPreset(preset);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📝 Total:  ${allPresets.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 FAILED PRESETS:');
    results.failed.forEach(f => {
      console.log(`\n  • ${f.category} > ${f.label} (${f.id})`);
      f.errors.forEach(err => console.log(`    ➜ ${err}`));
    });
  }

  console.log('\n');
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runTests();
