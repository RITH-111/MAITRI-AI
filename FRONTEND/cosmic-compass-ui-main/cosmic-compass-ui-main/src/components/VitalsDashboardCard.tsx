import { motion } from "framer-motion";
import { Heart, Activity, Moon, Thermometer, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

interface Vital {
  label: string;
  value: string | number | null;
  unit: string;
  icon: React.ReactNode;
}

interface VitalsDashboardCardProps {
  vitals?: Vital[];
}

const defaultVitals: Vital[] = [
  { label: "Heart Rate", value: null, unit: "bpm", icon: <Heart className="w-5 h-5 text-primary" /> },
  { label: "HRV", value: null, unit: "ms", icon: <Activity className="w-5 h-5 text-primary" /> },
  { label: "Sleep Duration", value: null, unit: "hrs", icon: <Moon className="w-5 h-5 text-primary" /> },
  { label: "Skin Temp", value: null, unit: "°C", icon: <Thermometer className="w-5 h-5 text-primary" /> },
];

const VitalsDashboardCard = ({ vitals = defaultVitals }: VitalsDashboardCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="glass-card p-8 glow-accent"
  >
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <h3 className="font-display text-xl font-semibold text-foreground">Vitals Dashboard</h3>
      <StatusBadge status="inactive" />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {vitals.map((v) => (
        <div
          key={v.label}
          className="bg-surface/60 border border-border/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
        >
          {v.icon}
          <span className="text-xs text-muted-foreground">{v.label}</span>
          <span className="font-display text-lg font-semibold text-foreground">
            {v.value !== null ? `${v.value} ${v.unit}` : "—"}
          </span>
        </div>
      ))}
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

export default VitalsDashboardCard;
