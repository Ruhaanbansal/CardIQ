#!/bin/bash
# CardIQ Production Smoke Test
# Run post-deployment to ensure basic connectivity and health

set -e

API_URL=${1:-"https://api.cardiq.ai"}
FRONTEND_URL=${2:-"https://cardiq.ai"}

echo "Running Smoke Tests against $API_URL and $FRONTEND_URL"

# 1. Frontend Availability
echo -n "Checking Frontend... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "FAILED (HTTP $HTTP_CODE)"
  exit 1
fi
echo "OK"

# 2. Backend Liveness
echo -n "Checking Backend Liveness... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health/live")
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "FAILED (HTTP $HTTP_CODE)"
  exit 1
fi
echo "OK"

# 3. Backend Readiness (DB + Redis checks internal to the endpoint)
echo -n "Checking Backend Readiness (DB/Redis)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health/ready")
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "FAILED (HTTP $HTTP_CODE)"
  exit 1
fi
echo "OK"

# 4. Critical Endpoint: Optimizer Simulation
echo -n "Checking Optimizer Engine... "
HTTP_CODE=$(curl -s -X POST "$API_URL/api/optimizer/calculate" \
  -H "Content-Type: application/json" \
  -d '{"merchantName":"SmokeTest","amount":100,"walletCardIds":[]}' \
  -o /dev/null -w "%{http_code}")

if [ "$HTTP_CODE" -ne 200 ] && [ "$HTTP_CODE" -ne 400 ] && [ "$HTTP_CODE" -ne 401 ]; then
  echo "FAILED (Unexpected HTTP $HTTP_CODE)"
  exit 1
fi
echo "OK (Endpoint responsive)"

echo "Smoke tests passed successfully."
exit 0
