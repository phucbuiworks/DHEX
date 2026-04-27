# DH Exchange

1-page currency exchange web application using FastAPI, HTML/JS/TailwindCSS, and ExchangeRate-API.

## Local Development (with `uv`)

1. **Install `uv`**: First install `uv` (e.g., via `curl -LsSf https://astral.sh/uv/install.sh | sh` on Unix/Mac or `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` on Windows).
2. **Setup API Key**: Obtain a free API key from [ExchangeRate-API](https://www.exchangerate-api.com/).
   - Set the environment variable: `set EXCHANGE_RATE_API_KEY=your_key` (Windows) or `export EXCHANGE_RATE_API_KEY=your_key` (Linux/Mac).
3. **Run Application**:
   ```bash
   uv run uvicorn app.main:app --reload
   ```
4. **Run Tests**:
   ```bash
   uv run pytest
   ```

## Docker

Build and run via Docker:
```bash
docker build -t dhex .
docker run -p 8000:8000 -e EXCHANGE_RATE_API_KEY=your_key dhex
```

## Deployment

The CI/CD pipeline in GitHub Actions runs tests on any PR or Push. When merged to `main`, it will execute a Render deploy hook using the GitHub secret `RENDER_DEPLOY_HOOK_URL`.