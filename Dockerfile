# Stage 1: Build
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1

# Copy project manifest
COPY pyproject.toml ./
# Install dependencies into the local Virtual Environment managed by uv
RUN uv sync --no-dev --no-install-project

# Copy source
COPY . .
# Install the project if needed
RUN uv sync --no-dev

# Stage 2: Runtime
FROM python:3.12-slim-bookworm

WORKDIR /app
# Copy the virtual environment from builder
COPY --from=builder /app/.venv /app/.venv
COPY . .

# Ensure the virtualenv is in PATH
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
