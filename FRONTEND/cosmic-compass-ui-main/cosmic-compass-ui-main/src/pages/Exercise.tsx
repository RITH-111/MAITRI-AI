import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

const Exercise = () => {
  const navigate = useNavigate();
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [timer, setTimer] = useState(0);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const phaseMessages = {
    inhale: "Breathe in slowly...",
    hold: "Hold your breath...",
    exhale: "Breathe out gently...",
    rest: "Rest and Prepare...",
  };

  useEffect(() => {
    if (isBreathing) {
      startBreathingCycle();
      startTimer();
    } else {
      stopBreathing();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBreathing]);

  const startBreathingCycle = () => {
    setCurrentPhase("inhale");
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        if (prev === "exhale") return "rest";
        return "inhale";
      });
    }, 2000);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= 30) {
          setIsBreathing(false);
          setTimer(30);
          return;
        }
        setTimer(elapsed);
      }
    }, 1000);
  };

  const stopBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetSession = () => {
    setIsBreathing(false);
    setTimer(0);
    setCurrentPhase("inhale");
    startTimeRef.current = null;
  };

  const toggleSound = (soundType: string) => {
    if (activeSound === soundType) {
      setActiveSound(null);
    } else {
      setActiveSound(soundType);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen cosmic-bg">
      <StarField />
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Close Button */}
        <button
          onClick={() => navigate("/chatbot")}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-xl hover:scale-110 backdrop-blur-md"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        <div className="max-w-md mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
            Calm
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Find your center through breath
          </p>

          <div className="glass-card p-8 rounded-2xl text-center">
            <div
              className={`w-48 h-48 mx-auto mb-8 rounded-full border-2 border-border/40 flex items-center justify-center transition-all duration-3000 ${
                isBreathing
                  ? currentPhase === "inhale"
                    ? "scale-125 bg-primary/20"
                    : currentPhase === "exhale"
                    ? "scale-90 bg-primary/10"
                    : "scale-105 bg-primary/15"
                  : "scale-100 bg-surface"
              }`}
              onClick={() => setIsBreathing(!isBreathing)}
            >
              <div className="text-foreground text-xl font-light">Breathe</div>
            </div>

            <div
              className={`text-xl font-light mb-6 transition-opacity duration-500 ${
                isBreathing ? "opacity-100" : "opacity-50"
              }`}
            >
              {isBreathing ? phaseMessages[currentPhase] : "Click the circle to begin"}
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  isBreathing
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isBreathing ? <Pause size={18} /> : <Play size={18} />}
                {isBreathing ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetSession}
                className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border/50 rounded-xl text-foreground hover:bg-surface-hover transition-colors"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>

            <div className="flex gap-3 justify-center mb-6 flex-wrap">
              {["rain", "ocean", "forest", "silence"].map((sound) => (
                <button
                  key={sound}
                  onClick={() => toggleSound(sound)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeSound === sound
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary border border-border/50 text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {sound.charAt(0).toUpperCase() + sound.slice(1)}
                </button>
              ))}
            </div>

            <div className="text-2xl font-light text-foreground">
              {formatTime(timer)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exercise;

