#!/bin/bash
# Test cases for WCAGAI security middleware

# Variables
API_URL="http://localhost:3000/api"
TEST_URL="https://example.com"

# 1. Basic scan request
echo "Testing basic scan request..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"${TEST_URL}\"}"
echo -e "\n"

# 2. Idempotent request
echo "Testing idempotent request..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-123" \
  -d "{\"url\":\"${TEST_URL}\"}"
echo -e "\n"

# 3. Same idempotency key (should return cached)
echo "Testing cached idempotent request..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-123" \
  -d "{\"url\":\"${TEST_URL}\"}"
echo -e "\n"

# 4. SSRF attempt (should fail)
echo "Testing SSRF protection..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"http://localhost\"}"
echo -e "\n"

# 5. Private IP (should fail)
echo "Testing private IP protection..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"http://192.168.1.1\"}"
echo -e "\n"

# 6. Metadata endpoint (should fail)
echo "Testing metadata protection..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"http://169.254.169.254\"}"
echo -e "\n"

# 7. Invalid protocol (should fail)
echo "Testing protocol protection..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"file:///etc/passwd\"}"
echo -e "\n"

# 8. Test with keywords
echo "Testing scan with keywords..."
curl -X POST "${API_URL}/scan" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-keywords" \
  -d "{\"url\":\"${TEST_URL}\",\"keywords\":[\"header\",\"navigation\"]}"
echo -e "\n"