# SpeakFlow Worker Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy contracts package first (for caching)
COPY contracts/pyproject.toml contracts/
COPY contracts/speakflow_contracts contracts/speakflow_contracts/
COPY contracts/fixtures contracts/fixtures/

# Install contracts
RUN pip install --no-cache-dir ./contracts

# Copy worker package
COPY worker/pyproject.toml worker/
COPY worker/app worker/app/

# Install worker dependencies (includes whisper, numpy, scipy, librosa)
RUN pip install --no-cache-dir ./worker

# Pre-download Whisper base model (optional - can be lazy-loaded)
ENV WHISPER_MODEL=base
RUN python -c "import whisper; whisper.load_model('base')" || true

# Run worker
CMD ["python", "-m", "app.worker"]
