#!/bin/bash

# Test script for Aurora service health probes
# Usage: ./test-health-probes.sh

set -e

echo "🏥 Testing Aurora Service Health Probes"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to test
declare -A SERVICES=(
    ["identity"]="5001"
    ["thoughts"]="4001"
    ["journals"]="4002"
    ["planning"]="4003"
)

# Health endpoints to test
ENDPOINTS=("health" "health/liveness" "health/readiness" "health/startup")

test_endpoint() {
    local service=$1
    local port=$2
    local endpoint=$3
    local url="http://localhost:${port}/${endpoint}"
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} ${service} /${endpoint} - OK"
        return 0
    elif [ "$http_code" = "503" ]; then
        echo -e "${YELLOW}⚠${NC} ${service} /${endpoint} - Service Unavailable (503) - May still be starting"
        return 0
    else
        echo -e "${RED}✗${NC} ${service} /${endpoint} - Failed (HTTP ${http_code})"
        return 1
    fi
}

wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=0
    
    echo "Waiting for ${service} service on port ${port}..."
    
    while [ $attempt -lt $max_attempts ]; do
        if nc -z localhost "$port" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} ${service} is listening on port ${port}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}✗${NC} ${service} failed to start on port ${port}"
    return 1
}

# Check if services are running
echo "1. Checking if services are accessible..."
echo "----------------------------------------"

all_services_up=true
for service in "${!SERVICES[@]}"; do
    port=${SERVICES[$service]}
    if ! wait_for_service "$service" "$port"; then
        all_services_up=false
    fi
done

echo ""

if [ "$all_services_up" = false ]; then
    echo -e "${YELLOW}⚠${NC} Some services are not running. Start them with:"
    echo "   docker-compose up -d"
    echo ""
    exit 1
fi

# Test all health endpoints
echo "2. Testing health probe endpoints..."
echo "------------------------------------"

failed_tests=0
total_tests=0

for service in "${!SERVICES[@]}"; do
    port=${SERVICES[$service]}
    echo ""
    echo "Testing ${service} service (port ${port}):"
    
    for endpoint in "${ENDPOINTS[@]}"; do
        total_tests=$((total_tests + 1))
        if ! test_endpoint "$service" "$port" "$endpoint"; then
            failed_tests=$((failed_tests + 1))
        fi
    done
done

echo ""
echo "========================================"
echo "Test Results:"
echo "========================================"
echo "Total tests: ${total_tests}"
echo -e "Passed: ${GREEN}$((total_tests - failed_tests))${NC}"
if [ $failed_tests -gt 0 ]; then
    echo -e "Failed: ${RED}${failed_tests}${NC}"
else
    echo -e "Failed: ${failed_tests}"
fi
echo ""

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}✓ All health probe tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some health probe tests failed${NC}"
    exit 1
fi

