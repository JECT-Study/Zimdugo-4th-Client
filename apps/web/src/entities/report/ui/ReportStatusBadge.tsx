import type { ReportStatusVariant } from "../model/report-status";
import { reportStatus, statusVariants } from "./ReportStatusBadge.css.ts";

export interface ReportStatusBadgeProps {
  status: ReportStatusVariant;
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
