import type { MyLockerReportHistoryItem } from "#/shared/api/my-page";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";

export const formatReportListDetailText = (
  item: Pick<MyLockerReportHistoryItem, "lockerType">,
) => getLockerTypeLabel(item.lockerType) || "-";
