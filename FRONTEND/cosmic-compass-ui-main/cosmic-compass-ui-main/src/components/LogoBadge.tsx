import { Brain } from "lucide-react";

const LogoBadge = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-accent">
      <Brain className="w-5 h-5 text-primary" />
    </div>
    <span className="font-display text-lg font-semibold tracking-tight text-foreground">
      Maitri <span className="text-primary">AI</span>
    </span>
  </div>
);

export default LogoBadge;
