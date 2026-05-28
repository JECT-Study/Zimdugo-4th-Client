import { vars } from "@repo/ui/vars";

export interface LockerMarkerSummary {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceMeters?: number;
  availableCount?: number;
  totalCount?: number;
}

export type LockerMarkerStatus = "active" | "inactive";

/**
 * 디자인 시스템의 icon.nav.marker(`IconNavigateMarker` = `IconMarker22`) 형상을
 * `bg.default` 흰색 원 위에 올린 형태로 그린다. 색상은 `@repo/ui` palette 토큰을
 * 그대로 인라인한다.
 */
const LOCKER_MARKER_FILL: Record<LockerMarkerStatus, string> = {
  active: vars.color.palette.green[500],
  inactive: vars.color.palette.gray[500],
};

const LOCKER_MARKER_BACKGROUND = vars.color.palette.gray[100];

const LOCKER_MARKER_PATH =
  "M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z";

export const resolveLockerMarkerStatus = (
  summary: LockerMarkerSummary,
): LockerMarkerStatus =>
  summary.availableCount === 0 ? "inactive" : "active";

const escapeXml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const createLockerMarkerIcon = (
  summary: LockerMarkerSummary,
): string => {
  const status = resolveLockerMarkerStatus(summary);
  const fill = LOCKER_MARKER_FILL[status];
  const accessibleTitle = escapeXml(summary.name);
  const availableCountAttr =
    summary.availableCount !== undefined
      ? ` data-available-count="${summary.availableCount}"`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="${accessibleTitle}" data-status="${status}"${availableCountAttr}><title>${accessibleTitle}</title><circle cx="12" cy="12" r="12" fill="${LOCKER_MARKER_BACKGROUND}"/><svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="${LOCKER_MARKER_PATH}" fill="${fill}"/></svg></svg>`;
};

interface SyncLockerMarkersOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  lockers: LockerMarkerSummary[];
  onSelectLocker?: (lockerId: string) => void;
}

export const syncLockerMarkers = ({
  map,
  maps,
  lockers,
  onSelectLocker,
}: SyncLockerMarkersOptions) => {
  const markerListeners: naver.maps.MapEventListener[] = [];

  const naverMarkers = lockers.map((locker) => {
    const naverMarker = new maps.Marker({
      map,
      title: locker.name,
      position: new maps.LatLng(locker.lat, locker.lng),
      icon: {
        content: createLockerMarkerIcon(locker),
      },
    });

    if (onSelectLocker) {
      const listener = maps.Event.addListener(naverMarker, "click", () => {
        onSelectLocker(locker.id);
      });
      markerListeners.push(listener);
    }

    return naverMarker;
  });

  return () => {
    if (markerListeners.length > 0) {
      maps.Event.removeListener(markerListeners);
    }
    for (const marker of naverMarkers) {
      marker.setMap(null);
    }
  };
};
