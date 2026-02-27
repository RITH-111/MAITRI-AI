from flask import Flask, jsonify, request
from flask_cors import CORS
from face_emotion import analyze_face

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081", "http://localhost:5173"])

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/analyze-face', methods=['POST'])
def analyze_face_route():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files['image']
    result = analyze_face(file)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=9000)