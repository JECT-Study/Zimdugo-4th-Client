import type {
  FloorType,
  IndoorOutdoorType,
  LockerType,
  ReportFormValues,
  SizeType,
} from "#/features/report/model/report-types";
import type { MyLockerReportDetail } from "#/shared/api/my-page";

export const mapReportDetailToFormValues = (
  detail: MyLockerReportDetail,
): ReportFormValues => ({
  roadAddress: detail.roadAddress,
  latitude: detail.latitude,
  longitude: detail.longitude,
  locationConsentAgreed: detail.locationConsentAgreed,
  indoorOutdoorType: detail.indoorOutdoorType as IndoorOutdoorType | null,
  lockerType: detail.lockerType as LockerType | null,
  hasFloor: detail.hasFloor,
  floorType: detail.floorType as FloorType | null,
  floorNumber: detail.floorNumber,
  isFree: detail.isFree,
  minPrice: detail.minPrice,
  maxPrice: detail.maxPrice,
  startTime: detail.startTime,
  endTime: detail.endTime,
  sizeTypes: detail.sizeTypes as SizeType[],
  additionalInfo: detail.additionalInfo ?? "",
  imageUrl: detail.imageUrl,
});
