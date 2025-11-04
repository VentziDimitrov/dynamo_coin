# Dynamo Coin Portfolio Tracker

A full-stack cryptocurrency portfolio management application with real-time pricing, performance tracking, and AI-powered sentiment analysis.

## Features

- **Portfolio Management**: Upload and track your crypto holdings with real-time price updates
- **Live Market Data**: Integration with CoinLore API for current prices and 24h/7d trends
- **AI Sentiment Analysis**: OpenAI-powered sentiment classification based on technical indicators, market sentiment, and fundamental analysis
- **Performance Metrics**: Track gains/losses, total portfolio value, and individual asset performance
- **Persistent Storage**: MSSQL database with Entity Framework Core

## Tech Stack

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8)
- **Database**: MSSQL Server with Entity Framework Core
- **AI Integration**: Microsoft Semantic Kernel + OpenAI API
- **APIs**: CoinLore (market data), OpenAI (sentiment analysis)
- **Logging**: Serilog with rolling file logs

### Frontend
- **Framework**: React 19 with Redux Toolkit
- **State Management**: Redux + Zustand
- **HTTP Client**: Axios
- **UI**: lucide-react icons
- **Testing**: Jest + React Testing Library

## Quick Start

### Option 1: Docker

Build and run images locally:

1. **Prerequisites**:
   - Docker and Docker Compose installed
   - OpenAI API key

2. **Setup**:
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env and add your OpenAI API key
   nano .env
   ```

3. **Run**:
   ```bash
   # Build and start all services (database, backend, frontend)
   docker compose up -d

   # View logs
   docker compose logs -f

   # Stop all services
   docker compose down
   ```

4. **Access**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5260
   - Database: localhost:1433

### Option 2: Manual Setup

### Prerequisites
- .NET 8 SDK
- Node.js (v14+)
- MSSQL Server
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd dynamo_coin_backend
   ```

2. **Setup User Secrets** (Recommended - secure way to store sensitive data):

   Option A - Use the automated script:
   ```bash
   cd ..
   ./setup-secrets.sh
   ```

   Option B - Manual setup:
   ```bash
   # Set database password
   dotnet user-secrets set "Database:Password" "your-db-password-here"

   # Set OpenAI API key
   dotnet user-secrets set "OpenAI:ApiKey" "your-api-key-here"
   ```

3. Run migrations and start the API:
   ```bash
   dotnet ef database update
   dotnet run
   ```

Backend will be available at `http://localhost:5260`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd dynamo_coin_portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Upload Portfolio**: Create a pipe-delimited file with format: `amount|symbol|purchase_price` (e.g., `1.5|BTC|45000`)
2. **View Portfolio**: See real-time values, gains/losses, and performance metrics
3. **Analyze Sentiment**: Click analyze on any coin to get AI-powered sentiment insights
4. **Refresh Data**: Set auto-refresh intervals or manually refresh market data

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/upload` | Upload portfolio file |
| GET | `/api/portfolio/refresh` | Refresh portfolio with latest prices |
| GET | `/api/portfolio/analyse?coin={symbol}` | Get AI sentiment analysis for a coin |

## Testing

### Local Testing

Run backend tests:
```bash
cd dynamo_coin_backend.Tests
dotnet test
```

Run frontend tests:
```bash
cd dynamo_coin_portfolio
npm test
```

### Docker Testing

Build and test in Docker:
```bash
# Build all images
docker-compose build

# Run tests in containers
docker-compose run backend dotnet test
docker-compose run frontend npm test
```

## Project Structure

```
dynamo_coin/
├── dynamo_coin_backend/          # ASP.NET Core Web API
│   ├── Controllers/               # API controllers
│   ├── Services/                  # Business logic & external APIs
│   ├── Data/                      # EF Core DbContext & repositories
│   ├── Models/                    # Data models
│   ├── Dockerfile                 # Backend Docker configuration
│   └── .dockerignore              # Docker ignore patterns
├── dynamo_coin_portfolio/         # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── state/                 # Redux store & slices
│   │   └── pages/                 # Main application pages
│   ├── Dockerfile                 # Frontend Docker configuration
│   ├── nginx.conf                 # Nginx configuration for production
│   └── .dockerignore              # Docker ignore patterns
├── dynamo_coin_backend.Tests/     # Backend unit tests
├── docker-compose.yml             # Docker orchestration (local build)
├── docker-compose.prod.yml        # Docker orchestration (Docker Hub images)
├── .env.example                   # Environment variables template
├── setup-secrets.sh               # Script to configure user secrets
└── build-and-push.sh              # Script to build and push Docker images
```

## Security Configuration

### Secrets Management

This project uses **two different approaches** for managing sensitive data:

**1. .NET User Secrets** (for local development without Docker):
- Passwords and API keys are stored outside the project directory
- Located in `~/.microsoft/usersecrets/<user_secrets_id>/secrets.json`
- Never committed to version control
- Use `./setup-secrets.sh` script or `dotnet user-secrets` commands

**2. Environment Variables** (for Docker):
- Configured in `.env` file (not committed to git)
- Copy `.env.example` to `.env` and fill in your values
- Docker Compose reads these variables automatically

### Required Secrets:

| Secret | Description | Where Used |
|--------|-------------|------------|
| `Database:Password` | MSSQL SA password | User Secrets (local dev) |
| `OpenAI:ApiKey` | OpenAI API key | User Secrets (local dev) |
| `DB_SA_PASSWORD` | MSSQL SA password | .env (Docker) |
| `OPENAI_API_KEY` | OpenAI API key | .env (Docker) |

### Setup Instructions:

**For Local Development:**
```bash
./setup-secrets.sh
```

**For Docker:**
```bash
cp .env.example .env
nano .env  # Edit with your actual values
```

**Important Security Notes:**
- ✅ `.env` is in `.gitignore` - never commit it!
- ✅ User secrets are stored outside project directory
- ✅ `appsettings.json` contains no passwords
- ✅ Docker compose files use environment variable substitution
- ⚠️  For production, use proper secrets management (Azure Key Vault, AWS Secrets Manager, etc.)

## Docker Details

### Services

The Docker Compose setup includes three services:

1. **mssql**: MSSQL Server 2022 database
   - Includes health checks and automatic initialization
   - Data persisted in Docker volume

2. **backend**: ASP.NET Core Web API
   - Multi-stage build for optimized image size
   - Auto-connects to database on startup
   - Includes migrations and seeding

3. **frontend**: React app served by Nginx
   - Production-optimized build
   - Configured with compression and caching
   - Reverse proxy ready

### Building and Pushing to Docker Hub

To build and publish your own images to Docker Hub:

```bash
# Method 1: Using the automated script (easiest)
./build-and-push.sh 1.0

# Method 2: Manual build and push
# Login to Docker Hub
docker login

# Build images
docker build -t ventzidimitrov/dynamo_coin:backend-latest ./dynamo_coin_backend
docker build -t ventzidimitrov/dynamo_coin:frontend-latest ./dynamo_coin_portfolio

# Push to Docker Hub
docker push ventzidimitrov/dynamo_coin:backend-latest
docker push ventzidimitrov/dynamo_coin:frontend-latest
```

**Available Images on Docker Hub:**
- `ventzidimitrov/dynamo_coin:backend-latest` - Backend API
- `ventzidimitrov/dynamo_coin:frontend-latest` - React Frontend
- `ventzidimitrov/dynamo_coin:backend-{version}` - Versioned backend
- `ventzidimitrov/dynamo_coin:frontend-{version}` - Versioned frontend

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs for specific service
docker compose logs -f backend

# Rebuild after code changes
docker compose up -d --build

# Stop and remove all containers, networks, and volumes
docker compose down -v

# Access backend shell
docker compose exec backend bash

# Access database
docker compose exec mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Tribal4o!!!' -C
```

## License

This project is for educational and portfolio demonstration purposes.
