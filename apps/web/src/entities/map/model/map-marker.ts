import { vars } from "@repo/ui/vars";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import favoriteLockerMarkerIconUrl from "../assets/save-map-pin.png?url";
import defaultLockerMarkerIconUrl from "../assets/selected-map-pin.png?url";

export type LockerMarkerStatus = "active" | "inactive";

const PLACE_BADGE_FILL = vars.color.palette.green[500];
const PLACE_BADGE_BACKGROUND = "#E2F3E7";
const COORDINATE_GROUP_PRECISION = 4;
const OFFSET_RADIUS_PX = 15;
const MARKER_Z_INDEX = 10;
const SELECTED_MARKER_Z_INDEX = 20;
const LOCKER_MARKER_SOURCE_SIZE = { width: 130, height: 173 };
const FAVORITE_LOCKER_MARKER_SOURCE_SIZE = { width: 126, height: 126 };
const PLACE_MARKER_SOURCE_SIZE = { width: 180, height: 195 };
const LOCKER_MARKER_DISPLAY_SIZE = { width: 55, height: 88 };
const FAVORITE_LOCKER_MARKER_DISPLAY_SIZE = { width: 58, height: 88 };
const PLACE_MARKER_DISPLAY_SIZE = { width: 88, height: 98 };
const PIN_DISPLAY_SIZE = { width: 55, height: 73 };
const FAVORITE_PIN_DISPLAY_SIZE = { width: 58, height: 58 };
const PLACE_BADGE_DISPLAY_SIZE = 48;
const PLACE_BADGE_PIN_OVERLAP_X = 25;
const PLACE_BADGE_PIN_OVERLAP_Y = 8;
const PLACE_PIN_TOP = 21;
const PIN_DOT_SIZE = 10;
const PIN_DOT_GAP = 5;
const LOCKER_MARKER_DISPLAY_SCALE =
  PIN_DISPLAY_SIZE.height / LOCKER_MARKER_SOURCE_SIZE.height;
const FAVORITE_LOCKER_MARKER_DISPLAY_SCALE =
  FAVORITE_PIN_DISPLAY_SIZE.width / FAVORITE_LOCKER_MARKER_SOURCE_SIZE.width;
const PLACE_MARKER_DISPLAY_SCALE =
  PLACE_MARKER_DISPLAY_SIZE.height / PLACE_MARKER_SOURCE_SIZE.height;

export const getPinId = (pin: LockerPinItemResponse): string =>
  `${pin.pinType}-${pin.pinType === "LOCKER" ? pin.lockerId : pin.placeId}`;

export const createMapPinIcon = (
  pin: LockerPinItemResponse,
  _isSelected = false,
): string => {
  const isPlace = pin.pinType === "PLACE";
  const lockerCount = pin.lockerCount ?? 0;
  const badgeLabel = lockerCount > 9 ? "9+" : String(lockerCount);
  const badgeFilterId = `place-badge-shadow-${getPinId(pin)}`;

  if (!isPlace) {
    const isFavorite = pin.isFavorite === true;
    const iconUrl = isFavorite
      ? favoriteLockerMarkerIconUrl
      : defaultLockerMarkerIconUrl;
    const pinSize = isFavorite ? FAVORITE_PIN_DISPLAY_SIZE : PIN_DISPLAY_SIZE;
    const pinLeft = (getMarkerSize(pin).width - pinSize.width) / 2;
    const displayScale = isFavorite
      ? FAVORITE_LOCKER_MARKER_DISPLAY_SCALE
      : LOCKER_MARKER_DISPLAY_SCALE;

    return `<div data-type="${pin.pinType}" data-display-scale="${displayScale.toFixed(3)}" style="position: relative; display: block; width: 100%; height: 100%;">
      <img src="${iconUrl}" alt="" aria-hidden="true" style="position: absolute; left: ${pinLeft}px; top: 0; display: block; width: ${pinSize.width}px; height: ${pinSize.height}px; object-fit: contain;" />
      <span aria-hidden="true" style="position: absolute; left: 50%; bottom: 0; display: block; width: ${PIN_DOT_SIZE}px; height: ${PIN_DOT_SIZE}px; border-radius: 999px; background: ${PLACE_BADGE_FILL}; transform: translateX(-50%);"></span>
    </div>`;
  }

  const placePinLeft =
    (PLACE_MARKER_DISPLAY_SIZE.width - PIN_DISPLAY_SIZE.width) / 2;
  const placePinTop = PLACE_PIN_TOP;
  const placeBadgeLeft =
    placePinLeft + PIN_DISPLAY_SIZE.width - PLACE_BADGE_PIN_OVERLAP_X;
  const placeBadgeTop = placePinTop - PLACE_BADGE_PIN_OVERLAP_Y;
  const placeDotTop = placePinTop + PIN_DISPLAY_SIZE.height + PIN_DOT_GAP;

  return `<div data-type="${pin.pinType}" data-display-scale="${PLACE_MARKER_DISPLAY_SCALE.toFixed(3)}" style="position: relative; display: block; width: 100%; height: 100%;">
    <img src="${defaultLockerMarkerIconUrl}" alt="" aria-hidden="true" style="position: absolute; left: ${placePinLeft}px; top: ${placePinTop}px; display: block; width: ${PIN_DISPLAY_SIZE.width}px; height: ${PIN_DISPLAY_SIZE.height}px; object-fit: contain;" />
    <svg xmlns="http://www.w3.org/2000/svg" width="${PLACE_BADGE_DISPLAY_SIZE}" height="${PLACE_BADGE_DISPLAY_SIZE}" viewBox="0 0 125 125" fill="none" aria-hidden="true" style="position: absolute; left: ${placeBadgeLeft}px; top: ${placeBadgeTop}px; overflow: visible;">
      <g filter="url(#${badgeFilterId})">
        <circle cx="61.9049" cy="47.1469" r="33.0364" fill="${PLACE_BADGE_BACKGROUND}" fill-opacity="0.2"/>
        <text x="61.9049" y="63.6651" text-anchor="middle" fill="${PLACE_BADGE_FILL}" font-family="Pretendard, sans-serif" font-size="43" font-weight="700">${badgeLabel}</text>
      </g>
      <defs>
        <filter id="${badgeFilterId}" x="-0.49707" y="-7.91366" width="124.804" height="124.804" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="7.34141"/>
          <feGaussianBlur stdDeviation="14.6828"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
    <span aria-hidden="true" style="position: absolute; left: 50%; top: ${placeDotTop}px; display: block; width: ${PIN_DOT_SIZE}px; height: ${PIN_DOT_SIZE}px; border-radius: 999px; background: ${PLACE_BADGE_FILL}; transform: translateX(-50%);"></span>
  </div>`;
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

const getMarkerSize = (pin: LockerPinItemResponse) => {
  if (pin.pinType === "PLACE") return PLACE_MARKER_DISPLAY_SIZE;
  if (pin.isFavorite === true) return FAVORITE_LOCKER_MARKER_DISPLAY_SIZE;
  return LOCKER_MARKER_DISPLAY_SIZE;
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

  const markerSize = getMarkerSize(pin);

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
    content: `<div class="map-marker-offset-wrapper${offsetClass}" style="width: ${markerSize.width}px; height: ${markerSize.height}px; ${offsetStyle}">
      <div class="map-marker-item ${animationState} ${spreadClass}" style="width: 100%; height: 100%; ${spreadStyle}">
        ${createLockerMarkerIcon(pin, isSelected)}
      </div>
    </div>`,
    size: new maps.Size(markerSize.width, markerSize.height),
    anchor: new maps.Point(markerSize.width / 2, markerSize.height),
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
  const favoriteSignature =
    pin.pinType === "LOCKER" && pin.isFavorite === true ? ":favorite" : "";
  return `${pin.pinType}:${pin.lockerCount ?? ""}:${isSelected ? "selected" : "default"}${favoriteSignature}${
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
