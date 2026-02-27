import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaPath?: string;
  delay?: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  ctaLabel = "Open Chatbot",
  ctaPath = "/chatbot",
  delay = 0,
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-8 flex flex-col gap-5 glow-accent hover:glow-accent-strong transition-shadow duration-500"
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{description}</p>
    <Link
      to={ctaPath}
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-sm font-medium hover:bg-primary/20 transition-colors w-fit"
    >
      {ctaLabel}
    </Link>
  </motion.div>
);

export default FeatureCard;
