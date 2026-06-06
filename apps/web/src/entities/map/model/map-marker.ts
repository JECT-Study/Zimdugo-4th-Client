import { vars } from "@repo/ui/vars";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type LockerMarkerStatus = "active" | "inactive";

const LOCKER_MARKER_FILL = vars.color.palette.green[500];
const LOCKER_MARKER_BACKGROUND = vars.color.palette.gray[100];
const PLACE_MARKER_FILL = vars.color.palette.red[300];

const LOCKER_MARKER_PATH =
  "M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z";

export const getPinId = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}-${pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId}`;

export const createLockerMarkerIcon = (pin: LockerPinItemResponse): string => {
  const isPlace = pin.pinType === "PLACE";
  const markerFill = isPlace ? PLACE_MARKER_FILL : LOCKER_MARKER_FILL;
  // PLACE marker badge design is intentionally disabled until the final cluster marker spec lands.
  const badgeSvg = "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="보관함 위치" data-type="${pin.pinType}">
    <circle cx="12" cy="12" r="12" fill="${LOCKER_MARKER_BACKGROUND}"/>
    <svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="${LOCKER_MARKER_PATH}" fill="${markerFill}"/>
    </svg>
    ${badgeSvg}
  </svg>`;
};

interface SyncLockerMarkersOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  lockers: LockerPinItemResponse[];
  onSelectLocker?: (pinType: "LOCKER" | "PLACE", id: number) => void;
  registry?: LockerMarkerRegistry;
}

interface LockerMarkerEntry {
  marker: naver.maps.Marker;
  iconSignature: string;
  listener?: naver.maps.MapEventListener;
  positionSignature: string;
}

export type LockerMarkerRegistry = Map<string, LockerMarkerEntry>;

const toSvgDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

/**
 * Icon option caches.
 *
 * PLACE icons (`{ content: string }`) contain no SDK-specific objects and are
 * safe to share across any maps instance, so they live in a plain module-level
 * Map keyed by `iconSignature` ("PLACE:<lockerCount>").
 *
 * LOCKER icons (`{ url, size, scaledSize, origin, anchor }`) use SDK
 * constructor values (`maps.Size`, `maps.Point`) that are tied to a particular
 * naver.maps instance. A WeakMap keyed by the maps instance holds a per-instance
 * inner Map, so different maps instances (e.g., unit tests with mocked SDKs)
 * never share cached values.
 *
 * With ~11 possible combinations total (1 LOCKER + ~10 PLACE variants), the
 * caches will be populated once and then reused for every subsequent marker
 * creation, avoiding redundant SVG string generation and SDK object allocation.
 */
type PlaceIconOptions = { content: string };
type LockerIconOptions = {
  url: string;
  size: naver.maps.Size;
  scaledSize: naver.maps.Size;
  origin: naver.maps.Point;
  anchor: naver.maps.Point;
};

const placeIconCache = new Map<string, PlaceIconOptions>();
const lockerIconCache = new WeakMap<
  typeof naver.maps,
  Map<string, LockerIconOptions>
>();

const createMarkerIconOptions = (
  pin: LockerPinItemResponse,
  maps: typeof naver.maps,
): PlaceIconOptions | LockerIconOptions => {
  const key = getPinIconSignature(pin);

  if (pin.pinType === "PLACE") {
    const cached = placeIconCache.get(key);
    if (cached) return cached;

    const options: PlaceIconOptions = {
      content: createLockerMarkerIcon(pin),
    };
    placeIconCache.set(key, options);
    return options;
  }

  // LOCKER — keyed by maps instance via WeakMap
  let innerMap = lockerIconCache.get(maps);
  if (!innerMap) {
    innerMap = new Map<string, LockerIconOptions>();
    lockerIconCache.set(maps, innerMap);
  }

  const cached = innerMap.get(key);
  if (cached) return cached;

  const options: LockerIconOptions = {
    url: toSvgDataUrl(createLockerMarkerIcon(pin)),
    size: new maps.Size(24, 24),
    scaledSize: new maps.Size(24, 24),
    origin: new maps.Point(0, 0),
    anchor: new maps.Point(12, 12),
  };
  innerMap.set(key, options);
  return options;
};

const getPinPositionSignature = (pin: LockerPinItemResponse): string =>
  `${pin.latitude}:${pin.longitude}`;

const getPinIconSignature = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}:${pin.lockerCount ?? ""}`;

const createLockerMarker = ({
  map,
  maps,
  pin,
}: {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  pin: LockerPinItemResponse;
}) =>
  new maps.Marker({
    map,
    title: pin.pinType === "LOCKER" ? "보관함" : "보관함 모음",
    position: new maps.LatLng(pin.latitude, pin.longitude),
    icon: createMarkerIconOptions(pin, maps),
  });

const clearMarkerEntry = (
  entry: LockerMarkerEntry,
  maps: typeof naver.maps,
) => {
  if (entry.listener) {
    maps.Event.removeListener(entry.listener);
  }
  entry.marker.setMap(null);
};

export const clearLockerMarkers = (
  registry: LockerMarkerRegistry,
  maps: typeof naver.maps,
) => {
  for (const entry of registry.values()) {
    clearMarkerEntry(entry, maps);
  }
  registry.clear();
};

export const syncLockerMarkers = ({
  map,
  maps,
  lockers,
  onSelectLocker,
  registry = new Map(),
}: SyncLockerMarkersOptions) => {
  const nextPinIds = new Set(lockers.map(getPinId));

  // 뷰포트 기반 마커 컬링(Culling)을 위해 여유 공간(10%)을 둔 Bounds 계산
  const mapBounds = map.getBounds() as naver.maps.LatLngBounds;
  const ne = mapBounds.getNE();
  const sw = mapBounds.getSW();
  const latMargin = (ne.lat() - sw.lat()) * 0.1;
  const lngMargin = (ne.lng() - sw.lng()) * 0.1;
  const expandedBounds = new maps.LatLngBounds(
    new maps.LatLng(sw.lat() - latMargin, sw.lng() - lngMargin),
    new maps.LatLng(ne.lat() + latMargin, ne.lng() + lngMargin),
  );

  for (const [pinId, entry] of registry) {
    if (!nextPinIds.has(pinId)) {
      clearMarkerEntry(entry, maps);
      registry.delete(pinId);
    }
  }

  for (const pin of lockers) {
    const pinId = getPinId(pin);
    const existingEntry = registry.get(pinId);

    const positionSignature = getPinPositionSignature(pin);
    const iconSignature = getPinIconSignature(pin);
    const position = new maps.LatLng(pin.latitude, pin.longitude);
    const isVisible = expandedBounds.hasLatLng(position);

    if (existingEntry) {
      if (existingEntry.marker.getMap?.() !== map) {
        existingEntry.marker.setMap(map);
      }

      if (existingEntry.positionSignature !== positionSignature) {
        existingEntry.marker.setPosition(position);
        existingEntry.positionSignature = positionSignature;
      }

      if (existingEntry.iconSignature !== iconSignature) {
        existingEntry.marker.setIcon?.(createMarkerIconOptions(pin, maps));
        existingEntry.iconSignature = iconSignature;
      }
      
      if (existingEntry.marker.getVisible() !== isVisible) {
        existingEntry.marker.setVisible(isVisible);
      }

      continue;
    }

    const marker = createLockerMarker({ map, maps, pin });
    marker.setVisible(isVisible);
    
    const entry: LockerMarkerEntry = {
      marker,
      iconSignature,
      positionSignature,
    };

    if (onSelectLocker) {
      entry.listener = maps.Event.addListener(marker, "click", () => {
        const id = pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId;
        onSelectLocker(pin.pinType, id);
      });
    }

    registry.set(pinId, entry);
  }

  return () => {
    clearLockerMarkers(registry, maps);
  };
};
