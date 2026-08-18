export const LOCKER_CORRECTION_REASON = {
  Closed: "CLOSED",
  WrongLocation: "WRONG_LOCATION",
  WrongOperatingHours: "WRONG_OPERATING_HOURS",
  MissingSize: "MISSING_SIZE",
  WrongPhoto: "WRONG_PHOTO",
  WrongPrice: "WRONG_PRICE",
  Other: "OTHER",
} as const;

export type LockerCorrectionReason =
  (typeof LOCKER_CORRECTION_REASON)[keyof typeof LOCKER_CORRECTION_REASON];

export const MAX_LOCKER_CORRECTION_DETAILS_LENGTH = 255;

export interface LockerCorrectionRequest {
  reason: LockerCorrectionReason;
  details: string | null;
}
