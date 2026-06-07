import type {
  LockerReportCreateRequest,
  ReportFormValues,
} from "#/features/report/model/report-types";

/**
 * 폼 값 → API body. enum 재매핑 없음 — 구조 정리만 수행.
 * @see docs/features/ep-02-report.md §11
 */
export function normalizeReportPayload(
  values: ReportFormValues,
): LockerReportCreateRequest {
  const hasFloor = values.hasFloor === true;

  const floorType = hasFloor ? values.floorType : null;
  const floorNumber = hasFloor ? values.floorNumber : null;

  let minPrice = values.minPrice;
  let maxPrice = values.maxPrice;
  if (values.isFree !== false) {
    minPrice = null;
    maxPrice = null;
  }

  return {
    ...values,
    roadAddress: values.roadAddress.trim(),
    hasFloor,
    floorType,
    floorNumber,
    minPrice,
    maxPrice,
    additionalInfo: values.additionalInfo.trim(),
    imageUrl: values.imageUrl,
  };
}
