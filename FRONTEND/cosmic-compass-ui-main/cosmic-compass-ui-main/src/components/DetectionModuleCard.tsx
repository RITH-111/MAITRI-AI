import { useState } from "react";
import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import { MessageCircle } from "lucide-react";
import FaceWebcamPanel from "./FaceWebcamPanel";
import VoiceRecorderPanel from "./VoiceRecorderPanel";

interface DetectionModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  startLabel?: string;
  stopLabel?: string;
  result?: string | null;
  delay?: number;
  showWebcam?: boolean;
  showVoice?: boolean;
}

const DetectionModuleCard = ({
  icon: Icon,
  title,
  description,
  startLabel = "Start Detecting",
  stopLabel = "Stop Detecting",
  result = null,
  delay = 0,
  showWebcam = false,
  showVoice = false,
}: DetectionModuleCardProps) => {
  const [detecting, setDetecting] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-8 glow-accent"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
            <StatusBadge status={detecting ? "detecting" : "idle"} />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

          {showVoice ? (
            <VoiceRecorderPanel />
          ) : showWebcam ? (
            <FaceWebcamPanel />
          ) : (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setDetecting(!detecting)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    detecting
                      ? "bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25"
                      : "bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20"
                  }`}
                >
                  {detecting ? stopLabel : startLabel}
                </button>
                <button
                  disabled={!result}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary border border-border/50 text-muted-foreground disabled:opacity-40 transition-colors"
                >
                  View Result
                </button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Result:{" "}
                <span className="text-foreground/60 italic">
                  {result ?? "No data available"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border/30">
        <Link
          to="/chatbot"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <MessageCircle size={16} />
          Open Maitri Chatbot
        </Link>
      </div>
    </motion.div>
  );
};

export default DetectionModuleCard;