#!/bin/bash

# Setup User Secrets for Dynamo Coin Backend
# This script helps you configure all sensitive data securely

set -e

echo "================================"
echo "Dynamo Coin - Setup Secrets"
echo "================================"
echo ""

# Navigate to backend directory
cd dynamo_coin_backend

echo "Initializing user secrets (if not already initialized)..."
dotnet user-secrets init 2>/dev/null || true

echo ""
echo "Please provide the following secrets:"
echo ""

# Database Password
read -sp "Enter Database SA Password: " DB_PASSWORD
echo ""
dotnet user-secrets set "Database:Password" "$DB_PASSWORD"

# OpenAI API Key
read -p "Enter OpenAI API Key: " OPENAI_KEY
dotnet user-secrets set "OpenAI:ApiKey" "$OPENAI_KEY"

echo ""
echo "================================"
echo "Secrets configured successfully!"
echo "================================"
echo ""
echo "Your secrets have been stored in:"
echo "  ~/.microsoft/usersecrets/$(dotnet user-secrets list --id 2>/dev/null | head -1 | cut -d: -f1)"
echo ""
echo "To view your secrets:"
echo "  cd dynamo_coin_backend"
echo "  dotnet user-secrets list"
echo ""
echo "To update a secret:"
echo "  dotnet user-secrets set \"Database:Password\" \"your-new-password\""
echo "  dotnet user-secrets set \"OpenAI:ApiKey\" \"your-new-api-key\""
echo ""
