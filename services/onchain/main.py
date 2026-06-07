from fastapi import FastAPI

app = FastAPI()

@app.get("/onchain/{symbol}")
def get_onchain_metrics(symbol: str):
    # Mock On-Chain Data
    if symbol.upper() == "BTC":
        return {
            "symbol": "BTC",
            "whale_transactions_24h": 150,
            "exchange_inflow": 500.5,
            "exchange_outflow": 450.2,
            "net_flow": 50.3
        }
    elif symbol.upper() == "ETH":
        return {
            "symbol": "ETH",
            "whale_transactions_24h": 1200,
            "exchange_inflow": 15000,
            "exchange_outflow": 14000,
            "net_flow": 1000
        }
    return {"error": "On-chain data not available for this asset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
