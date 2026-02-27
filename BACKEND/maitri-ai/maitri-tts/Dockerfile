FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    ffmpeg \
    unzip \
    libespeak-ng1 \
    && rm -rf /var/lib/apt/lists/*


RUN pip install flask


# Download Piper
RUN wget https://github.com/rhasspy/piper/releases/latest/download/piper_linux_x86_64.tar.gz \
    && tar -xzf piper_linux_x86_64.tar.gz \
    && mv piper /opt/piper \
    && chmod +x /opt/piper/piper \
    && rm piper_linux_x86_64.tar.gz

# Add Piper to PATH
ENV PATH="/opt/piper:${PATH}"
ENV LD_LIBRARY_PATH="/opt/piper:${LD_LIBRARY_PATH}"



# Create directory for voice model
RUN mkdir -p /voices

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
