export interface LockerOperatingHours {
  open: string;
  close: string;
}

export interface LockerSummaryItem {
  itemType: "LOCKER";
  lockerId: number;
  title: string;
  distanceLabel: string;
  address: string;
  categoryLabel: string;
  updatedLabel: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  updatedAt?: string;
  minPrice?: number;
  operatingHours?: LockerOperatingHours | null;
  searchKeywords?: string[];
  isOpen?: boolean;
  isFavorite?: boolean;
}

export interface LockerDetailItem extends LockerSummaryItem {
  operatingHoursLabel?: string;
  floorLabel?: string;
  priceLabel?: string;
  sizeLabel?: string;
  detailHelpText?: string;
  /** @deprecated 상세 화면에서 vote 기능 노출을 중단했다. 롤백 호환용으로만 유지한다. */
  accurateCount?: number;
  /** @deprecated 상세 화면에서 vote 기능 노출을 중단했다. 롤백 호환용으로만 유지한다. */
  inaccurateCount?: number;
  /** @deprecated 상세 화면에서 vote 기능 노출을 중단했다. 롤백 호환용으로만 유지한다. */
  isAccurateVoted?: boolean;
  /** @deprecated 상세 화면에서 vote 기능 노출을 중단했다. 롤백 호환용으로만 유지한다. */
  isInaccurateVoted?: boolean;
  lastUpdatedLabel?: string;
  imageUrl?: string;
}

export type LockerDetailLoadState = "ready" | "loading" | "error";
