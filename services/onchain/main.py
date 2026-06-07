from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

app = FastAPI()


class OnChainResponse(BaseModel):
    symbol: str
    activeAddresses: Optional[int] = None
    transactionCount: Optional[int] = None
    networkHashrate: Optional[str] = None
    totalSupply: Optional[str] = None
    stakedPercentage: Optional[float] = None
    isMockData: bool


MOCK_DATA = {
    "BTC": OnChainResponse(
        symbol="BTC",
        activeAddresses=850000,
        transactionCount=350000,
        networkHashrate="580 EH/s",
        totalSupply="21000000",
        stakedPercentage=None,
        isMockData=True,
    ),
    "ETH": OnChainResponse(
        symbol="ETH",
        activeAddresses=420000,
        transactionCount=1100000,
        networkHashrate="1000 TH/s",
        totalSupply="120000000",
        stakedPercentage=27.5,
        isMockData=True,
    ),
    "SOL": OnChainResponse(
        symbol="SOL",
        activeAddresses=950000,
        transactionCount=5000000,
        networkHashrate=None,
        totalSupply="590000000",
        stakedPercentage=68.0,
        isMockData=True,
    ),
}


@app.get("/onchain/{symbol}", response_model=OnChainResponse)
def get_onchain_metrics(symbol: str):
    data = MOCK_DATA.get(symbol.upper())
    if not data:
        raise HTTPException(status_code=404, detail=f"On-chain data not available for {symbol.upper()}")
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
