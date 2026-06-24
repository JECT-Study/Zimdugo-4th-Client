import { vars } from "@repo/ui/vars";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type LockerMarkerStatus = "active" | "inactive";

const LOCKER_MARKER_FILL = vars.color.palette.green[500];
const LOCKER_MARKER_DEFAULT_FILL = vars.color.palette.gray[500];
const PLACE_MARKER_FILL = vars.color.palette.red[300];
const PLACE_MARKER_BACKGROUND = vars.color.palette.gray[100];
const COORDINATE_GROUP_PRECISION = 4;
const OFFSET_RADIUS_PX = 15;
const MARKER_Z_INDEX = 10;
const SELECTED_MARKER_Z_INDEX = 20;

const LOCKER_MARKER_PATH =
  "M35.0252 0.0925703C40.4926 -0.686402 45.3838 3.55004 45.3838 9.06561V9.94579H49.9225C54.9357 9.94579 58.9999 14.0034 59 19.0093V43.9364C58.9995 48.9422 54.9354 53 49.9225 53H9.07628C4.06367 52.9998 0.000537461 48.9422 0 43.9364V19.0093C0.000134148 14.0034 4.06338 9.94592 9.07628 9.94579H13.615V9.06561C13.615 3.55006 18.5061 -0.686371 23.9736 0.0925703L29.4988 0.879917L29.4976 0.881115H29.5001L35.0252 0.0925703ZM9.07628 14.4769C6.56994 14.4771 4.53767 16.5065 4.53754 19.0093V43.9364C4.53807 46.439 6.57016 48.4674 9.07628 48.4677H13.615V37.3906L18.1525 35.2733L28.173 30.6012C29.108 32.3832 30.9306 33.5877 33.0161 33.5877C36.06 33.5875 38.5532 31.0028 38.5533 27.7906H38.5763C38.5763 24.6029 36.0832 21.9922 33.0391 21.9922C29.9949 21.9926 27.5018 24.5782 27.5018 27.7906C27.5018 28.0916 27.5263 28.3926 27.5741 28.6936L18.1538 30.7398L13.615 31.7261V14.4769H9.07628ZM45.3838 48.4677H49.9225C52.4288 48.4677 54.4608 46.4391 54.4613 43.9364V19.0093C54.4611 16.5064 52.4291 14.4769 49.9225 14.4769H45.3838V48.4677ZM23.3325 4.57909C20.5986 4.1897 18.1525 6.30807 18.1525 9.06561V9.94579C18.1535 12.4485 23.2343 14.4769 29.5001 14.4769C35.7662 14.4768 40.8463 12.4475 40.8463 9.94458L40.845 9.06561C40.845 6.30805 38.4001 4.18967 35.6664 4.57909L30.1412 5.36763L30.1303 5.36884L29.8092 5.41225L29.7789 5.41587C29.6863 5.41497 29.5933 5.41345 29.5001 5.41345C29.4056 5.41345 29.3113 5.41495 29.2174 5.41587L29.1885 5.41225L28.8673 5.36884L28.8576 5.36763L23.3325 4.57909Z";

const PLACE_MARKER_PATH =
  "M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z";

export const getPinId = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}-${pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId}`;

export const createMapPinIcon = (
  pin: LockerPinItemResponse,
  isSelected = false,
): string => {
  const isPlace = pin.pinType === "PLACE";
  // PLACE marker badge design is intentionally disabled until the final cluster marker spec lands.
  const badgeSvg = "";

  if (!isPlace) {
    const markerFill = isSelected
      ? LOCKER_MARKER_FILL
      : LOCKER_MARKER_DEFAULT_FILL;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 59 53" fill="none" role="img" aria-label="蹂닿????꾩튂" data-type="${pin.pinType}">
      <path d="${LOCKER_MARKER_PATH}" fill="${markerFill}"/>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" role="img" aria-label="보관함 위치" data-type="${pin.pinType}">
    <circle cx="12" cy="12" r="12" fill="${PLACE_MARKER_BACKGROUND}"/>
    <svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="${PLACE_MARKER_PATH}" fill="${PLACE_MARKER_FILL}"/>
    </svg>
    ${badgeSvg}
  </svg>`;
};

/** @deprecated Use createMapPinIcon */
export const createLockerMarkerIcon = createMapPinIcon;

/** 지도 LOCKER 마커 아이콘 SVG */
export const createMapLockerPinIcon = createMapPinIcon;

/** 지도 PLACE 마커 아이콘 SVG */
export const createMapPlacePinIcon = createMapPinIcon;

interface SyncLockerMarkersOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  lockers: LockerPinItemResponse[];
  selectedPinId?: string | null;
  onSelectLocker?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void;
  registry?: LockerMarkerRegistry;
  spreadCenter?: { lat: number; lng: number } | null;
}

interface LockerMarkerEntry {
  marker: naver.maps.Marker;
  iconSignature: string;
  listener?: naver.maps.MapEventListener;
  listenerHandler?: SyncLockerMarkersOptions["onSelectLocker"];
  listenerPin?: LockerPinItemResponse;
  listenerPinId?: string;
  positionSignature: string;
  zIndex: number;
  wasSelectedBefore?: boolean;
  hadSpreadBefore?: boolean;
}

export type LockerMarkerRegistry = Map<string, LockerMarkerEntry>;

const lockerIconCache = new WeakMap<
  typeof naver.maps,
  Map<string, naver.maps.HtmlIcon>
>();

const getCoordinateGroupKey = (pin: LockerPinItemResponse): string =>
  `${pin.latitude.toFixed(COORDINATE_GROUP_PRECISION)},${pin.longitude.toFixed(COORDINATE_GROUP_PRECISION)}`;

const getLockerSortId = (pin: LockerPinItemResponse): number =>
  pin.pinType === "LOCKER"
    ? (pin.lockerId ?? Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;

const createLockerOffsetMap = (
  pins: LockerPinItemResponse[],
): Map<string, { offsetX: number; offsetY: number }> => {
  const groups = new Map<string, LockerPinItemResponse[]>();
  const offsetMap = new Map<string, { offsetX: number; offsetY: number }>();

  for (const pin of pins) {
    if (pin.pinType !== "LOCKER") continue;

    const key = getCoordinateGroupKey(pin);
    const group = groups.get(key);
    if (group) {
      group.push(pin);
    } else {
      groups.set(key, [pin]);
    }
  }

  for (const group of groups.values()) {
    group.sort((a, b) => getLockerSortId(a) - getLockerSortId(b));

    if (group.length <= 1) continue;

    group.forEach((pin, index) => {
      const angle = (2 * Math.PI * index) / group.length;

      offsetMap.set(getPinId(pin), {
        offsetX: Math.round(OFFSET_RADIUS_PX * Math.cos(angle)),
        offsetY: Math.round(OFFSET_RADIUS_PX * Math.sin(angle)),
      });
    });
  }

  return offsetMap;
};

const getIconSignatureSuffix = ({
  hasSpread,
  offsetX,
  offsetY,
}: {
  hasSpread: boolean;
  offsetX: number;
  offsetY: number;
}): string => {
  const hasOffset = offsetX !== 0 || offsetY !== 0;

  return `${hasSpread ? ":spread" : ""}${
    hasOffset ? `:offset:${offsetX}:${offsetY}` : ""
  }`;
};

const createMarkerIconOptions = (
  pin: LockerPinItemResponse,
  maps: typeof naver.maps,
  isSelected: boolean,
  animationState:
    | "selected-active"
    | "selected-static"
    | "unselected-active"
    | "normal",
  zoomLevel?: number,
  spreadX?: number,
  spreadY?: number,
  offsetX?: number,
  offsetY?: number,
  shouldAnimateSpread = false,
): naver.maps.HtmlIcon => {
  const hasSpread =
    spreadX != null && spreadY != null && (spreadX !== 0 || spreadY !== 0);
  const hasOffset =
    offsetX != null && offsetY != null && (offsetX !== 0 || offsetY !== 0);
  const key = `${getPinIconSignature(pin, isSelected, zoomLevel)}:${animationState}${
    shouldAnimateSpread && hasSpread ? `:spread:${spreadX}:${spreadY}` : ""
  }${hasOffset ? `:offset:${offsetX}:${offsetY}` : ""}`;

  let innerMap = lockerIconCache.get(maps);
  if (!innerMap) {
    innerMap = new Map<string, naver.maps.HtmlIcon>();
    lockerIconCache.set(maps, innerMap);
  }

  const cached = innerMap.get(key);
  if (cached) return cached;

  const size =
    animationState === "selected-active" || animationState === "selected-static"
      ? 36
      : 24;
  const radius = size / 2;

  const spreadClass = shouldAnimateSpread && hasSpread ? "spread" : "";
  const offsetClass = hasOffset ? " map-marker-offset-active" : "";
  const spreadStyle =
    shouldAnimateSpread && hasSpread
      ? `--spread-x: ${spreadX}px; --spread-y: ${spreadY}px;`
      : "";
  const offsetStyle = hasOffset
    ? `--offset-x: ${offsetX}px; --offset-y: ${offsetY}px;`
    : "";

  const options = {
    content: `<div class="map-marker-offset-wrapper${offsetClass}" style="width: ${size}px; height: ${size}px; ${offsetStyle}">
      <div class="map-marker-item ${animationState} ${spreadClass}" style="width: 100%; height: 100%; ${spreadStyle}">
        ${createLockerMarkerIcon(pin, isSelected)}
      </div>
    </div>`,
    size: new maps.Size(size, size),
    anchor: new maps.Point(radius, radius),
  };
  innerMap.set(key, options);
  return options;
};

const getPinPositionSignature = (pin: LockerPinItemResponse): string =>
  `${pin.latitude}:${pin.longitude}`;

const getPinIconSignature = (
  pin: LockerPinItemResponse,
  isSelected: boolean,
  zoomLevel?: number,
): string => {
  const isStateful = isSelected;
  return `${pin.pinType}:${pin.lockerCount ?? ""}:${isSelected ? "selected" : "default"}${
    isStateful && zoomLevel != null ? `:${zoomLevel}` : ""
  }`;
};

const createLockerMarker = ({
  map,
  maps,
  pin,
  isSelected,
  animationState,
  zoomLevel,
  spreadX,
  spreadY,
  offsetX,
  offsetY,
  shouldAnimateSpread,
  zIndex,
}: {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  pin: LockerPinItemResponse;
  isSelected: boolean;
  animationState:
    | "selected-active"
    | "selected-static"
    | "unselected-active"
    | "normal";
  zoomLevel: number;
  spreadX?: number;
  spreadY?: number;
  offsetX?: number;
  offsetY?: number;
  shouldAnimateSpread?: boolean;
  zIndex: number;
}) => {
  const marker = new maps.Marker({
    map,
    clickable: true,
    title: pin.pinType === "LOCKER" ? "보관함" : "보관함 모음",
    position: new maps.LatLng(pin.latitude, pin.longitude),
    icon: createMarkerIconOptions(
      pin,
      maps,
      isSelected,
      animationState,
      zoomLevel,
      spreadX,
      spreadY,
      offsetX,
      offsetY,
      shouldAnimateSpread,
    ),
    zIndex,
  });
  return marker;
};

const attachMarkerSelectListener = (
  entry: LockerMarkerEntry,
  maps: typeof naver.maps,
  pin: LockerPinItemResponse,
  onSelectLocker: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void,
) => {
  const pinId = getPinId(pin);
  entry.listenerPin = pin;

  if (
    entry.listener &&
    entry.listenerPinId === pinId &&
    entry.listenerHandler === onSelectLocker
  ) {
    return;
  }

  if (entry.listener) {
    maps.Event.removeListener(entry.listener);
  }

  entry.listener = maps.Event.addListener(entry.marker, "click", () => {
    const listenerPin = entry.listenerPin;
    if (!listenerPin) return;

    const id =
      listenerPin.pinType === "LOCKER"
        ? listenerPin.lockerId
        : listenerPin.placeId;
    if (id == null) return;
    onSelectLocker(listenerPin.pinType, id, listenerPin);
  });
  entry.listenerHandler = onSelectLocker;
  entry.listenerPinId = pinId;
};

const clearMarkerEntry = (
  entry: LockerMarkerEntry,
  maps: typeof naver.maps,
) => {
  if (entry.listener) {
    maps.Event.removeListener(entry.listener);
  }
  entry.listener = undefined;
  entry.listenerHandler = undefined;
  entry.listenerPin = undefined;
  entry.listenerPinId = undefined;
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
  selectedPinId,
  onSelectLocker,
  registry = new Map(),
  spreadCenter,
}: SyncLockerMarkersOptions) => {
  const nextPinIds = new Set(lockers.map(getPinId));
  const offsetMap = createLockerOffsetMap(lockers);

  // 뷰포트 기반 마커 컬링(Culling)을 위해 여유 공간(10%)을 둔 Bounds 계산
  const mapBounds = map.getBounds?.() as
    | naver.maps.LatLngBounds
    | null
    | undefined;
  const ne = mapBounds?.getNE?.();
  const sw = mapBounds?.getSW?.();
  let expandedBounds: naver.maps.LatLngBounds | null = null;
  if (ne && sw) {
    const latMargin = (ne.lat() - sw.lat()) * 0.1;
    const lngMargin = (ne.lng() - sw.lng()) * 0.1;
    expandedBounds = new maps.LatLngBounds(
      new maps.LatLng(sw.lat() - latMargin, sw.lng() - lngMargin),
      new maps.LatLng(ne.lat() + latMargin, ne.lng() + lngMargin),
    );
  }

  const proj = map.getProjection ? map.getProjection() : null;
  let centerPoint: naver.maps.Point | null = null;
  if (spreadCenter && proj) {
    centerPoint = proj.fromCoordToOffset(
      new maps.LatLng(spreadCenter.lat, spreadCenter.lng),
    );
  }

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
    const isSelected = selectedPinId === pinId;
    const zIndex = isSelected ? SELECTED_MARKER_Z_INDEX : MARKER_Z_INDEX;
    const position = new maps.LatLng(pin.latitude, pin.longitude);
    const isVisible = expandedBounds?.hasLatLng(position) ?? true;
    const zoomLevel = map.getZoom?.() ?? 0;

    let spreadX = 0;
    let spreadY = 0;
    if (centerPoint && proj) {
      const pinPoint = proj.fromCoordToOffset(position);
      spreadX = Math.round(centerPoint.x - pinPoint.x);
      spreadY = Math.round(centerPoint.y - pinPoint.y);
    }

    const hasSpread = spreadX !== 0 || spreadY !== 0;
    const { offsetX = 0, offsetY = 0 } = offsetMap.get(pinId) ?? {};

    const baseIconSignature = getPinIconSignature(pin, isSelected, zoomLevel);
    const iconSignature = `${baseIconSignature}${getIconSignatureSuffix({
      hasSpread,
      offsetX,
      offsetY,
    })}`;

    if (existingEntry) {
      if (
        (
          existingEntry.marker as naver.maps.Marker & {
            getMap?: () => naver.maps.Map | null;
          }
        ).getMap?.() !== map
      ) {
        existingEntry.marker.setMap(map);
      }

      if (existingEntry.positionSignature !== positionSignature) {
        existingEntry.marker.setPosition(position);
        existingEntry.positionSignature = positionSignature;
      }

      if (existingEntry.zIndex !== zIndex) {
        existingEntry.marker.setZIndex?.(zIndex);
        existingEntry.zIndex = zIndex;
      }

      let animationState:
        | "selected-active"
        | "selected-static"
        | "unselected-active"
        | "normal" = "normal";
      if (isSelected) {
        animationState = existingEntry.wasSelectedBefore
          ? "selected-static"
          : "selected-active";
      } else {
        animationState = existingEntry.wasSelectedBefore
          ? "unselected-active"
          : "normal";
      }

      const shouldAnimateSpread =
        animationState === "normal" &&
        hasSpread &&
        !existingEntry.hadSpreadBefore;
      const nextIconSignature = `${iconSignature}:${animationState}`;
      if (existingEntry.iconSignature !== nextIconSignature) {
        existingEntry.marker.setIcon?.(
          createMarkerIconOptions(
            pin,
            maps,
            isSelected,
            animationState,
            zoomLevel,
            spreadX,
            spreadY,
            offsetX,
            offsetY,
            shouldAnimateSpread,
          ),
        );
        existingEntry.iconSignature = nextIconSignature;
      }
      existingEntry.wasSelectedBefore = isSelected;
      existingEntry.hadSpreadBefore = hasSpread;

      if (existingEntry.marker.getVisible() !== isVisible) {
        existingEntry.marker.setVisible(isVisible);
      }

      if (onSelectLocker) {
        attachMarkerSelectListener(existingEntry, maps, pin, onSelectLocker);
      } else if (existingEntry.listener) {
        maps.Event.removeListener(existingEntry.listener);
        existingEntry.listener = undefined;
        existingEntry.listenerHandler = undefined;
        existingEntry.listenerPin = undefined;
        existingEntry.listenerPinId = undefined;
      }

      continue;
    }

    const animationState = isSelected ? "selected-active" : "normal";
    const shouldAnimateSpread = animationState === "normal" && hasSpread;
    const marker = createLockerMarker({
      map,
      maps,
      pin,
      isSelected,
      animationState,
      zoomLevel,
      spreadX,
      spreadY,
      offsetX,
      offsetY,
      shouldAnimateSpread,
      zIndex,
    });
    marker.setVisible(isVisible);

    const entry: LockerMarkerEntry = {
      marker,
      iconSignature: `${iconSignature}:${animationState}`,
      positionSignature,
      zIndex,
      wasSelectedBefore: isSelected,
      hadSpreadBefore: hasSpread,
    };

    if (onSelectLocker) {
      attachMarkerSelectListener(entry, maps, pin, onSelectLocker);
    }

    registry.set(pinId, entry);
  }

  return () => {
    clearLockerMarkers(registry, maps);
  };
};
