from fastapi import FastAPI
from textblob import TextBlob
import requests

app = FastAPI()

# Mock News API (In real world, use Finnhub or NewsAPI)
def fetch_news(symbol: str):
    # This is a placeholder. Real implementation would fetch headlines.
    mock_headlines = {
        "BTC": ["Bitcoin price surges as ETFs see record inflows", "Regulators look closer at crypto exchanges", "Bitcoin mining difficulty hits all-time high"],
        "ETH": ["Ethereum Shanghai upgrade successful", "Staking rewards attract more investors", "L2 solutions scaling Ethereum faster than ever"],
        "SOL": ["Solana ecosystem grows with new NFT marketplaces", "Network stability improved after latest patch", "Solana developers flock to new hackathon"]
    }
    return mock_headlines.get(symbol.upper(), ["No recent news found for this asset."])

@app.get("/sentiment/{symbol}")
def get_sentiment(symbol: str):
    headlines = fetch_news(symbol)
    scores = []
    for headline in headlines:
        analysis = TextBlob(headline)
        scores.append(analysis.sentiment.polarity)
    
    avg_score = sum(scores) / len(scores) if scores else 0
    
    sentiment = "neutral"
    if avg_score > 0.1:
        sentiment = "positive"
    elif avg_score < -0.1:
        sentiment = "negative"
        
    return {
        "symbol": symbol.upper(),
        "score": avg_score,
        "sentiment": sentiment,
        "headlines": headlines
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
