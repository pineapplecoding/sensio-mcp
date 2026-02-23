#!/bin/bash

echo "🔍 Verifying Sensio MCP Server Setup..."
echo ""

# Check if dist exists
if [ -d "dist" ]; then
    echo "✅ Build directory exists"
else
    echo "❌ Build directory missing - run 'npm run build'"
    exit 1
fi

# Check if main entry point exists
if [ -f "dist/index.js" ]; then
    echo "✅ Main entry point built"
else
    echo "❌ Main entry point missing"
    exit 1
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check for required variables
    if grep -q "SENSIO_API_KEY=" .env && grep -q "SUPABASE_URL=" .env && grep -q "SUPABASE_SERVICE_KEY=" .env; then
        echo "✅ Required environment variables present"
    else
        echo "⚠️  Some environment variables may be missing"
    fi
else
    echo "⚠️  .env file not found - copy from .env.example"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies missing - run 'npm install'"
    exit 1
fi

echo ""
echo "📊 Project Stats:"
echo "   TypeScript files: $(find src -name '*.ts' | wc -l | xargs)"
echo "   JavaScript files: $(find dist -name '*.js' 2>/dev/null | wc -l | xargs)"
echo "   Dependencies: $(cat package.json | grep -c '\"@' || echo '0')"
echo ""

echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Ensure .env is configured with your credentials"
echo "2. Run 'npm run inspector' to test the server"
echo "3. Configure your AI client (Claude Desktop, Windsurf, etc.)"
echo ""
