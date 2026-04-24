#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080/api/v1"
USERNAME="msp"
PASSWORD="pwd"
TENANT_ID="OPER_01"

echo "=== 1. Login to get JWT ==="
TOKEN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed! Please check if the server is running on :8080"
  exit 1
fi

echo "Token received: ${TOKEN:0:20}..."

echo -e "\n=== 2. Create a new CI ==="
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/cis" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Production Web Server 01\",
    \"ciType\": \"SERVER\",
    \"status\": \"ACTIVE\",
    \"tenantId\": \"company1\",
    \"description\": \"Main web server for customer 1\",
    \"ownerId\": 1
  }")
CI_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Created CI Response: $CREATE_RESPONSE"
echo "Extracted CI ID: $CI_ID"

echo -e "\n=== 3. List CIs for tenant 'company1' ==="
curl -s -X GET "${BASE_URL}/cis?tenantId=company1" \
  -H "Authorization: Bearer ${TOKEN}" | json_pp || echo "No json_pp found, raw output: $(curl -s -X GET "${BASE_URL}/cis?tenantId=company1" -H "Authorization: Bearer ${TOKEN}")"

echo -e "\n=== 4. Get specific CI details ==="
curl -s -X GET "${BASE_URL}/cis/${CI_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | json_pp

echo -e "\n=== 5. Update CI name ==="
curl -s -X PUT "${BASE_URL}/cis/${CI_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Updated Web Server 01\"}" | json_pp

echo -e "\n=== 6. Delete CI ==="
curl -s -X DELETE "${BASE_URL}/cis/${CI_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
echo "Delete request sent for ID ${CI_ID}"

echo -e "\n=== 7. Verify deletion (should return 404 or empty) ==="
curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/cis/${CI_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
echo -e "\nTest completed!"
