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

2. Configure database connection in `appsettings.json`

3. Set OpenAI API key using User Secrets:
   ```bash
   dotnet user-secrets set "OpenAI:ApiKey" "your-api-key-here"
   ```

4. Run migrations and start the API:
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

## Project Structure

```
dynamo_coin/
├── dynamo_coin_backend/          # ASP.NET Core Web API
│   ├── Controllers/               # API controllers
│   ├── Services/                  # Business logic & external APIs
│   ├── Data/                      # EF Core DbContext & repositories
│   └── Models/                    # Data models
├── dynamo_coin_portfolio/         # React frontend
│   └── src/
│       ├── components/            # React components
│       ├── state/                 # Redux store & slices
│       └── pages/                 # Main application pages
└── dynamo_coin_backend.Tests/     # Backend unit tests
```

## License

This project is for educational and portfolio demonstration purposes.
