## Backend Dockerfile for Cloud Run (FastAPI + Docling)
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080
WORKDIR /app

# System build tools for docling dependencies
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets $PORT; uvicorn listens on it.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
