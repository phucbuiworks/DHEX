import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_convert_success():
    with patch('app.main.EXCHANGE_RATE_API_KEY', 'dummy_key'):
        # Mocking the async context manager and the get method
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "base": "USD",
            "result": {
                "VND": 25000.0
            },
            "updated": "2023-01-01 12:00:00",
            "ms": 4
        }

        mock_get = AsyncMock(return_value=mock_response)

        with patch('httpx.AsyncClient.get', new=mock_get):
            response = client.get(
                "/convert?amount=1000&base_currency=USD&target_currency=VND")

            assert response.status_code == 200
            data = response.json()
            assert data["base_currency"] == "USD"
            assert data["target_currency"] == "VND"
            assert data["amount"] == 1000.0
            assert data["converted_amount"] == 25000000.0
            assert data["conversion_rate"] == 25000.0


def test_convert_missing_api_key():
    with patch('app.main.EXCHANGE_RATE_API_KEY', ''):
        response = client.get(
            "/convert?amount=1000&base_currency=USD&target_currency=VND")
        assert response.status_code == 500
        assert "not configured" in response.json()["detail"]
