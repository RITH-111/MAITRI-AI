const FACE_API = "http://127.0.0.1:9000";
const VOICE_API = "http://127.0.0.1:5001";

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${FACE_API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkVoiceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${VOICE_API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeFaceImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${FACE_API}/analyze-face`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}

export async function analyzeVoiceFile(file: File) {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await fetch(`${VOICE_API}/analyze-voice`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}