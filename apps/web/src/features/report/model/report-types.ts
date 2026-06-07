/** @see docs/features/ep-02-report.md */

export type IndoorOutdoorType = "INDOOR" | "OUTDOOR";

export type FloorType = "ABOVE_GROUND" | "UNDERGROUND";

export type LockerType =
  | "MUSEUM"
  | "SUBWAY_STATION"
  | "DEPARTMENT_STORE"
  | "CONVENIENCE_STORE"
  | "PUBLIC_OFFICE"
  | "PRIVATE_LOCKER"
  | "TRAIN_STATION"
  | "ETC";

export type SizeType = "SMALL" | "MEDIUM" | "LARGE";

export type ReportFormValues = {
  roadAddress: string;
  latitude: number | null;
  longitude: number | null;
  locationConsentAgreed: boolean;
  indoorOutdoorType: IndoorOutdoorType | null;
  lockerType: LockerType | null;
  hasFloor: boolean | null;
  floorType: FloorType | null;
  floorNumber: number | null;
  isFree: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  startTime: string | null;
  endTime: string | null;
  sizeTypes: SizeType[];
  additionalInfo: string;
  imageUrl: string | null;
};

export type LockerReportCreateRequest = ReportFormValues;

export type ReportSectionId =
  | "location"
  | "classification"
  | "floor"
  | "size"
  | "agreement"
  | "price"
  | "time"
  | "additionalInfo"
  | "photo";

export const STEP_1_FIELDS = [
  "roadAddress",
  "latitude",
  "longitude",
  "hasFloor",
  "floorType",
  "floorNumber",
  "indoorOutdoorType",
  "lockerType",
  "sizeTypes",
] as const satisfies readonly (keyof ReportFormValues)[];

export const STEP_2_FIELDS = [
  "locationConsentAgreed",
  "isFree",
  "minPrice",
  "maxPrice",
  "startTime",
  "endTime",
  "additionalInfo",
  "imageUrl",
] as const satisfies readonly (keyof ReportFormValues)[];

export type ReportStep1Field = (typeof STEP_1_FIELDS)[number];
export type ReportStep2Field = (typeof STEP_2_FIELDS)[number];

export const MAX_REPORT_PHOTOS = 1;
export const MAX_REPORT_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_REPORT_ADDITIONAL_INFO_LENGTH = 255;

export const REPORT_PRICE_MIN = 1_000;
export const REPORT_PRICE_MAX = 100_000;

export const LOCKER_TYPES = [
  "MUSEUM",
  "SUBWAY_STATION",
  "DEPARTMENT_STORE",
  "CONVENIENCE_STORE",
  "PUBLIC_OFFICE",
  "PRIVATE_LOCKER",
  "TRAIN_STATION",
  "ETC",
] as const satisfies readonly LockerType[];

export const SIZE_TYPES = ["SMALL", "MEDIUM", "LARGE"] as const satisfies readonly SizeType[];

export const AGGREGATE_VALIDATION_FIELDS = [
  "floorInputValid",
  "enumInputValid",
  "priceInputValid",
  "operatingHoursValid",
  "sizeTypesValid",
] as const;

export type AggregateValidationField = (typeof AGGREGATE_VALIDATION_FIELDS)[number];

export type UploadCategory = "PROFILE" | "LOCKER_REPORT";

export const UPLOAD_CATEGORY_LOCKER_REPORT =
  "LOCKER_REPORT" as const satisfies UploadCategory;

export type UploadCreateRequest = {
  category: UploadCategory;
  fileName: string;
  contentType: string;
};

export type UploadCreateData = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresAt: string;
};

export type RestResponse<T> = {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  data: T;
};

export type ValidationErrorItem = {
  field: string;
  message: string;
  rejectedValue: unknown;
};

export type ValidationErrorResponse = {
  code: "VALIDATION_FAILED";
  message: string;
  status: 400;
  timestamp: string;
  path: string;
  traceId: string;
  validationErrors: ValidationErrorItem[];
};

export type LockerReportCreateResponse = {
  reportId: number;
  name: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  reportStatus: string;
};

export const reportDefaultValues: ReportFormValues = {
  roadAddress: "",
  latitude: null,
  longitude: null,
  locationConsentAgreed: false,
  indoorOutdoorType: null,
  lockerType: null,
  hasFloor: null,
  floorType: null,
  floorNumber: null,
  isFree: null,
  minPrice: null,
  maxPrice: null,
  startTime: null,
  endTime: null,
  sizeTypes: [],
  additionalInfo: "",
  imageUrl: null,
};
