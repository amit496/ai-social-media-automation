#!/bin/bash
# AI Social Media Automation - Phase 1 Testing Suite

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   AI SOCIAL MEDIA AUTOMATION - PHASE 1 TEST SUITE        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:3000/api"
PASS=0
FAIL=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST: $name"
    
    # Create temp files for response
    tmpbody=$(mktemp)
    tmpcode=$(mktemp)
    
    if [ "$method" = "GET" ]; then
        curl -s -w "%{http_code}" "$BASE_URL$endpoint" > "$tmpbody" 2>&1
        http_code=$(tail -c 3 "$tmpbody")
        body=$(head -c -3 "$tmpbody")
    else
        http_code=$(curl -s -w "%{http_code}" -o "$tmpbody" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
        body=$(cat "$tmpbody")
    fi
    
    echo "Endpoint: $BASE_URL$endpoint"
    echo "Method: $method"
    echo "HTTP Status: $http_code"
    echo ""
    
    if [ "$http_code" = "$expected_status" ]; then
        echo "✅ PASS - Status code $http_code"
        ((PASS++))
    else
        echo "❌ FAIL - Expected $expected_status, got $http_code"
        ((FAIL++))
    fi
    
    # Show response preview
    if [ ! -z "$body" ]; then
        echo "Response Preview:"
        if command -v jq &> /dev/null; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
    fi
    echo ""
    
    # Cleanup
    rm -f "$tmpbody" "$tmpcode"
}

# ═══════════════════════════════════════════════════════════════
# TEST 1: Health Check
# ═══════════════════════════════════════════════════════════════
test_endpoint "Health Check" "GET" "/health" "" "200"

# ═══════════════════════════════════════════════════════════════
# TEST 2: Trending Topics (Default)
# ═══════════════════════════════════════════════════════════════
test_endpoint "Trending Topics" "GET" "/trending" "" "200"

# ═══════════════════════════════════════════════════════════════
# TEST 3: Best Topic Selection
# ═══════════════════════════════════════════════════════════════
test_endpoint "Best Topic" "GET" "/topic" "" "200"

# ═══════════════════════════════════════════════════════════════
# TEST SUMMARY
# ═══════════════════════════════════════════════════════════════
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                          ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║ ✅ PASSED: $PASS                                          ║"
echo "║ ❌ FAILED: $FAIL                                          ║"
total=$((PASS + FAIL))
echo "║ 📊 TOTAL:  $total                                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! System is ready for Phase 2."
    exit 0
else
    echo "⚠️  Some tests failed. Check errors above."
    exit 1
fi
