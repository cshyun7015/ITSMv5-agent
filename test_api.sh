#!/bin/bash
# 1. Login to get token
RESPONSE=$(curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"msp","password":"pwd"}')
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

# 2. Try to update a code (we will use a dummy ID like 9999 to see the validation error, or a real one)
# Validation runs BEFORE entity existence check, so 9999 is fine.
curl -s -v -X PUT http://localhost:8082/api/v1/codes/9999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groupId": "TEST_GRP", "codeId": "TEST_CODE", "codeName": "Test Name", "sortOrder": 1, "isActive": true}'

