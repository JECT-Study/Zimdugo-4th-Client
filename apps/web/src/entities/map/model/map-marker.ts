import { vars } from "@repo/ui/vars";
import type {
  LockerBoundsRaw,
  LockerPinItemResponse,
} from "#/shared/api/lockers";

export type LockerMarkerStatus = "active" | "inactive";

export interface LockerMarkerOffset {
  offsetX: number;
  offsetY: number;
}

const PLACE_BADGE_FILL = vars.color.palette.green[500];
const MAP_PIN_WHITE = "white";
const COORDINATE_GROUP_PRECISION = 4;
const MARKER_PROXIMITY_THRESHOLD_PX = 44;
const MARKER_Z_INDEX = 10;
const SELECTED_MARKER_Z_INDEX = 20;
const MAP_PIN_DISPLAY_SCALE = 0.45;
const LOCKER_MARKER_SOURCE_SIZE = { width: 90, height: 90 };
const PLACE_MARKER_SOURCE_SIZE = { width: 121, height: 121 };
const DEFAULT_MARKER_SOURCE_ANCHOR = { x: 45, y: 45 };
const PLACE_MARKER_SOURCE_ANCHOR = { x: 52.4, y: 63 };
const scaleMapPinValue = (value: number) =>
  Math.round(value * MAP_PIN_DISPLAY_SCALE * 10) / 10;
const LOCKER_MARKER_DISPLAY_SIZE = {
  width: scaleMapPinValue(LOCKER_MARKER_SOURCE_SIZE.width),
  height: scaleMapPinValue(LOCKER_MARKER_SOURCE_SIZE.height),
};
const FAVORITE_LOCKER_MARKER_DISPLAY_SIZE = LOCKER_MARKER_DISPLAY_SIZE;
const PLACE_MARKER_DISPLAY_SIZE = {
  width: scaleMapPinValue(PLACE_MARKER_SOURCE_SIZE.width),
  height: scaleMapPinValue(PLACE_MARKER_SOURCE_SIZE.height),
};
const MARKER_SPREAD_RADIUS_PX = Math.ceil(PLACE_MARKER_DISPLAY_SIZE.width / 2);
const DEFAULT_MARKER_ANCHOR = {
  x: scaleMapPinValue(DEFAULT_MARKER_SOURCE_ANCHOR.x),
  y: scaleMapPinValue(DEFAULT_MARKER_SOURCE_ANCHOR.y),
};
const PLACE_MARKER_ANCHOR = {
  x: scaleMapPinValue(PLACE_MARKER_SOURCE_ANCHOR.x),
  y: scaleMapPinValue(PLACE_MARKER_SOURCE_ANCHOR.y),
};

const CLUSTER_S_DISPLAY_SIZE = { width: 52, height: 52 };
const CLUSTER_L_DISPLAY_SIZE = { width: 64, height: 64 };

const CLUSTER_S_ANCHOR = { x: 26, y: 26 };
const CLUSTER_L_ANCHOR = { x: 32, y: 32 };

export const getPinId = (pin: LockerPinItemResponse): string => {
  if (pin.pinType === "LOCKER") return `LOCKER-${pin.lockerId}`;
  if (pin.pinType === "PLACE") return `PLACE-${pin.placeId}`;
  return `CLUSTER-${pin.latitude}-${pin.longitude}`;
};

const createSelectedLockerMapPinSvg = (): string => `
  <svg width="100%" height="100%" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display: block;">
    <g clip-path="url(#selected-map-pin-clip)">
      <g filter="url(#selected-map-pin-shadow)">
        <path d="M44.5 16C60.2401 16 73 28.76 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5C16 28.76 28.7599 16 44.5 16Z" fill="${MAP_PIN_WHITE}"/>
        <path d="M44.5 16C60.2401 16 73 28.76 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5C16 28.76 28.7599 16 44.5 16Z" stroke="${PLACE_BADGE_FILL}" stroke-width="3"/>
      </g>
      <path d="M48.4398 26.0612C51.9428 25.5465 55.0768 28.3442 55.0768 31.9866V32.5677H57.9845C61.1961 32.5677 63.7998 35.2476 63.8 38.5533V55.0141C63.7998 58.3201 61.1961 61 57.9845 61H31.8152C28.6036 61 26.0001 58.3201 26 55.0141V38.5533C26.0001 35.2476 28.6036 32.5678 31.8152 32.5677H34.7231V31.9866C34.7232 28.3443 37.857 25.5466 41.3599 26.0612L44.8926 26.5805L44.9 26.5815L44.9071 26.5803L48.4398 26.0612ZM31.8152 35.5605C30.2095 35.5606 28.9077 36.9006 28.9076 38.5533V55.0141C28.9077 56.6671 30.2095 58.007 31.8152 58.007H34.7231V50.692L44.0501 46.2083C44.6491 47.3851 45.8162 48.1806 47.1522 48.1806C49.1026 48.1806 50.6999 46.4735 50.6999 44.352H50.7152C50.7152 42.247 49.1181 40.5232 47.1678 40.5231C45.2173 40.5231 43.62 42.2305 43.62 44.352C43.62 44.5509 43.6355 44.7499 43.6662 44.9487L34.7231 46.9508V35.5605H31.8152ZM55.0768 58.007H57.9845C59.5904 58.007 60.892 56.6671 60.892 55.0141V38.5533C60.892 36.9005 59.5902 35.5605 57.9845 35.5605H55.0768V58.007ZM52.1693 31.9866C52.169 30.194 50.6507 28.8105 48.9326 29.0132L48.8509 29.024L45.3112 29.5443L45.3045 29.5452L45.0987 29.5745L44.9 29.6026L44.7012 29.5745L44.4954 29.5452L44.492 29.5447L44.4885 29.5443L40.9491 29.024C39.1976 28.7667 37.6308 30.1656 37.6307 31.9866V32.5677H37.6538C37.6387 32.6466 37.6307 32.7264 37.6307 32.8068C37.6308 34.4597 40.8854 35.7999 44.9 35.7999C48.9146 35.7999 52.1688 34.4597 52.169 32.8068C52.169 32.7264 52.1611 32.6466 52.1458 32.5677H52.1693V31.9866Z" fill="${PLACE_BADGE_FILL}"/>
    </g>
    <defs>
      <filter id="selected-map-pin-shadow" x="-1.5" y="2.5" width="92" height="92" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="8"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <clipPath id="selected-map-pin-clip">
        <rect width="90" height="90" fill="${MAP_PIN_WHITE}"/>
      </clipPath>
    </defs>
  </svg>`;

const createFavoriteLockerMapPinSvg = (): string => `
  <svg width="100%" height="100%" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display: block;">
    <g clip-path="url(#favorite-map-pin-clip)">
      <g filter="url(#favorite-map-pin-shadow)">
        <path d="M16 44.5C16 28.7599 28.7599 16 44.5 16C60.2401 16 73 28.7599 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5Z" fill="${PLACE_BADGE_FILL}"/>
        <path d="M44.0258 53.6479L34.2538 59.1178L36.4362 48.1338L28.2144 40.5304L39.3352 39.2118L44.0258 29.0428L48.7162 39.2118L59.8369 40.5304L51.6152 48.1338L53.7977 59.1178L44.0258 53.6479Z" fill="${MAP_PIN_WHITE}"/>
      </g>
    </g>
    <defs>
      <filter id="favorite-map-pin-shadow" x="-6.4" y="-0.8" width="101.8" height="101.8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="5.6"/>
        <feGaussianBlur stdDeviation="11.2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <clipPath id="favorite-map-pin-clip">
        <rect width="90" height="90" fill="${MAP_PIN_WHITE}"/>
      </clipPath>
    </defs>
  </svg>`;

const CLUSTER_CONFIG = {
  s: {
    viewBoxSize: 330,
    outerRadius: 162,
    badgeRadius: 62,
    badgeFill: vars.color.palette.gray[100],
    textFill: vars.color.palette.green[500],
    fontSize: 76,
    filterId: "cluster-map-pin-badge-shadow-s",
    textDy: 26,
  },
  l: {
    viewBoxSize: 440,
    outerRadius: 216,
    badgeRadius: 82,
    badgeFill: vars.color.palette.green[500],
    textFill: vars.color.palette.gray[100],
    fontSize: 78,
    filterId: "cluster-map-pin-badge-shadow-l",
    textDy: 27,
  },
} as const;

const createClusterPinSvg = (count: number): string => {
  const size = count >= 10 ? "l" : "s";
  const config = CLUSTER_CONFIG[size];
  const center = config.viewBoxSize / 2;
  const label = count > 99 ? "99+" : String(count);

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${config.viewBoxSize} ${config.viewBoxSize}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display: block;">
      <circle cx="${center}" cy="${center}" r="${config.outerRadius}" fill="${vars.color.palette.green[100]}" fill-opacity="0.64" stroke="${vars.color.palette.green[500]}" stroke-width="2" />
      <g filter="url(#${config.filterId})">
        <circle cx="${center}" cy="${center}" r="${config.badgeRadius}" fill="${config.badgeFill}" />
        <text x="${center}" y="${center + config.textDy}" text-anchor="middle" fill="${config.textFill}" font-family="Pretendard, sans-serif" font-size="${config.fontSize}" font-weight="700">${label}</text>
      </g>
      <defs>
        <filter id="${config.filterId}" x="${center - config.badgeRadius - 30}" y="${center - config.badgeRadius - 20}" width="${(config.badgeRadius + 30) * 2}" height="${(config.badgeRadius + 40) * 2}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="7.341" />
          <feGaussianBlur stdDeviation="14.683" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>`;
};

const createPlaceClusterMapPinSvg = (badgeLabel: string): string => {
  const badgeFontSize = badgeLabel.length > 1 ? 24 : 31;
  const badgeY = badgeLabel.length > 1 ? 43 : 45;

  return `
    <svg width="100%" height="100%" viewBox="0 0 121 121" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display: block;">
      <g filter="url(#cluster-map-pin-shadow)">
        <path d="M22.4 63C22.4 46.4315 35.8315 33 52.4 33C68.9686 33 82.4 46.4315 82.4 63C82.4 79.5685 68.9686 93 52.4 93C35.8315 93 22.4 79.5685 22.4 63Z" fill="${MAP_PIN_WHITE}" shape-rendering="crispEdges"/>
        <path d="M52.4 34.5C68.1401 34.5 80.9 47.2599 80.9 63C80.9 78.7401 68.1401 91.5 52.4 91.5C36.6599 91.5 23.9 78.7401 23.9 63C23.9 47.2599 36.6599 34.5 52.4 34.5Z" stroke="${PLACE_BADGE_FILL}" stroke-width="3" shape-rendering="crispEdges"/>
        <path d="M55.2398 44.8611C58.7428 44.3465 61.8768 47.1442 61.8768 50.7865V51.3677H64.7846C67.9962 51.3677 70.5998 54.0476 70.6 57.3533V73.8141C70.5998 77.12 67.9962 79.7999 64.7846 79.7999H38.6153C35.4037 79.7999 32.8001 77.12 32.8 73.8141V57.3533C32.8001 54.0476 35.4037 51.3677 38.6153 51.3677H41.5231V50.7865C41.5232 47.1442 44.6571 44.3465 48.1599 44.8611L51.6927 45.3805L51.7 45.3814L51.7071 45.3803L55.2398 44.8611ZM38.6153 54.3605C37.0095 54.3606 35.7078 55.7005 35.7077 57.3533V73.8141C35.7077 75.467 37.0095 76.807 38.6153 76.807H41.5231V69.492L50.8502 65.0083C51.4491 66.185 52.6163 66.9806 53.9523 66.9806C55.9027 66.9806 57.4999 65.2735 57.4999 63.152H57.5152C57.5152 61.0469 55.9181 59.3231 53.9679 59.3231C52.0174 59.3231 50.42 61.0305 50.42 63.152C50.42 63.152 50.4356 63.5498 50.4663 63.7487L41.5231 65.7507V54.3605H38.6153ZM61.8768 76.807H64.7846C66.3905 76.807 67.6921 75.467 67.6921 73.8141V57.3533C67.6921 55.7005 66.3903 54.3605 64.7846 54.3605H61.8768V76.807ZM58.9693 50.7865C58.9691 48.9939 57.4508 47.6105 55.7326 47.8132L55.6509 47.8239L52.1112 48.3442L52.1046 48.3451L51.8987 48.3744L51.7 48.4026L51.5013 48.3744L51.2954 48.3451L51.2921 48.3447L51.2885 48.3442L47.7492 47.8239C45.9977 47.5666 44.4308 48.9655 44.4307 50.7865V51.3677H44.4539C44.4387 51.4466 44.4308 51.5263 44.4307 51.6068C44.4308 53.2597 47.6854 54.5998 51.7 54.5998C55.7146 54.5998 58.9688 53.2597 58.9691 51.6068C58.9691 51.5263 58.9611 51.4466 58.9459 51.3677H58.9693V50.7865Z" fill="${PLACE_BADGE_FILL}"/>
      </g>
      <g filter="url(#cluster-map-pin-badge-shadow)">
        <path d="M99.3436 33.2436C99.3436 20.3786 88.9144 9.94946 76.0495 9.94946C63.1845 9.94946 52.7554 20.3786 52.7554 33.2436C52.7554 46.1085 63.1845 56.5377 76.0495 56.5377C88.9144 56.5377 99.3436 46.1085 99.3436 33.2436Z" fill="#15B344"/>
        <text x="76.05" y="${badgeY}" text-anchor="middle" fill="${MAP_PIN_WHITE}" font-family="Pretendard, sans-serif" font-size="${badgeFontSize}" font-weight="700">${badgeLabel}</text>
      </g>
      <defs>
        <filter id="cluster-map-pin-shadow" x="0" y="16.2" width="104.8" height="104.8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="5.6"/>
          <feGaussianBlur stdDeviation="11.2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
        <filter id="cluster-map-pin-badge-shadow" x="47.1145" y="5.71883" width="57.8699" height="57.8699" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="1.41021"/>
          <feGaussianBlur stdDeviation="2.82042"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.12 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>`;
};

export const createMapPinIcon = (
  pin: LockerPinItemResponse,
  _isSelected = false,
): string => {
  if (pin.pinType === "CLUSTER") {
    const pinCount = pin.pinCount ?? 0;
    return `<div data-type="${pin.pinType}" data-map-pin-variant="cluster" style="position: relative; display: block; width: 100%; height: 100%;">
      ${createClusterPinSvg(pinCount)}
    </div>`;
  }

  const isPlace = pin.pinType === "PLACE";
  const lockerCount = pin.lockerCount ?? 0;
  const badgeLabel = lockerCount > 9 ? "9+" : String(lockerCount);

  if (!isPlace) {
    const isFavorite = pin.isFavorite === true;
    const icon = isFavorite
      ? createFavoriteLockerMapPinSvg()
      : createSelectedLockerMapPinSvg();

    return `<div data-type="${pin.pinType}" data-map-pin-variant="${isFavorite ? "save" : "selected"}" style="position: relative; display: block; width: 100%; height: 100%;">
      ${icon}
    </div>`;
  }

  return `<div data-type="${pin.pinType}" data-map-pin-variant="cluster" style="position: relative; display: block; width: 100%; height: 100%;">
    ${createPlaceClusterMapPinSvg(badgeLabel)}
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
    offset: LockerMarkerOffset,
  ) => void;
  onClusterClick?: (bounds: LockerBoundsRaw) => void;
  registry?: LockerMarkerRegistry;
  spreadCenter?: { lat: number; lng: number } | null;
  preservedOffsets?: ReadonlyMap<string, LockerMarkerOffset>;
}

interface LockerMarkerEntry {
  marker: naver.maps.Marker;
  iconSignature: string;
  listener?: naver.maps.MapEventListener;
  listenerHandler?: SyncLockerMarkersOptions["onSelectLocker"];
  listenerClusterHandler?: SyncLockerMarkersOptions["onClusterClick"];
  listenerPin?: LockerPinItemResponse;
  listenerPinId?: string;
  offset: LockerMarkerOffset;
  positionSignature: string;
  zIndex: number;
  wasSelectedBefore?: boolean;
  hadSpreadBefore?: boolean;
}

export type LockerMarkerRegistry = Map<string, LockerMarkerEntry>;

type ZIndexableMarker = naver.maps.Marker & {
  setZIndex?: (zIndex: number) => void;
};

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

const createCoordinateOffsetMap = (
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
        offsetX: Math.round(MARKER_SPREAD_RADIUS_PX * Math.cos(angle)),
        offsetY: Math.round(MARKER_SPREAD_RADIUS_PX * Math.sin(angle)),
      });
    });
  }

  return offsetMap;
};

const getPinSortKey = (pin: LockerPinItemResponse): string => {
  if (pin.pinType === "LOCKER") {
    return `1-${pin.lockerId ?? Number.MAX_SAFE_INTEGER}`;
  }
  if (pin.pinType === "PLACE") {
    return `2-${pin.placeId ?? Number.MAX_SAFE_INTEGER}`;
  }
  return `3-${pin.latitude}-${pin.longitude}`;
};

const getDistance = (left: naver.maps.Point, right: naver.maps.Point) =>
  Math.hypot(left.x - right.x, left.y - right.y);

const createOffsetMapFromGroups = (
  groups: LockerPinItemResponse[][],
): Map<string, { offsetX: number; offsetY: number }> => {
  const offsetMap = new Map<string, { offsetX: number; offsetY: number }>();

  for (const group of groups) {
    if (group.length <= 1) continue;

    [...group]
      .sort((left, right) =>
        getPinSortKey(left).localeCompare(getPinSortKey(right)),
      )
      .forEach((pin, index) => {
        const angle = (2 * Math.PI * index) / group.length;

        offsetMap.set(getPinId(pin), {
          offsetX: Math.round(MARKER_SPREAD_RADIUS_PX * Math.cos(angle)),
          offsetY: Math.round(MARKER_SPREAD_RADIUS_PX * Math.sin(angle)),
        });
      });
  }

  return offsetMap;
};

const createProximityOffsetMap = (
  pins: LockerPinItemResponse[],
  maps: typeof naver.maps,
  projection: naver.maps.MapSystemProjection | null,
): Map<string, { offsetX: number; offsetY: number }> => {
  if (!projection) {
    return createCoordinateOffsetMap(pins);
  }

  const projectedPins = pins
    .filter((pin) => pin.pinType !== "CLUSTER")
    .map((pin) => ({
      pin,
      point: projection.fromCoordToOffset(
        new maps.LatLng(pin.latitude, pin.longitude),
      ),
    }));

  const visited = new Set<string>();
  const groups: LockerPinItemResponse[][] = [];

  for (const item of projectedPins) {
    const pinId = getPinId(item.pin);
    if (visited.has(pinId)) continue;

    const group: LockerPinItemResponse[] = [];
    const queue = [item];
    visited.add(pinId);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      group.push(current.pin);

      for (const next of projectedPins) {
        const nextPinId = getPinId(next.pin);
        if (visited.has(nextPinId)) continue;
        if (
          getDistance(current.point, next.point) > MARKER_PROXIMITY_THRESHOLD_PX
        ) {
          continue;
        }

        visited.add(nextPinId);
        queue.push(next);
      }
    }

    groups.push(group);
  }

  return createOffsetMapFromGroups(groups);
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
  if (pin.pinType === "CLUSTER") {
    const pinCount = pin.pinCount ?? 0;
    return pinCount >= 10 ? CLUSTER_L_DISPLAY_SIZE : CLUSTER_S_DISPLAY_SIZE;
  }
  if (pin.pinType === "PLACE") return PLACE_MARKER_DISPLAY_SIZE;
  if (pin.isFavorite === true) return FAVORITE_LOCKER_MARKER_DISPLAY_SIZE;
  return LOCKER_MARKER_DISPLAY_SIZE;
};

const getMarkerAnchor = (
  pin: LockerPinItemResponse,
  offsetX = 0,
  offsetY = 0,
) => {
  if (pin.pinType === "CLUSTER") {
    const pinCount = pin.pinCount ?? 0;
    const anchor = pinCount >= 10 ? CLUSTER_L_ANCHOR : CLUSTER_S_ANCHOR;
    return {
      x: anchor.x - offsetX,
      y: anchor.y - offsetY,
    };
  }
  const anchor =
    pin.pinType === "PLACE" ? PLACE_MARKER_ANCHOR : DEFAULT_MARKER_ANCHOR;
  return {
    x: anchor.x - offsetX,
    y: anchor.y - offsetY,
  };
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
  const markerAnchor = getMarkerAnchor(pin, offsetX ?? 0, offsetY ?? 0);

  const spreadClass = shouldAnimateSpread && hasSpread ? "spread" : "";
  const spreadStyle =
    shouldAnimateSpread && hasSpread
      ? `--spread-x: ${spreadX}px; --spread-y: ${spreadY}px;`
      : "";
  const offsetAttributes = hasOffset
    ? ` data-offset-x="${offsetX}" data-offset-y="${offsetY}"`
    : "";

  const options = {
    content: `<div class="map-marker-offset-wrapper"${offsetAttributes} style="width: ${markerSize.width}px; height: ${markerSize.height}px;">
      <div class="map-marker-item ${animationState} ${spreadClass}" style="width: 100%; height: 100%; ${spreadStyle}">
        ${createLockerMarkerIcon(pin, isSelected)}
      </div>
    </div>`,
    size: new maps.Size(markerSize.width, markerSize.height),
    anchor: new maps.Point(markerAnchor.x, markerAnchor.y),
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
  const countPart =
    pin.pinType === "CLUSTER" ? (pin.pinCount ?? "") : (pin.lockerCount ?? "");
  return `${pin.pinType}:${countPart}:${isSelected ? "selected" : "default"}${favoriteSignature}${
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
    title:
      pin.pinType === "LOCKER"
        ? "보관함"
        : pin.pinType === "PLACE"
          ? "보관함 모음"
          : "클러스터",
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
  onSelectLocker:
    | ((
        pinType: "LOCKER" | "PLACE",
        id: number,
        pin: LockerPinItemResponse,
        offset: LockerMarkerOffset,
      ) => void)
    | undefined,
  onClusterClick: ((bounds: LockerBoundsRaw) => void) | undefined,
) => {
  const pinId = getPinId(pin);
  entry.listenerPin = pin;

  if (
    entry.listener &&
    entry.listenerPinId === pinId &&
    entry.listenerHandler === onSelectLocker &&
    entry.listenerClusterHandler === onClusterClick
  ) {
    return;
  }

  if (entry.listener) {
    maps.Event.removeListener(entry.listener);
  }

  entry.listener = maps.Event.addListener(entry.marker, "click", () => {
    const listenerPin = entry.listenerPin;
    if (!listenerPin) return;

    if (listenerPin.pinType === "CLUSTER" && onClusterClick) {
      if (listenerPin.bounds) {
        onClusterClick(listenerPin.bounds);
      }
      return;
    }

    if (!onSelectLocker) return;
    const id =
      listenerPin.pinType === "LOCKER"
        ? listenerPin.lockerId
        : listenerPin.pinType === "PLACE"
          ? listenerPin.placeId
          : null;
    if (id == null) return;
    onSelectLocker(
      listenerPin.pinType as "LOCKER" | "PLACE",
      id,
      listenerPin,
      entry.offset,
    );
  });
  entry.listenerHandler = onSelectLocker;
  entry.listenerClusterHandler = onClusterClick;
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
  entry.listenerClusterHandler = undefined;
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
  onClusterClick,
  registry = new Map(),
  spreadCenter,
  preservedOffsets,
}: SyncLockerMarkersOptions) => {
  const nextPinIds = new Set(lockers.map(getPinId));

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
  const offsetMap = createProximityOffsetMap(lockers, maps, proj);
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
    const { offsetX = 0, offsetY = 0 } =
      offsetMap.get(pinId) ?? preservedOffsets?.get(pinId) ?? {};
    const offset = { offsetX, offsetY };

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
        (existingEntry.marker as ZIndexableMarker).setZIndex?.(zIndex);
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
      existingEntry.offset = offset;

      if (existingEntry.marker.getVisible() !== isVisible) {
        existingEntry.marker.setVisible(isVisible);
      }

      if (onSelectLocker || onClusterClick) {
        attachMarkerSelectListener(
          existingEntry,
          maps,
          pin,
          onSelectLocker,
          onClusterClick,
        );
      } else if (existingEntry.listener) {
        maps.Event.removeListener(existingEntry.listener);
        existingEntry.listener = undefined;
        existingEntry.listenerHandler = undefined;
        existingEntry.listenerClusterHandler = undefined;
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
      offset,
      positionSignature,
      zIndex,
      wasSelectedBefore: isSelected,
      hadSpreadBefore: hasSpread,
    };

    if (onSelectLocker || onClusterClick) {
      attachMarkerSelectListener(
        entry,
        maps,
        pin,
        onSelectLocker,
        onClusterClick,
      );
    }

    registry.set(pinId, entry);
  }

  return () => {
    clearLockerMarkers(registry, maps);
  };
};
