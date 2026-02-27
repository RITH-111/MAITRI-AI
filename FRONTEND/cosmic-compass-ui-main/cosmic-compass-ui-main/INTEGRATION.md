# Maitri Core Integration Guide

This document explains how the frontend is integrated with the maitri-core backend API.

## Overview

The frontend communicates with the maitri-core Flask backend running on port 9000. The integration includes:
- Text-based conversations
- Voice-based conversations (with audio recording)
- Text-to-Speech (TTS) audio playback
- Conversation state management

## API Configuration

The API base URL is configured in `src/lib/maitri-api.ts`. By default, it uses:
- **Default URL**: `http://localhost:9000`
- **Environment Variable**: `VITE_MAITRI_API_URL` (optional)

To change the API URL, you can:
1. Set the environment variable `VITE_MAITRI_API_URL` in your `.env.local` file
2. Or modify the default value in `src/lib/maitri-api.ts`

## API Endpoints Used

### 1. `/invoke` (POST)
Initializes a new conversation based on detected emotion.

**Request:**
```json
{
  "emotion": "neutral" | "happy" | "sad" | "angry" | "fear" | "surprise" | "disgust" | "stress"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "emotion": "neutral",
  "response_text": "Hello! How can I help you today?",
  "audio_url": "http://localhost:5000/audio/xxx.wav"
}
```

### 2. `/respond-text` (POST)
Sends a text message and receives a text + audio response.

**Request:**
```json
{
  "conversation_id": "uuid",
  "text": "User's message"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "response_text": "AI's response",
  "audio_url": "http://localhost:5000/audio/xxx.wav"
}
```

### 3. `/respond` (POST)
Sends an audio file (voice recording) and receives transcription + text + audio response.

**Request:**
- FormData with:
  - `conversation_id`: string
  - `file`: audio file (WAV format)

**Response:**
```json
{
  "conversation_id": "uuid",
  "transcription": "Transcribed user speech",
  "response_text": "AI's response",
  "audio_url": "http://localhost:5000/audio/xxx.wav"
}
```

## Frontend Implementation

### Files Modified/Created

1. **`src/lib/maitri-api.ts`** (NEW)
   - Contains all API service functions
   - Handles HTTP requests to maitri-core
   - Includes audio playback utility

2. **`src/pages/Chatbot.tsx`** (UPDATED)
   - Integrated with maitri-core API
   - Implements voice recording using MediaRecorder API
   - Manages conversation state (conversation_id)
   - Handles loading states and error messages
   - Plays TTS audio responses automatically

### Key Features

1. **Conversation Management**
   - First message initializes conversation with `/invoke`
   - Subsequent messages use `/respond-text` or `/respond`
   - Conversation ID is stored in component state

2. **Voice Recording**
   - Uses browser MediaRecorder API
   - Records audio when microphone button is clicked
   - Stops recording on second click
   - Sends audio file to `/respond` endpoint

3. **Audio Playback**
   - Automatically plays TTS responses
   - Manual replay button available on each assistant message
   - Handles audio playback errors gracefully

4. **Error Handling**
   - Toast notifications for errors
   - Graceful fallbacks
   - User-friendly error messages

## Setup Instructions

1. **Start the maitri-core backend**
   ```bash
   cd BACKEND/maitri-ai/maitri-core
   python app.py
   ```
   The backend should run on `http://localhost:9000`

2. **Configure API URL (optional)**
   Create a `.env.local` file in the frontend root:
   ```
   VITE_MAITRI_API_URL=http://localhost:9000
   ```

3. **Start the frontend**
   ```bash
   cd FRONTEND/cosmic-compass-ui-main/cosmic-compass-ui-main
   npm run dev
   ```

4. **Test the integration**
   - Navigate to `/chatbot` route
   - Send a text message or use voice recording
   - Verify responses are received and audio plays

## CORS Configuration

If you encounter CORS errors, ensure your maitri-core backend allows requests from the frontend origin. You may need to add CORS headers in `app.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins, or configure specific origins
```

## Troubleshooting

1. **API Connection Errors**
   - Verify maitri-core is running on port 9000
   - Check API URL configuration
   - Check browser console for CORS errors

2. **Voice Recording Issues**
   - Ensure microphone permissions are granted
   - Check browser compatibility (MediaRecorder API)
   - Verify audio format is WAV

3. **Audio Playback Issues**
   - Check TTS service is running (port 5000)
   - Verify audio URLs are accessible
   - Check browser audio permissions

## Future Enhancements

- Integrate emotion detection from MultimodalDetection page
- Add conversation history persistence
- Implement conversation export/import
- Add support for multiple conversation threads
- Improve error recovery and retry logic

