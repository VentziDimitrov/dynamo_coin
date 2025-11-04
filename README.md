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


