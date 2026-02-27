from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import uuid

app = Flask(__name__)
CORS(app)

WHISPER_URL = "http://maitri-whisper:8000/transcribe"
OLLAMA_URL = "http://ollama:11434/api/generate"
TTS_URL = "http://127.0.0.1:5000/speak"
TTS_PUBLIC_BASE = "http://127.0.0.1:5000"
TEMPLATE_DIR = "templates"

conversations = {}


def load_template(emotion):
    filepath = os.path.join(TEMPLATE_DIR, f"{emotion}.txt")
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r") as f:
        return f.read()


def generate_response(messages):
    prompt = "You are Maitri AI, a calm and supportive companion.\n\n"
    prompt += "Conversation so far:\n\n"

    for msg in messages:
        if msg["role"] == "user":
            prompt += f"User: {msg['content']}\n"
        elif msg["role"] == "assistant":
            prompt += f"Maitri: {msg['content']}\n"

    prompt += "\nNow respond as Maitri. Do not simulate the user. Only provide Maitri's next reply."

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        }
    )

    if response.status_code != 200:
        return None

    return response.json().get("response")


def generate_audio(text):
    response = requests.post(
        TTS_URL,
        json={"text": text}
    )

    if response.status_code != 200:
        return None

    audio_path = response.json().get("audio_url")
    if not audio_path:
        return None

    return audio_path


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/invoke", methods=["POST"])
def invoke():
    data = request.json
    emotion = data.get("emotion")

    if not emotion:
        return jsonify({"error": "Emotion not provided"}), 400

    template = load_template(emotion)
    if not template:
        return jsonify({"error": "Invalid emotion"}), 400

    conversation_id = str(uuid.uuid4())

    system_prompt = template.replace(
        "{user_input}",
        "The astronaut has not spoken yet. Begin the conversation appropriately."
    )

    conversations[conversation_id] = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"The astronaut is currently experiencing {emotion}. Begin supportive conversation immediately."
        }
    ]

    response_text = generate_response(conversations[conversation_id])

    if not response_text:
        return jsonify({"error": "LLM failed"}), 500

    conversations[conversation_id].append({
        "role": "assistant",
        "content": response_text
    })

    audio_url = generate_audio(response_text)

    if not audio_url:
        return jsonify({"error": "TTS failed"}), 500

    return jsonify({
        "conversation_id": conversation_id,
        "emotion": emotion,
        "response_text": response_text,
        "audio_url": audio_url
    })


@app.route("/respond-text", methods=["POST"])
def respond_text():
    data = request.json
    conversation_id = data.get("conversation_id")
    user_input = data.get("text")

    if conversation_id not in conversations:
        return jsonify({"error": "Invalid conversation"}), 400

    conversations[conversation_id].append({
        "role": "user",
        "content": user_input
    })

    response_text = generate_response(conversations[conversation_id])

    if not response_text:
        return jsonify({"error": "LLM failed"}), 500

    conversations[conversation_id].append({
        "role": "assistant",
        "content": response_text
    })

    audio_url = generate_audio(response_text)

    if not audio_url:
        return jsonify({"error": "TTS failed"}), 500

    return jsonify({
        "conversation_id": conversation_id,
        "response_text": response_text,
        "audio_url": audio_url
    })


@app.route("/respond", methods=["POST"])
def respond():
    conversation_id = request.form.get("conversation_id")

    if conversation_id not in conversations:
        return jsonify({"error": "Invalid conversation"}), 400

    if "file" not in request.files:
        return jsonify({"error": "Audio file not provided"}), 400

    file = request.files["file"]

    whisper_response = requests.post(
        WHISPER_URL,
        files={"file": file}
    )

    if whisper_response.status_code != 200:
        return jsonify({"error": "Whisper failed"}), 500

    transcription = whisper_response.json().get("text")

    conversations[conversation_id].append({
        "role": "user",
        "content": transcription
    })

    response_text = generate_response(conversations[conversation_id])

    if not response_text:
        return jsonify({"error": "LLM failed"}), 500

    conversations[conversation_id].append({
        "role": "assistant",
        "content": response_text
    })

    audio_url = generate_audio(response_text)

    if not audio_url:
        return jsonify({"error": "TTS failed"}), 500

    return jsonify({
        "conversation_id": conversation_id,
        "transcription": transcription,
        "response_text": response_text,
        "audio_url": audio_url
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)