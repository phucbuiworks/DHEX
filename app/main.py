import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Ensure we always override any default shell variables with the current .env file
load_dotenv(override=True)

app = FastAPI(title="DH Exchange API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for everything inside /static
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def root():
    return FileResponse("app/static/index.html")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/convert")
async def convert(
    amount: float = Query(..., gt=0),
    base_currency: str = Query(..., min_length=3, max_length=3),
    target_currency: str = Query(..., min_length=3, max_length=3),
):
    api_key = os.environ.get("EXCHANGE_RATE_API_KEY", "").strip(' "\'')
    if not api_key:
        raise HTTPException(
            status_code=500, detail="EXCHANGE_RATE_API_KEY not configured")

    base_currency = base_currency.upper()
    target_currency = target_currency.upper()

    url = f"https://api.fastforex.io/fetch-one?from={base_currency}&to={target_currency}&api_key={api_key}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            data = response.json()

            if "result" in data and target_currency in data["result"]:
                rate = data["result"][target_currency]
                converted_amount = amount * rate

                return {
                    "base_currency": base_currency,
                    "target_currency": target_currency,
                    "amount": amount,
                    "converted_amount": converted_amount,
                    "conversion_rate": rate
                }
            else:
                error_msg = data.get("error", "Unknown API error")
                raise HTTPException(
                    status_code=400, detail=f"FastForex API Error: {error_msg}")
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503, detail="Downstream API connection error")
