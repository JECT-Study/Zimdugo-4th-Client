import type { LockerPinItemResponse } from "#/shared/api/lockers";
import type { AppLocale } from "#/shared/i18n/locales";

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

export interface LockerDeepLinkUrlInput extends LockerDeepLinkSlugInput {
  origin: string;
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

export const createLockerDeepLinkUrl = ({
  origin,
  lockerId,
  title,
}: LockerDeepLinkUrlInput): string => {
  const url = new URL("/", origin);
  url.searchParams.set("locker", createLockerDeepLinkSlug({ lockerId, title }));

  return url.toString();
};

const LOCKER_SHARE_TEXT_BY_LOCALE = {
  ko: "\uC9D0\uB450\uACE0\uC5D0\uC11C \uC774 \uBCF4\uAD00\uD568 \uC815\uBCF4\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694.",
  en: "View this locker on Zimdugo.",
  ja: "\u3053\u306E\u30ED\u30C3\u30AB\u30FC\u60C5\u5831\u3092Zimdugo\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  zh: "\u5728Zimdugo\u67E5\u770B\u8FD9\u4E2A\u884C\u674E\u67DC\u4FE1\u606F\u3002",
  "zh-TW":
    "\u5728Zimdugo\u67E5\u770B\u9019\u500B\u884C\u674E\u6AC3\u8CC7\u8A0A\u3002",
} as const satisfies Record<AppLocale, string>;

export const createLockerShareText = (locale: AppLocale): string =>
  LOCKER_SHARE_TEXT_BY_LOCALE[locale];

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
