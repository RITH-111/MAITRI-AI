interface StatusBadgeProps {
  status: "idle" | "active" | "detecting" | "inactive";
  label?: string;
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  idle: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary border-primary/30",
  detecting: "bg-primary/15 text-primary border-primary/30 pulse-ring",
};

const statusLabels: Record<StatusBadgeProps["status"], string> = {
  idle: "Idle",
  inactive: "Inactive",
  active: "Active",
  detecting: "Detecting…",
};

const StatusBadge = ({ status, label }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-border/50 ${statusStyles[status]}`}
  >
    {label || statusLabels[status]}
  </span>
);

export default StatusBadge;
