#!/bin/bash

echo "=== LinkedIn OAuth Configuration Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:4000/api/auth/linkedin/debug > /dev/null; then
    echo -e "${GREEN}✓ Backend server is running${NC}"
    
    # Get debug info
    echo ""
    echo "2. LinkedIn OAuth Configuration:"
    curl -s http://localhost:4000/api/auth/linkedin/debug | jq '.'
else
    echo -e "${RED}✗ Backend server is not running on port 4000${NC}"
    echo "Please start the backend with: cd wisal/backend && npm run dev"
    exit 1
fi

echo ""
echo "3. Testing OAuth Flow:"
echo -e "${YELLOW}Please visit: http://localhost:4000/api/auth/linkedin-custom${NC}"
echo ""
echo "This should redirect you to LinkedIn for authorization."
echo ""
echo "4. Important LinkedIn App Settings to Verify:"
echo "   - Authorized redirect URLs should include:"
echo "     ${YELLOW}http://localhost:4000/api/auth/linkedin/callback-custom${NC}"
echo ""
echo "5. Check browser console for errors:"
echo "   - Open DevTools (F12)"
echo "   - Go to Network tab"
echo "   - Look for any failed requests"
echo "   - Check Console tab for JavaScript errors"
echo ""
echo "6. Check backend logs for detailed information about the OAuth flow"
echo ""