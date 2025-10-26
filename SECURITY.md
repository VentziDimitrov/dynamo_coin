# Security Guidelines for Dynamo Coin

## Overview

This document explains how sensitive data (passwords, API keys) are managed in the Dynamo Coin project.

## What Changed

All hardcoded passwords and API keys have been removed from configuration files and moved to secure storage:

### Files Updated:
- ✅ `appsettings.json` - Password removed from connection string
- ✅ `docker-compose.yml` - Uses environment variables
- ✅ `docker-compose.prod.yml` - Uses environment variables
- ✅ `.env.example` - Template with documentation
- ✅ `Program.cs` - Reads password from configuration

## Secrets Storage Methods

### Method 1: .NET User Secrets (Local Development)

**Best for:** Running the app locally without Docker

**Location:** `~/.microsoft/usersecrets/473c1d6e-f739-412a-aa46-8a9299b3d9a6/secrets.json`

**Setup:**
```bash
# Option A: Use the setup script
./setup-secrets.sh

# Option B: Manual setup
cd dynamo_coin_backend
dotnet user-secrets set "Database:Password" "YourPassword123!"
dotnet user-secrets set "OpenAI:ApiKey" "sk-your-key-here"
```

**View secrets:**
```bash
cd dynamo_coin_backend
dotnet user-secrets list
```

**Remove secrets:**
```bash
dotnet user-secrets remove "Database:Password"
dotnet user-secrets clear  # Remove all
```

### Method 2: Environment Variables (Docker)

**Best for:** Running with Docker Compose

**Location:** `.env` file in project root (not committed to git)

**Setup:**
```bash
# Copy the template
cp .env.example .env

# Edit with your values
nano .env
```

**Example .env file:**
```env
OPENAI_API_KEY=sk-proj-abc123...
DB_SA_PASSWORD=YourStrongPassword123!
```

## Security Checklist

Before committing or deploying:

- [ ] No passwords in `appsettings.json`
- [ ] No API keys in `appsettings.json`
- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` contains only placeholder values
- [ ] User secrets are configured locally (for dev)
- [ ] Environment variables are set (for Docker)

## Production Deployment

For production environments, use proper secrets management:

### Cloud Providers:
- **Azure:** Azure Key Vault
- **AWS:** AWS Secrets Manager or Parameter Store
- **Google Cloud:** Secret Manager
- **Kubernetes:** Kubernetes Secrets

### Docker Production:
Instead of `.env` file, use:
- Docker Secrets (Docker Swarm)
- Kubernetes Secrets
- CI/CD secret injection

## Troubleshooting

### Local Development Issues:

**Error: Cannot connect to database**
```bash
# Check if password is set in user secrets
cd dynamo_coin_backend
dotnet user-secrets list

# If not set, run:
dotnet user-secrets set "Database:Password" "YourPassword123!"
```

**Error: OpenAI API key missing**
```bash
# Set the API key
dotnet user-secrets set "OpenAI:ApiKey" "sk-your-key-here"
```

### Docker Issues:

**Error: SA_PASSWORD environment variable**
```bash
# Check .env file exists
ls -la .env

# If not, create it
cp .env.example .env
nano .env  # Add your passwords
```

**Error: Container unhealthy**
```bash
# Check if password in .env matches SA_PASSWORD requirement
# Password must be at least 8 characters with uppercase, lowercase, numbers, and special chars
```

## Best Practices

1. **Never commit secrets to version control**
   - `.env` is in `.gitignore`
   - User secrets are outside project directory
   - Review commits before pushing

2. **Use different secrets for different environments**
   - Development: Weaker passwords acceptable
   - Production: Strong, unique passwords required

3. **Rotate secrets regularly**
   - Change database passwords periodically
   - Rotate API keys when needed
   - Update all environments after rotation

4. **Limit secret access**
   - Only developers who need them should have secrets
   - Use different API keys for different team members
   - Audit secret access

5. **Backup secrets securely**
   - Store production secrets in encrypted password manager
   - Document recovery procedures
   - Test backup restoration

## Questions?

If you have questions about security configuration, check:
- README.md - Setup instructions
- .env.example - All required variables
- This document - Security guidelines
