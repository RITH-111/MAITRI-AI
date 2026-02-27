import numpy as np
import cv2
from deepface import DeepFace

def analyze_face(file):
    try:
        # Read image from uploaded file
        file_bytes = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        result = DeepFace.analyze(
            frame,
            actions=['emotion'],
            enforce_detection=False
        )

        emotion = result[0]['dominant_emotion']
        confidence = result[0]['emotion'][emotion]
        all_emotions = {k: float(v) for k, v in result[0]['emotion'].items()}

        return {
            "status": "success",
            "dominant_emotion": emotion,
            "confidence": round(float(confidence), 2),
            "all_emotions": all_emotions
        }
    except Exception as e:
        return {"error": str(e)}