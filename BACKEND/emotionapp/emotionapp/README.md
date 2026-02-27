# Voice Emotion Analysis API

Flask API for analyzing emotions from voice recordings using librosa and sounddevice.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the API

```bash
python app.py
```

The API will start on `http://localhost:5001`

## Endpoints

### Health Check
- `GET /health` - Check if API is running

### Analyze Voice File
- `POST /analyze-voice`
  - Body: `multipart/form-data` with `audio` file
  - Returns: Emotion analysis with energy, pitch, and confidence

### Record and Analyze
- `POST /record-voice`
  - Body: `JSON` with optional `duration` (default: 10 seconds)
  - Returns: Emotion analysis from recorded audio

## Response Format

```json
{
  "emotion": "Happy",
  "emotion_lower": "happy",
  "energy": 0.065,
  "pitch": 220.5,
  "confidence": 75.5
}
```

## Detected Emotions

- Happy
- Sad
- Angry
- Fear
- Disgust
- Surprise
- Stress
- Neutral



