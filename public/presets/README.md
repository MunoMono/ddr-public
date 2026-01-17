# GraphQL Presets & Snippets - JSON Configuration

This directory contains externalized GraphQL preset queries and code snippets for the DDR API Sandbox.

## Files

### `records.json`
GraphQL queries for DDR archive records, items, and reference data.

**Presets included:**
- Recent items (with Linked Data)
- All records
- Records with images
- Records with PDFs
- Single record detail
- Reference: Fonds
- Reference: Periods
- DDR People
- DDR Projects

### `authorities.json`
GraphQL queries for DDR database authorities and controlled vocabularies.

**Presets included:**
- DDR Staff (core agent)
- DDR Job List (project register)
- Beneficiary Audience
- DDR Period
- DDR Department
- Epistemic Stance
- Artefact Type
- Fonds
- Methodology
- Project Outcome
- Project Theme
- Publication Type
- Category (series category)

### `snippets.json`
Code examples for consuming the DDR GraphQL API in different programming languages.

**Languages included:**
- cURL (bash)
- JavaScript (fetch)
- Python (requests)
- JavaScript (axios)
- Node.js (native fetch)
- Ruby (HTTParty)

## Schema

Each file follows this structure:

```json
{
  "id": "category-id",
  "label": "Display Label",
  "description": "Category description",
  "presets": [
    {
      "id": "preset-id",
      "label": "Preset Label",
      "description": "What this preset does",
      "query": "GraphQL query string"
    }
  ]
}
```

For snippets:
```json
{
  "snippets": [
    {
      "id": "snippet-id",
      "label": "Language/Tool",
      "language": "language-identifier",
      "description": "What this snippet does",
      "code": "Code example"
    }
  ]
}
```

## Usage

These JSON files are loaded dynamically by `ApiSandbox.jsx` on mount:

```javascript
fetch(`${import.meta.env.BASE_URL}data/presets/records.json`)
```

## Benefits

✅ **Scalable** - Add/edit queries without touching component code  
✅ **Maintainable** - Non-developers can edit JSON files  
✅ **Version controlled** - Track changes independently  
✅ **Type-safe ready** - Easy to add TypeScript interfaces  
✅ **CMS-ready** - Can migrate to headless CMS later

## Adding New Presets

1. Edit the appropriate JSON file (`records.json` or `authorities.json`)
2. Add a new object to the `presets` array:
   ```json
   {
     "id": "uniqueId",
     "label": "Display Name",
     "description": "Brief description",
     "query": "# Comment\n{\n  your_query {\n    fields\n  }\n}"
   }
   ```
3. Save the file - changes are hot-reloaded in development

## Adding New Snippets

1. Edit `snippets.json`
2. Add to the `snippets` array:
   ```json
   {
     "id": "go-http",
     "label": "Go http",
     "language": "go",
     "description": "Query using Go's net/http",
     "code": "package main\n\n// your code"
   }
   ```
