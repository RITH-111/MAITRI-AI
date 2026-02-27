FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache-dir flask requests

COPY app.py .
COPY templates ./templates

EXPOSE 9000

CMD ["python", "app.py"]
