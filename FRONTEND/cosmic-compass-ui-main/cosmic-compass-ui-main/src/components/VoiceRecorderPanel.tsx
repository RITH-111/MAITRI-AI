import { useState, useRef, useEffect } from "react";
import { analyzeVoiceFile, checkVoiceHealth } from "@/services/emotionApi";
import { Mic, MicOff, RefreshCw, Loader2 } from "lucide-react";

const emotionColors: Record<string, string> = {
  happy: "#4CAF50",
  sad: "#2196F3",
  angry: "#f44336",
  fear: "#9C27B0",
  disgust: "#FF9800",
  surprise: "#FFEB3B",
  stress: "#FF5722",
  neutral: "#9E9E9E",
};

const VoiceRecorderPanel = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkVoiceHealth().then(setConnected);
  }, []);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const startRecording = async () => {
    setError(null);
    setResult(null);
    setAudioBlob(null);
    setRecordingTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        await analyzeAudio(blob);
      };

      mediaRecorder.start(100);
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const audioFile = new File([blob], "recording.wav", { type: "audio/wav" });
      const data = await analyzeVoiceFile(audioFile);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to connect to voice analysis backend. Make sure Flask is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setAudioBlob(null);
    setResult(null);
    setError(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${connected === null ? "bg-yellow-400" : connected ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-muted-foreground">
          {connected === null ? "Checking backend..." : connected ? "Voice analysis backend connected" : "Backend not connected — make sure Flask is running on port 5001"}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {!recording && !audioBlob && (
          <button
            onClick={startRecording}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center gap-2"
          >
            <Mic size={16} />
            Start Recording
          </button>
        )}

        {recording && (
          <button
            onClick={stopRecording}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25 transition-all flex items-center gap-2"
          >
            <MicOff size={16} />
            Stop & Analyze ({formatTime(recordingTime)})
          </button>
        )}

        {audioBlob && !loading && (
          <button
            onClick={retake}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Record Again
          </button>
        )}
      </div>

      {/* Recording indicator */}
      {recording && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          Recording... Speak now
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Analyzing emotion from voice...
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* Results */}
      {result && result.emotion && (
        <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-secondary/20">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Detected Emotion:</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: emotionColors[result.emotion_lower] ?? "#9E9E9E" }}
            >
              {result.emotion.toUpperCase()}
            </span>
            <span className="text-sm text-muted-foreground">
              {result.confidence?.toFixed(1) ?? "N/A"}% confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Energy</div>
              <div className="text-sm font-semibold text-foreground">
                {result.energy?.toFixed(4) ?? "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pitch (Hz)</div>
              <div className="text-sm font-semibold text-foreground">
                {result.pitch?.toFixed(2) ?? "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderPanel;