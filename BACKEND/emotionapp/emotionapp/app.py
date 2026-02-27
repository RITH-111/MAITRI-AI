from flask import Flask, request, jsonify
from flask_cors import CORS
import sounddevice as sd
import numpy as np
import librosa
from scipy.io.wavfile import write
import os
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/analyze-voice', methods=['POST'])
def analyze_voice():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "Empty file"}), 400

        # Save as webm first then convert
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            audio_file.save(tmp_file.name)
            temp_path = tmp_file.name

        try:
            # librosa can handle webm/wav/mp3 automatically
            audio, sr = librosa.load(temp_path, sr=16000, mono=True)
            
            if len(audio) == 0:
                return jsonify({"error": "Audio file is empty"}), 400

            energy = np.mean(np.abs(audio))
            pitch = np.mean(librosa.yin(audio, fmin=50, fmax=350))

            if energy > 0.08 and pitch > 250:
                emotion = "Surprise"
            elif energy > 0.07 and pitch < 150:
                emotion = "Angry"
            elif energy > 0.06 and 150 < pitch < 200:
                emotion = "Disgust"
            elif energy > 0.05 and pitch > 200:
                emotion = "Happy"
            elif energy < 0.03 and pitch < 150:
                emotion = "Sad"
            elif 0.03 <= energy <= 0.05 and 180 < pitch < 240:
                emotion = "Fear"
            elif energy > 0.09:
                emotion = "Stress"
            else:
                emotion = "Neutral"

            emotion_lower = emotion.lower()

            return jsonify({
                "emotion": emotion,
                "emotion_lower": emotion_lower,
                "energy": float(energy),
                "pitch": float(pitch),
                "confidence": calculate_confidence(energy, pitch)
            }), 200

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_confidence(energy, pitch):
    energy_normalized = min(energy / 0.1, 1.0)
    pitch_normalized = min(pitch / 350, 1.0)
    confidence = (energy_normalized + pitch_normalized) / 2 * 100
    return min(max(confidence, 50), 95)

if __name__ == '__main__':
    print("Starting Voice Emotion Analysis API...")
    app.run(host='0.0.0.0', port=5001, debug=True)
