import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type LockerDetailSnap = "full" | "half";

export interface OpenLockerDeepLinkSearch {
  openLockerId?: number;
  detailSnap?: LockerDetailSnap;
  focusLat?: number;
  focusLng?: number;
}

export interface LockerDeepLinkSlugInput {
  lockerId: number;
  title?: string;
}

const parsePositiveInt = (raw: unknown): number | undefined => {
  const parsed =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim()
        ? Number(raw)
        : undefined;

  return typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0
    ? parsed
    : undefined;
};

export const parseFocusCoordinate = (raw: unknown): number | undefined => {
  const parsed =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim()
        ? Number(raw)
        : undefined;

  return typeof parsed === "number" && Number.isFinite(parsed)
    ? parsed
    : undefined;
};

export const parseOpenLockerDeepLinkSearch = (
  search: Record<string, unknown>,
): OpenLockerDeepLinkSearch => {
  const openLockerId = parsePositiveInt(search.openLockerId);
  if (openLockerId == null) {
    return {};
  }

  const detailSnap = search.detailSnap === "full" ? "full" : undefined;
  const focusLat = parseFocusCoordinate(search.focusLat);
  const focusLng = parseFocusCoordinate(search.focusLng);
  const hasFocus = focusLat != null && focusLng != null;

  return {
    openLockerId,
    ...(detailSnap ? { detailSnap } : {}),
    ...(hasFocus ? { focusLat, focusLng } : {}),
  };
};

export const createLockerDeepLinkSlug = ({
  lockerId,
  title,
}: LockerDeepLinkSlugInput): string => {
  const cleanName = title
    ? title
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

  return cleanName ? `${lockerId}-${cleanName}` : String(lockerId);
};

export const createLockerPinAt = (
  lockerId: number,
  latitude: number,
  longitude: number,
): LockerPinItemResponse => ({
  pinType: "LOCKER",
  lockerId,
  placeId: null,
  latitude,
  longitude,
  isFavorite: null,
  lockerCount: null,
  pinCount: null,
  bounds: null,
});
