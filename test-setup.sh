#!/bin/bash

echo "🧪 Sensio MCP Server - Test Setup"
echo "=================================="
echo ""

# Check if .env.test exists and has required values
if [ ! -f ".env.test" ]; then
    echo "❌ .env.test not found"
    echo "Creating .env.test template..."
    cat > .env.test << 'EOF'
# Your Sensio API Key
SENSIO_API_KEY=

# Your device serials (comma-separated)
ALLOWED_DEVICE_SERIALS=

# Cache settings
CACHE_TTL_LATEST=15
CACHE_TTL_HISTORY=300
MAX_TIME_WINDOW_DAYS=30
EOF
    echo "✅ Created .env.test"
    echo ""
    echo "⚠️  Please edit .env.test and add:"
    echo "   1. Your SENSIO_API_KEY"
    echo "   2. Your ALLOWED_DEVICE_SERIALS (e.g., SA123,SA456)"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if API key is set
if ! grep -q "SENSIO_API_KEY=." .env.test; then
    echo "❌ SENSIO_API_KEY is not set in .env.test"
    echo ""
    echo "Please edit .env.test and add your API key:"
    echo "  SENSIO_API_KEY=your_actual_api_key"
    exit 1
fi

# Check if device serials are set
if ! grep -q "ALLOWED_DEVICE_SERIALS=." .env.test; then
    echo "❌ ALLOWED_DEVICE_SERIALS is not set in .env.test"
    echo ""
    echo "Please edit .env.test and add your device serials:"
    echo "  ALLOWED_DEVICE_SERIALS=SA123,SA456"
    exit 1
fi

echo "✅ Configuration file found"
echo ""

# Copy to .env for testing
cp .env.test .env
echo "✅ Copied .env.test to .env"
echo ""

# Build standalone version
echo "🔨 Building standalone version..."
npm run build:standalone

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    echo ""
    echo "🎉 Ready to test!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run inspector"
    echo "2. Test the 'sensio_list_device_serials' tool"
    echo "3. Test the 'sensio_get_latest' tool"
    echo ""
else
    echo "❌ Build failed"
    exit 1
fi
