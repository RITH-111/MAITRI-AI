import { ScanFace, AudioLines } from "lucide-react";
import DetectionModuleCard from "@/components/DetectionModuleCard";
import VitalsDashboardCard from "@/components/VitalsDashboardCard";
import StarField from "@/components/StarField";

const MultimodalDetection = () => {
  return (
    <div className="relative min-h-screen cosmic-bg">
      <StarField />
      <div className="relative z-10 container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Multimodal Detection
        </h1>
        <p className="text-muted-foreground mb-10 max-w-xl">
          Real-time emotional analysis through face, voice, and physiological signals.
        </p>

        <div className="space-y-6 max-w-4xl">
          <DetectionModuleCard
            icon={ScanFace}
            title="Face Emotion Detection"
            description="Capture and analyze facial micro-expressions to determine current emotional state."
            showWebcam={true}
            delay={0.1}
          />

          <DetectionModuleCard
            icon={AudioLines}
            title="Voice Emotion Analysis"
            description="Record and analyze vocal patterns, pitch, and tone for emotional cues."
            showVoice={true}
            delay={0.2}
          />

          <VitalsDashboardCard />
        </div>
      </div>
    </div>
  );
};

export default MultimodalDetection;