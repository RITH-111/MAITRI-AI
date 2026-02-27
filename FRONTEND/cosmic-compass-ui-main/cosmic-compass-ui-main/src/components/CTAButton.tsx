import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  label: string;
  to: string;
  variant?: "primary" | "ghost";
}

const CTAButton = ({ label, to, variant = "primary" }: CTAButtonProps) => {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300";
  const styles =
    variant === "primary"
      ? `${base} bg-primary text-primary-foreground hover:brightness-110 glow-accent-strong`
      : `${base} bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20`;

  return (
    <Link to={to} className={styles}>
      {label}
      <ArrowRight size={16} />
    </Link>
  );
};

export default CTAButton;
