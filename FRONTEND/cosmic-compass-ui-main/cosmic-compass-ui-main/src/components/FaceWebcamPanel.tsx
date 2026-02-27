import { useState, useRef, useEffect } from "react";
import { analyzeFaceImage, checkHealth } from "@/services/emotionApi";
import { Camera, RefreshCw, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const emotionColors: Record<string, string> = {
  happy: "#4CAF50",
  sad: "#2196F3",
  angry: "#f44336",
  fear: "#9C27B0",
  disgust: "#FF9800",
  surprise: "#FFEB3B",
  neutral: "#9E9E9E",
};

const FaceWebcamPanel = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setConnected);
  }, []);

  const startCamera = async () => {
    setError(null);
    setResult(null);
    setCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCaptured(imageDataUrl);
    stopCamera();
    const blob = await (await fetch(imageDataUrl)).blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeFaceImage(file);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCaptured(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${connected === null ? "bg-yellow-400" : connected ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-muted-foreground">
          {connected === null ? "Checking backend..." : connected ? "Backend connected" : "Backend not connected — make sure Flask is running on port 9000"}
        </span>
      </div>

      {/* Video Feed */}
      {!captured && (
        <div className="rounded-xl overflow-hidden border border-border/40 bg-black/30 w-full max-w-sm aspect-video flex items-center justify-center">
          <video ref={videoRef} className={`w-full h-full object-cover ${streaming ? "block" : "hidden"}`} muted />
          {!streaming && <span className="text-muted-foreground text-sm">Camera off</span>}
        </div>
      )}

      {/* Captured Image */}
      {captured && (
        <div className="rounded-xl overflow-hidden border border-border/40 w-fit">
          <img src={captured} alt="Captured" className="max-h-48 object-contain" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {!streaming && !captured && (
          <button onClick={startCamera} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center gap-2">
            <Camera size={16} />
            Start Camera
          </button>
        )}
        {streaming && (
          <button onClick={captureAndAnalyze} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 disabled:opacity-50">
            <Camera size={16} />
            Capture & Analyze
          </button>
        )}
        {captured && (
          <button onClick={retake} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-all flex items-center gap-2">
            <RefreshCw size={16} />
            Retake
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          Analyzing emotion...
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-secondary/20">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Detected:</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-black"
              style={{ backgroundColor: emotionColors[result.dominant_emotion] ?? "#9E9E9E" }}
            >
              {result.dominant_emotion.toUpperCase()}
            </span>
            <span className="text-sm text-muted-foreground">
              {result.confidence.toFixed(1)}% confidence
            </span>
          </div>

          {/* Emotion Progress Bars */}
          <div className="space-y-2">
            {Object.entries(result.all_emotions).map(([emotion, score]) => (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{emotion}</span>
                  <span>{(score as number).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: emotionColors[emotion] ?? "#9E9E9E" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Talk to Maitri Button */}
          <button
            onClick={() => navigate(`/chatbot?emotion=${result.dominant_emotion}`)}
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Talk to Maitri
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceWebcamPanel;