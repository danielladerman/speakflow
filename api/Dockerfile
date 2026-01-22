# SpeakFlow API Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy contracts package first (for caching)
COPY contracts/pyproject.toml contracts/
COPY contracts/speakflow_contracts contracts/speakflow_contracts/

# Install contracts
RUN pip install --no-cache-dir ./contracts

# Copy API package
COPY api/pyproject.toml api/
COPY api/app api/app/
COPY api/alembic.ini api/
COPY api/alembic api/alembic/

# Install API dependencies
RUN pip install --no-cache-dir ./api

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
