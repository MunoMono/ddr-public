#!/bin/bash
# Test all GraphQL presets against the live endpoint

ENDPOINT="https://admin.ddrarchive.org/graphql"
PASS=0
FAIL=0

echo "🧪 Testing DDR GraphQL Presets"
echo "=============================="
echo ""

# Test function
test_query() {
    local name="$1"
    local query="$2"
    
    printf "Testing %-40s ... " "$name"
    
    response=$(curl -s -X POST "$ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"query\":\"$query\"}")
    
    if echo "$response" | grep -q '"data"'; then
        if echo "$response" | grep -q '"errors"'; then
            echo "❌ FAIL (has errors)"
            echo "$response" | python3 -m json.tool | grep -A5 errors
            ((FAIL++))
        else
            echo "✅ PASS"
            ((PASS++))
        fi
    else
        echo "❌ FAIL (no data)"
        echo "$response"
        ((FAIL++))
    fi
}

echo "📋 RECORD QUERIES"
echo "-----------------"
test_query "items_recent" "{ items_recent(limit: 2) { id pid title } }"
test_query "records_v1" "{ records_v1 { id pid title } }"
test_query "record_v1(id:19)" "{ record_v1(id: \"19\") { id pid title } }"
test_query "jpg_derivatives" "{ records_v1 { jpg_derivatives { signed_url filename } } }"
test_query "pdf_files" "{ items_recent(limit: 5) { pdf_files { signed_url filename } } }"
test_query "attached_media" "{ record_v1(id: \"19\") { attached_media { id pid title } } }"
test_query "linked_art_urls" "{ items_recent(limit: 1) { linked_art_jsonld_url linked_art_turtle_url linked_art_rdfxml_url } }"

echo ""
echo "🔖 AUTHORITY QUERIES"
echo "--------------------"
test_query "agents" "{ agents { staff_code display_name } }"
test_query "ddr_projects" "{ ddr_projects { job_number title } }"
test_query "ref_fonds" "{ ref_fonds { id code label } }"
test_query "ref_ddr_period" "{ ref_ddr_period { id slug label } }"
test_query "ref_project_theme" "{ ref_project_theme { id label } }"
test_query "ref_extent_unit" "{ ref_extent_unit { id label } }"
test_query "ref_department_unit" "{ ref_department_unit { id code label } }"
test_query "ref_series_category" "{ ref_series_category { id label } }"
test_query "ref_epistemic_stance" "{ ref_epistemic_stance { id label } }"
test_query "ref_methodology" "{ ref_methodology { id label } }"
test_query "ref_project_outcome" "{ ref_project_outcome { id label } }"
test_query "ref_beneficiary_audience" "{ ref_beneficiary_audience { id label } }"
test_query "ref_publication_type" "{ ref_publication_type { id label } }"
test_query "ref_access_level" "{ ref_access_level { id label } }"
test_query "ref_copyright_holder" "{ ref_copyright_holder { id label } }"
test_query "ref_repository" "{ ref_repository { id label } }"
test_query "language_codes" "{ language_codes { iso639_1 english_name } }"
test_query "agent_employment" "{ agent_employment { staff_code job_title_code } }"

echo ""
echo "📊 RESULTS"
echo "=========="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi
