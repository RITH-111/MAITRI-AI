FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir faster-whisper flask

COPY app.py .

EXPOSE 8000

CMD ["python", "app.py"]
