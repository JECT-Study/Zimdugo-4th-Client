import { m } from "@repo/i18n";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";
import type { MyLockerReportDetail } from "#/shared/api/my-page";

const formatFloorLabel = (detail: MyLockerReportDetail): string => {
  if (!detail.hasFloor) {
    return m.report_floor_none();
  }

  if (detail.floorNumber == null) {
    return "-";
  }

  const scopeLabel =
    detail.floorType === "UNDERGROUND"
      ? m.report_floor_underground()
      : m.report_floor_ground();

  return `${scopeLabel} ${detail.floorNumber}${m.report_history_item_floor_unit()}`;
};

const formatPriceLabel = (detail: MyLockerReportDetail): string => {
  if (detail.isFree) {
    return m.report_price_free();
  }

  if (detail.minPrice == null && detail.maxPrice == null) {
    return m.locker_detail_price_not_provided();
  }

  if (
    detail.minPrice != null &&
    detail.maxPrice != null &&
    detail.minPrice !== detail.maxPrice
  ) {
    return m.locker_detail_price_range({
      min: String(detail.minPrice),
      max: String(detail.maxPrice),
    });
  }

  const price = detail.minPrice ?? detail.maxPrice;
  return price == null
    ? m.locker_detail_price_not_provided()
    : `${price.toLocaleString()}원`;
};

export const formatReportDetailRows = (detail: MyLockerReportDetail) => [
  {
    label: m.my_history_item_type(),
    value: getLockerTypeLabel(detail.lockerType ?? undefined) || "-",
  },
  {
    label: m.my_history_item_floor(),
    value: formatFloorLabel(detail),
  },
  {
    label: m.my_history_item_price(),
    value: formatPriceLabel(detail),
  },
];
