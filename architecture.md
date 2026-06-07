# AlphaPulse Backend Architecture

## Overview
AlphaPulse follows a microservices-inspired architecture to handle real-time market data, news sentiment analysis, and user management.

## Components

### 1. API Gateway (Node.js/Express)
- **Primary Role:** Main entry point for the mobile app.
- **Responsibilities:**
  - Authentication (JWT).
  - Watchlist management.
  - Proxying/Aggregating data from internal services.
  - WebSocket server for real-time price pushes.
  - Caching frequently accessed market data (CoinGecko, Finnhub).
- **Tech Stack:** Node.js, Express, Socket.io, JWT.

### 2. News Sentiment Service (Python)
- **Primary Role:** Financial news aggregation and sentiment analysis.
- **Responsibilities:**
  - Periodically fetch news for tracked tickers.
  - Perform NLP sentiment scoring (Positive, Neutral, Negative).
  - Expose an internal REST endpoint for the API Gateway.
- **Tech Stack:** Python, FastAPI/Flask, TextBlob/NLTK.

### 3. On-Chain Metrics Service (Python)
- **Primary Role:** Crypto on-chain data retrieval.
- **Responsibilities:**
  - Pull data for BTC/ETH (Whale moves, exchange flows).
- **Tech Stack:** Python, Web3.py or direct API calls to blockchain explorers.

### 4. Data Storage
- **Relational DB (SQLite for MVP):** Stores user profiles, watchlists, and alert settings.
- **In-Memory Cache:** Simple JavaScript object or Map (serving as a Redis substitute for the MVP) to store live market prices and stay under API rate limits.

## Data Flow
1. Mobile app requests ticker details.
2. API Gateway checks cache.
3. If cache miss, API Gateway fetches from Market APIs (CoinGecko/Finnhub).
4. API Gateway calls Sentiment Service for ticker-specific news sentiment.
5. API Gateway aggregates and returns the unified response.

## Real-Time Price Streaming
- API Gateway maintains a list of active symbols from user watchlists.
- A background worker in the API Gateway polls market APIs every few seconds (within rate limits).
- Updates are pushed to connected clients via WebSockets (Socket.io).

## API Endpoints (v1)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/assets` - List supported assets
- `GET /api/v1/assets/:symbol` - Aggregated asset data (Price + Sentiment + Indicators)
- `GET /api/v1/assets/:symbol/history` - Historical price data
- `GET /api/v1/news/:symbol` - News feed with sentiment
- `GET /api/v1/auth/profile` - Get current user profile
- `GET /api/v1/watchlists` - List all user watchlists
- `POST /api/v1/watchlists` - Create a new watchlist
- `PATCH /api/v1/watchlists/:id` - Rename a watchlist
- `DELETE /api/v1/watchlists/:id` - Delete a watchlist
- `POST /api/v1/watchlists/:id/assets` - Add asset to a specific watchlist
- `DELETE /api/v1/watchlists/:id/assets/:symbol` - Remove asset from a specific watchlist
- `GET /api/v1/alerts` - List user's price alerts
- `POST /api/v1/alerts` - Create a new price alert
- `PATCH /api/v1/alerts/:id` - Enable/Disable or update alert
- `DELETE /api/v1/alerts/:id` - Remove alert
- `WS /ws` - Real-time price updates (In progress)
