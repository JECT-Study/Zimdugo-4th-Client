import { sortSizeTypes } from "#/entities/locker/lib/sort-size-types";
import type {
  LockerReportCreateRequest,
  ReportFormValues,
} from "#/features/report/model/report-types";

const requireReportValue = <T>(value: T | null, fieldName: string): T => {
  if (value === null) {
    throw new Error(`${fieldName} is required before creating report payload.`);
  }

  return value;
};

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
  if (values.isFree === true) {
    minPrice = 0;
    maxPrice = 0;
  } else if (values.isFree === null) {
    minPrice = null;
    maxPrice = null;
  }

  return {
    roadAddress: values.roadAddress.trim(),
    latitude: requireReportValue(values.latitude, "latitude"),
    longitude: requireReportValue(values.longitude, "longitude"),
    locationConsentAgreed: values.locationConsentAgreed,
    indoorOutdoorType: requireReportValue(
      values.indoorOutdoorType,
      "indoorOutdoorType",
    ),
    lockerType: requireReportValue(values.lockerType, "lockerType"),
    floorType,
    floorNumber,
    minPrice,
    maxPrice,
    startTime: values.startTime,
    endTime: values.endTime,
    sizeTypes: sortSizeTypes(values.sizeTypes),
    additionalInfo: values.additionalInfo.trim(),
    imageUrl: values.imageUrl,
  };
}
