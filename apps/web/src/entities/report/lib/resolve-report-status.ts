import { m } from "@repo/i18n";
import type { ReportListItemStatus } from "../ui/ReportListItem";

export type LockerReportApiStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

export type ReportStatusDisplay = {
  variant: ReportListItemStatus;
  label: string;
};

const resolveStatusLabel = (variant: ReportListItemStatus): string => {
  switch (variant) {
    case "pending":
      return m.report_status_pending();
    case "approved":
      return m.report_status_approved();
    case "rejected":
      return m.report_status_rejected();
  }
};

const API_STATUS_TO_VARIANT: Record<
  LockerReportApiStatus,
  ReportListItemStatus
> = {
  SUBMITTED: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const resolveReportStatusDisplay = (
  reportStatus: string | null | undefined,
): ReportStatusDisplay | null => {
  if (reportStatus == null || reportStatus.trim() === "") {
    return null;
  }

  const normalizedStatus = reportStatus.trim().toUpperCase();
  const variant =
    API_STATUS_TO_VARIANT[normalizedStatus as LockerReportApiStatus];

  if (variant == null) {
    return null;
  }

  return {
    variant,
    label: resolveStatusLabel(variant),
  };
};
