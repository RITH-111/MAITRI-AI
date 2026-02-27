from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import os

app = Flask(__name__)

model = WhisperModel("base", device="cpu")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filepath = "audio.wav"
    file.save(filepath)

    segments, _ = model.transcribe(filepath)
    text = " ".join([segment.text for segment in segments])

    os.remove(filepath)
    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
