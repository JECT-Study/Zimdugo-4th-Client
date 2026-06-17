import { vars } from "@repo/ui/vars";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type LockerMarkerStatus = "active" | "inactive";

const LOCKER_MARKER_FILL = vars.color.palette.green[500];
const LOCKER_MARKER_BACKGROUND = vars.color.palette.gray[100];
const PLACE_MARKER_FILL = vars.color.palette.red[300];
const COORDINATE_GROUP_PRECISION = 4;
const OFFSET_RADIUS_PX = 15;

const LOCKER_MARKER_PATH =
  "M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z";

export const getPinId = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}-${pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId}`;

export const createMapPinIcon = (
  pin: LockerPinItemResponse,
  _isSelected = false,
): string => {
  const isPlace = pin.pinType === "PLACE";
  const markerFill = isPlace ? PLACE_MARKER_FILL : LOCKER_MARKER_FILL;
  // PLACE marker badge design is intentionally disabled until the final cluster marker spec lands.
  const badgeSvg = "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" role="img" aria-label="보관함 위치" data-type="${pin.pinType}">
    <circle cx="12" cy="12" r="12" fill="${LOCKER_MARKER_BACKGROUND}"/>
    <svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="${LOCKER_MARKER_PATH}" fill="${markerFill}"/>
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
  positionSignature: string;
  wasSelectedBefore?: boolean;
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

const createLockerCoordinateGroups = (
  pins: LockerPinItemResponse[],
): Map<string, LockerPinItemResponse[]> => {
  const groups = new Map<string, LockerPinItemResponse[]>();

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
  }

  return groups;
};

const getLockerOffset = (
  pin: LockerPinItemResponse,
  pinId: string,
  coordGroups: Map<string, LockerPinItemResponse[]>,
): { offsetX: number; offsetY: number } => {
  if (pin.pinType !== "LOCKER") return { offsetX: 0, offsetY: 0 };

  const group = coordGroups.get(getCoordinateGroupKey(pin)) ?? [];
  if (group.length <= 1) return { offsetX: 0, offsetY: 0 };

  const index = group.findIndex((item) => getPinId(item) === pinId);
  if (index === -1) return { offsetX: 0, offsetY: 0 };

  const angle = (2 * Math.PI * index) / group.length;

  return {
    offsetX: Math.round(OFFSET_RADIUS_PX * Math.cos(angle)),
    offsetY: Math.round(OFFSET_RADIUS_PX * Math.sin(angle)),
  };
};

const getPositionSignatureSuffix = ({
  spreadX,
  spreadY,
  offsetX,
  offsetY,
}: {
  spreadX: number;
  spreadY: number;
  offsetX: number;
  offsetY: number;
}): string => {
  const hasSpread = spreadX !== 0 || spreadY !== 0;
  const hasOffset = offsetX !== 0 || offsetY !== 0;

  return `${hasSpread ? `:spread:${spreadX}:${spreadY}` : ""}${
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
): naver.maps.HtmlIcon => {
  const hasSpread =
    spreadX != null && spreadY != null && (spreadX !== 0 || spreadY !== 0);
  const hasOffset =
    offsetX != null && offsetY != null && (offsetX !== 0 || offsetY !== 0);
  const key = `${getPinIconSignature(pin, isSelected, zoomLevel)}:${animationState}${
    hasSpread ? `:spread:${spreadX}:${spreadY}` : ""
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

  const spreadClass = hasSpread ? "spread" : "";
  const offsetClass = hasOffset ? " map-marker-offset-active" : "";
  const spreadStyle = hasSpread
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
    ),
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
  if (entry.listener) {
    maps.Event.removeListener(entry.listener);
  }

  entry.listener = maps.Event.addListener(entry.marker, "click", () => {
    const id = pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId;
    if (id == null) return;
    onSelectLocker(pin.pinType, id, pin);
  });
};

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
  selectedPinId,
  onSelectLocker,
  registry = new Map(),
  spreadCenter,
}: SyncLockerMarkersOptions) => {
  const nextPinIds = new Set(lockers.map(getPinId));
  const coordGroups = createLockerCoordinateGroups(lockers);

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

    const { offsetX, offsetY } = getLockerOffset(pin, pinId, coordGroups);

    const baseIconSignature = getPinIconSignature(pin, isSelected, zoomLevel);
    const iconSignature = `${baseIconSignature}${getPositionSignatureSuffix({
      spreadX,
      spreadY,
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
          ),
        );
        existingEntry.iconSignature = nextIconSignature;
      }
      existingEntry.wasSelectedBefore = isSelected;

      if (existingEntry.marker.getVisible() !== isVisible) {
        existingEntry.marker.setVisible(isVisible);
      }

      if (onSelectLocker) {
        attachMarkerSelectListener(existingEntry, maps, pin, onSelectLocker);
      } else if (existingEntry.listener) {
        maps.Event.removeListener(existingEntry.listener);
        existingEntry.listener = undefined;
      }

      continue;
    }

    const animationState = isSelected ? "selected-active" : "normal";
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
    });
    marker.setVisible(isVisible);

    const entry: LockerMarkerEntry = {
      marker,
      iconSignature: `${iconSignature}:${animationState}`,
      positionSignature,
      wasSelectedBefore: isSelected,
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
