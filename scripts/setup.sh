#!/bin/bash

set -e

echo "🚀 Setting up Sensio MCP Server..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Sensio API key and Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Run 'npm run inspector' to test with MCP Inspector"
echo ""
