/**
 * Maitri Core API Service
 * Handles all communication with the maitri-core backend
 */

const API_BASE_URL = import.meta.env.VITE_MAITRI_API_URL || 'http://localhost:8000';

export interface InvokeResponse {
  conversation_id: string;
  emotion: string;
  response_text: string;
  audio_url: string;
}

export interface RespondTextResponse {
  conversation_id: string;
  response_text: string;
  audio_url: string;
}

export interface RespondVoiceResponse {
  conversation_id: string;
  transcription: string;
  response_text: string;
  audio_url: string;
}

export interface ApiError {
  error: string;
}

/**
 * Auto-invoke conversation based on detected emotion
 */
export async function invokeConversation(emotion: string): Promise<InvokeResponse> {
  const response = await fetch(`${API_BASE_URL}/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emotion }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to invoke conversation');
  }

  return response.json();
}

/**
 * Send text message and get response
 */
export async function respondWithText(
  conversationId: string,
  text: string
): Promise<RespondTextResponse> {
  const response = await fetch(`${API_BASE_URL}/respond-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      text,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to get text response');
  }

  return response.json();
}

/**
 * Send voice message (audio file) and get response
 */
export async function respondWithVoice(
  conversationId: string,
  audioFile: File
): Promise<RespondVoiceResponse> {
  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('file', audioFile);

  const response = await fetch(`${API_BASE_URL}/respond`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to get voice response');
  }

  return response.json();
}

/**
 * Play audio from URL
 */
export function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Failed to play audio'));
    audio.play().catch(reject);
  });
}

