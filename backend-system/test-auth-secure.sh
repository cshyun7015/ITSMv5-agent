#!/bin/bash

# Configuration
API_URL="http://localhost:8080/api/v1"
TENANT="ucomp1"
USERNAME="user1"
PASSWORD="pwd"

echo "--------------------------------------------------"
echo "ITSM v5 Auth Security Test (Login/Logout/Revocation)"
echo "--------------------------------------------------"

# 1. Login
echo "[1/4] Attempting login for $USERNAME ($TENANT)..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT\", \"username\":\"$USERNAME\", \"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "FAILED: Login failed. Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "SUCCESS: Logged in successfully."
# echo "Token: ${TOKEN:0:20}..."

# 2. Use token to call protected API
echo "[2/4] Accessing protected API (/requests/all) with new token..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/requests/all" \
  -H "Authorization: Bearer $TOKEN")

if [ "$STATUS_CODE" == "200" ]; then
    echo "SUCCESS: Protected API accessed (Status: 200)"
else
    echo "FAILED: Access denied (Status: $STATUS_CODE)"
    exit 1
fi

# 3. Logout
echo "[3/4] Logging out (Revoking token)..."
LOGOUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if [ "$LOGOUT_STATUS" == "200" ]; then
    echo "SUCCESS: Logout API called successfully (Status: 200)"
else
    echo "FAILED: Logout failed (Status: $LOGOUT_STATUS)"
    exit 1
fi

# 4. Try to use revoken token again
echo "[4/4] Accessing protected API again with REVIKED token..."
FINAL_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/requests/all" \
  -H "Authorization: Bearer $TOKEN")

if [ "$FINAL_STATUS_CODE" == "401" ]; then
    echo "SUCCESS: Access DENIED as expected (Status: 401). Security enhancement verified!"
else
    echo "FAILED: Token was NOT revoked! (Status: $FINAL_STATUS_CODE) - Expected 401"
    exit 1
fi

echo "--------------------------------------------------"
echo "ALL TESTS PASSED: Auth security lifecycle verified."
echo "--------------------------------------------------"
