from flask import Flask, request, jsonify, send_from_directory
import subprocess
import uuid
import os

app = Flask(__name__)

VOICE_MODEL = "/voices/en_US-lessac-medium.onnx"
AUDIO_DIR = "/audio"

os.makedirs(AUDIO_DIR, exist_ok=True)


@app.route("/speak", methods=["POST"])
def speak():
    text = request.json.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(AUDIO_DIR, filename)

    command = [
        "piper",
        "--model", VOICE_MODEL,
        "--output_file", output_path
    ]

    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    process.communicate(input=text.encode())

    return jsonify({
        "audio_url": f"/audio/{filename}"
    })


@app.route("/audio/<filename>")
def get_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

