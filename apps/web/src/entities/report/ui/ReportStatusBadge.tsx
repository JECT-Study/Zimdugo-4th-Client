import type { ReportListItemStatus } from "./ReportListItem";
import { reportStatus, statusVariants } from "./ReportListItem.css.ts";

export interface ReportStatusBadgeProps {
  status: ReportListItemStatus;
  label: string;
  className?: string;
}

export function ReportStatusBadge({
  status,
  label,
  className,
}: ReportStatusBadgeProps) {
  return (
    <span
      className={[reportStatus, statusVariants[status], className]
        .filter(Boolean)
        .join(" ")}
      data-slot="status-badge"
    >
      {label}
    </span>
  );
}
