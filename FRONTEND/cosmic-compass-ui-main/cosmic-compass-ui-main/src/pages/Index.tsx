import { motion } from "framer-motion";
import { ScanFace, AudioLines, Cpu, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/FeatureCard";
import StarField from "@/components/StarField";
import LogoBadge from "@/components/LogoBadge";

const Index = () => {
  return (
    <div className="relative min-h-screen cosmic-bg">
      <StarField />

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 glow-accent-strong">
              <LogoBadge />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Welcome to <span className="text-gradient">Maitri AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            AI Companion for Emotional Awareness in Space Missions
          </p>
          <Link
            to="/multimodal-detection"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all glow-accent-strong"
          >
            Explore Detection
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={ScanFace}
            title="Face Emotion Detection"
            description="Analyze facial expressions to identify emotional states using advanced computer vision models."
            delay={0.1}
          />
          <FeatureCard
            icon={AudioLines}
            title="Voice Emotion Detection"
            description="Detect emotional cues from voice patterns, tone variations, and speech characteristics."
            delay={0.2}
          />
          <FeatureCard
            icon={Cpu}
            title="Sensor Vitals Monitoring"
            description="Monitor physiological signals including heart rate, HRV, and skin temperature for well-being assessment."
            delay={0.3}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Maitri AI — Emotional Awareness Platform
          </span>
          <button className="px-5 py-2 rounded-xl bg-secondary border border-border/50 text-sm text-secondary-foreground hover:bg-surface-hover transition-colors">
            Contact Us
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
