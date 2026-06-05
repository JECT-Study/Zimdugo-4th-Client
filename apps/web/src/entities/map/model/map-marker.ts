import { vars } from "@repo/ui/vars";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type LockerMarkerStatus = "active" | "inactive";

/**
 * 디자인 시스템의 icon.nav.marker(`IconNavigateMarker` = `IconMarker22`) 형상을
 * `bg.default`(=`vars.color.palette.gray[100]`) 원 위에 올린 형태로 그린다.
 */
const LOCKER_MARKER_FILL = vars.color.palette.green[500];
const LOCKER_MARKER_BACKGROUND = vars.color.palette.gray[100];
const PLACE_BADGE_FILL = vars.color.icon.error;

const LOCKER_MARKER_PATH =
  "M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z";

export const getPinId = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}-${pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId}`;

export const createLockerMarkerIcon = (pin: LockerPinItemResponse): string => {
  const isPlace = pin.pinType === "PLACE";
  const badgeText = pin.lockerCount ? (pin.lockerCount > 9 ? "9+" : pin.lockerCount.toString()) : "";
  const badgeSvg = isPlace
    ? `<circle cx="18" cy="6" r="6" fill="${PLACE_BADGE_FILL}" stroke="${LOCKER_MARKER_BACKGROUND}" stroke-width="1.5"/>
       <text x="18" y="6.3" font-family="sans-serif" font-size="7" font-weight="bold" fill="${LOCKER_MARKER_BACKGROUND}" text-anchor="middle" dominant-baseline="middle">${badgeText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="보관함 위치" data-type="${pin.pinType}">
    <circle cx="12" cy="12" r="12" fill="${LOCKER_MARKER_BACKGROUND}"/>
    <svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="${LOCKER_MARKER_PATH}" fill="${LOCKER_MARKER_FILL}"/>
    </svg>
    ${badgeSvg}
  </svg>`;
};

interface SyncLockerMarkersOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  lockers: LockerPinItemResponse[];
  onSelectLocker?: (pinType: "LOCKER" | "PLACE", id: number) => void;
}

export const syncLockerMarkers = ({
  map,
  maps,
  lockers,
  onSelectLocker,
}: SyncLockerMarkersOptions) => {
  const markerListeners: naver.maps.MapEventListener[] = [];

  const naverMarkers = lockers.map((pin) => {
    const naverMarker = new maps.Marker({
      map,
      title: pin.pinType === "LOCKER" ? "보관함" : "보관함 모음",
      position: new maps.LatLng(pin.latitude, pin.longitude),
      icon: {
        content: createLockerMarkerIcon(pin),
      },
    });

    if (onSelectLocker) {
      const listener = maps.Event.addListener(naverMarker, "click", () => {
        const id = pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId;
        if (id !== null) {
          onSelectLocker(pin.pinType, id);
        }
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

