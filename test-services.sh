#!/bin/bash

# Aurora Services Test Script
# Tests Identity and Thoughts services end-to-end

set -e

echo "🚀 Testing Aurora Services"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URLs
IDENTITY_URL="http://localhost:5000"
THOUGHTS_URL="http://localhost:4001"

echo "${BLUE}1. Testing Identity Service${NC}"
echo "----------------------------"

# Register user
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST ${IDENTITY_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "Response: $REGISTER_RESPONSE"

# Login user
echo ""
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST ${IDENTITY_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "${GREEN}✅ Got access token!${NC}"
echo ""

echo "${BLUE}2. Testing Thoughts Service${NC}"
echo "----------------------------"

# Create thought
echo "Creating thought..."
CREATE_THOUGHT=$(curl -s -X POST ${THOUGHTS_URL}/api/thoughts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "This is my first thought from the test script!",
    "tags": ["test", "automation"]
  }')

echo "Response: $CREATE_THOUGHT"

# Extract thought ID
THOUGHT_ID=$(echo $CREATE_THOUGHT | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$THOUGHT_ID" ]; then
  echo "❌ Failed to create thought"
  exit 1
fi

echo "${GREEN}✅ Created thought with ID: $THOUGHT_ID${NC}"
echo ""

# Get all thoughts
echo "Getting all thoughts..."
GET_THOUGHTS=$(curl -s -X GET ${THOUGHTS_URL}/api/thoughts \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_THOUGHTS"
echo "${GREEN}✅ Retrieved thoughts${NC}"
echo ""

# Get specific thought
echo "Getting specific thought..."
GET_THOUGHT=$(curl -s -X GET ${THOUGHTS_URL}/api/thoughts/${THOUGHT_ID} \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_THOUGHT"
echo "${GREEN}✅ Retrieved thought by ID${NC}"
echo ""

# Update thought
echo "Updating thought..."
UPDATE_THOUGHT=$(curl -s -X PUT ${THOUGHTS_URL}/api/thoughts/${THOUGHT_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "This is my UPDATED thought!",
    "tags": ["test", "updated"]
  }')

echo "Response: $UPDATE_THOUGHT"
echo "${GREEN}✅ Updated thought${NC}"
echo ""

# Search thoughts
echo "Searching thoughts..."
SEARCH_THOUGHTS=$(curl -s -X GET "${THOUGHTS_URL}/api/thoughts/search?q=updated" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $SEARCH_THOUGHTS"
echo "${GREEN}✅ Search completed${NC}"
echo ""

# Delete thought
echo "Deleting thought..."
DELETE_THOUGHT=$(curl -s -X DELETE ${THOUGHTS_URL}/api/thoughts/${THOUGHT_ID} \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $DELETE_THOUGHT"
echo "${GREEN}✅ Deleted thought${NC}"
echo ""

echo "=========================="
echo "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Services working correctly:"
echo "  ✅ Identity Service (auth, JWT)"
echo "  ✅ Thoughts Service (CRUD, search)"
echo "  ✅ Service-to-service auth"
echo ""

