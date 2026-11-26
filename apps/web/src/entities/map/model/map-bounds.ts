import type { LockerBoundsRaw } from "#/shared/api/lockers";

const SEARCH_MAP_TOP_PADDING_PX = 72;
export const CLUSTER_FIT_BOUNDS_TOP_PADDING_PX = 144;
export const CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX = 56;
export const CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX = 144;
export const MIN_FIT_BOUNDS_RADIUS_METERS = 250;
export const MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS = 500;

/** 범위를 맞출 때 좌우에 두는 기본 여백 */
export const FIT_BOUNDS_HORIZONTAL_PADDING_PX = 48;
const METERS_PER_LATITUDE_DEGREE = 111_320;
const WEB_MERCATOR_TILE_SIZE_PX = 256;
const MAX_MERCATOR_LATITUDE = 85.05112878;

export interface FitNaverMapBoundsOptions {
  map: naver.maps.Map | null | undefined;
  bounds: LockerBoundsRaw | null | undefined;
  maps?: typeof naver.maps | null;
  minRadiusMeters?: number;
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
}

export interface FocusNaverMapClusterBoundsOptions {
  map: naver.maps.Map | null | undefined;
  bounds: LockerBoundsRaw | null | undefined;
  maps?: typeof naver.maps | null;
  minZoom?: number;
  maxZoom?: number;
  minZoomStep?: number;
  maxZoomStep?: number;
  minRadiusMeters?: number;
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
  duration?: number;
}

const getLongitudeMetersPerDegree = (latitude: number) =>
  Math.max(
    METERS_PER_LATITUDE_DEGREE * Math.cos((latitude * Math.PI) / 180),
    1,
  );

export const normalizeLockerBounds = (
  bounds: LockerBoundsRaw,
  minRadiusMeters = MIN_FIT_BOUNDS_RADIUS_METERS,
): LockerBoundsRaw => {
  const swLat = Math.min(bounds.swLat, bounds.neLat);
  const neLat = Math.max(bounds.swLat, bounds.neLat);
  const swLng = Math.min(bounds.swLng, bounds.neLng);
  const neLng = Math.max(bounds.swLng, bounds.neLng);
  const centerLat = (swLat + neLat) / 2;
  const centerLng = (swLng + neLng) / 2;
  const minLatDelta = minRadiusMeters / METERS_PER_LATITUDE_DEGREE;
  const minLngDelta = minRadiusMeters / getLongitudeMetersPerDegree(centerLat);
  const latDelta = Math.max((neLat - swLat) / 2, minLatDelta);
  const lngDelta = Math.max((neLng - swLng) / 2, minLngDelta);

  return {
    swLat: centerLat - latDelta,
    swLng: centerLng - lngDelta,
    neLat: centerLat + latDelta,
    neLng: centerLng + lngDelta,
  };
};

export const fitNaverMapToBounds = ({
  map,
  bounds,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  minRadiusMeters = MIN_FIT_BOUNDS_RADIUS_METERS,
  topPadding = SEARCH_MAP_TOP_PADDING_PX,
  rightPadding = FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  bottomPadding = 120,
  leftPadding = FIT_BOUNDS_HORIZONTAL_PADDING_PX,
}: FitNaverMapBoundsOptions): boolean => {
  if (!map || !bounds || !maps?.LatLng || !maps.LatLngBounds) {
    return false;
  }

  const normalizedBounds = normalizeLockerBounds(bounds, minRadiusMeters);
  const sw = new maps.LatLng(normalizedBounds.swLat, normalizedBounds.swLng);
  const ne = new maps.LatLng(normalizedBounds.neLat, normalizedBounds.neLng);
  const latLngBounds = new maps.LatLngBounds(sw, ne);

  if (typeof map.fitBounds === "function") {
    map.fitBounds(latLngBounds, {
      top: topPadding,
      right: rightPadding,
      bottom: bottomPadding,
      left: leftPadding,
    });
    return true;
  }

  return false;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getMercatorY = (latitude: number): number => {
  const clampedLatitude = clamp(
    latitude,
    -MAX_MERCATOR_LATITUDE,
    MAX_MERCATOR_LATITUDE,
  );
  const sin = Math.sin((clampedLatitude * Math.PI) / 180);
  return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
};

const getMercatorX = (longitude: number): number => (longitude + 180) / 360;

export const getFitBoundsZoom = ({
  bounds,
  mapSize,
  topPadding = SEARCH_MAP_TOP_PADDING_PX,
  rightPadding = 48,
  bottomPadding = 120,
  leftPadding = 48,
}: {
  bounds: LockerBoundsRaw;
  mapSize: { width: number; height: number };
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
}): number => {
  const swLat = Math.min(bounds.swLat, bounds.neLat);
  const neLat = Math.max(bounds.swLat, bounds.neLat);
  const swLng = Math.min(bounds.swLng, bounds.neLng);
  const neLng = Math.max(bounds.swLng, bounds.neLng);
  const latSpan = Math.abs(getMercatorY(swLat) - getMercatorY(neLat));
  const lngSpan = Math.abs(getMercatorX(neLng) - getMercatorX(swLng));
  const availableWidth = Math.max(
    mapSize.width - leftPadding - rightPadding,
    1,
  );
  const availableHeight = Math.max(
    mapSize.height - topPadding - bottomPadding,
    1,
  );
  const lngZoom =
    lngSpan > 0
      ? Math.log2(availableWidth / (WEB_MERCATOR_TILE_SIZE_PX * lngSpan))
      : Number.POSITIVE_INFINITY;
  const latZoom =
    latSpan > 0
      ? Math.log2(availableHeight / (WEB_MERCATOR_TILE_SIZE_PX * latSpan))
      : Number.POSITIVE_INFINITY;
  const fitZoom = Math.floor(Math.min(lngZoom, latZoom));

  return Number.isFinite(fitZoom) ? fitZoom : 0;
};

/**
 * 목표 줌에서 화면 1px 이 가리키는 경도 폭.
 *
 * 타일 크기를 가정하지 않고 지금 지도가 실제로 보여 주는 범위에서 잰다. 커스텀 스타일을
 * 쓰는 GL(벡터) 지도는 같은 줌 값의 축척이 래스터 지도와 달라, 256px 타일 공식으로
 * 환산하면 보정 거리가 절반쯤으로 줄어든다. 지금 범위 ÷ 화면 폭을 목표 줌까지 2 배씩
 * 줄이면 어느 방식이든 그 지도의 축척을 그대로 따른다.
 *
 * 범위를 읽지 못하면(SDK 초기화 전 등) 래스터 기준 공식으로 물러난다.
 */
const getLongitudeDegreesPerPixel = ({
  map,
  mapSize,
  currentZoom,
  targetZoom,
}: {
  map: naver.maps.Map;
  mapSize: { width: number; height: number } | undefined;
  currentZoom: number;
  targetZoom: number;
}) => {
  const bounds = map.getBounds?.() as naver.maps.LatLngBounds | undefined;
  const ne = bounds?.getNE?.();
  const sw = bounds?.getSW?.();
  const width = mapSize?.width ?? 0;
  const longitudeSpan = ne && sw ? Math.abs(ne.lng() - sw.lng()) : 0;

  if (longitudeSpan > 0 && width > 0) {
    return (longitudeSpan / width) * 2 ** (currentZoom - targetZoom);
  }

  return 360 / (WEB_MERCATOR_TILE_SIZE_PX * 2 ** targetZoom);
};

export const focusNaverMapOnClusterBounds = ({
  map,
  bounds,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  minZoom,
  maxZoom = 16,
  minZoomStep = 2,
  maxZoomStep = 4,
  minRadiusMeters = MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
  topPadding = CLUSTER_FIT_BOUNDS_TOP_PADDING_PX,
  rightPadding = CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  bottomPadding = CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX,
  leftPadding = CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  duration = 800,
}: FocusNaverMapClusterBoundsOptions): boolean => {
  if (!map || !bounds || !maps?.LatLng) {
    return false;
  }

  const normalizedBounds = normalizeLockerBounds(bounds, minRadiusMeters);
  const centerLat = (normalizedBounds.swLat + normalizedBounds.neLat) / 2;
  const centerLng = (normalizedBounds.swLng + normalizedBounds.neLng) / 2;
  const currentZoom = map.getZoom?.() ?? 0;
  const mapSize = map.getSize?.();
  const minimumZoom = minZoom ?? Math.min(currentZoom + minZoomStep, maxZoom);
  const maximumZoom = Math.min(currentZoom + maxZoomStep, maxZoom);
  const fitZoom = mapSize
    ? getFitBoundsZoom({
        bounds: normalizedBounds,
        mapSize,
        topPadding,
        rightPadding,
        bottomPadding,
        leftPadding,
      })
    : minimumZoom;
  const targetZoom = clamp(fitZoom, minimumZoom, maximumZoom);
  /*
   * 좌우 여백이 다르면(데스크톱 왼쪽 카드) 남은 지도의 가운데가 화면 가운데에서
   * 옆으로 비켜 있다. fitBounds 와 달리 morph 는 중심만 받으므로, 그 차이만큼
   * 목표 줌의 경도 폭으로 환산해 중심을 옮긴다.
   */
  const horizontalShiftPx = (leftPadding - rightPadding) / 2;
  const degreesPerPixel = getLongitudeDegreesPerPixel({
    map,
    mapSize,
    currentZoom,
    targetZoom,
  });
  const targetLatLng = new maps.LatLng(
    centerLat,
    centerLng - horizontalShiftPx * degreesPerPixel,
  );

  if (typeof map.morph === "function") {
    map.morph(targetLatLng, targetZoom, {
      duration,
      easing: "easeOutCubic",
    });
    return true;
  }

  if (
    typeof map.setCenter === "function" &&
    typeof map.setZoom === "function"
  ) {
    map.setCenter(targetLatLng);
    map.setZoom(targetZoom);
    return true;
  }

  return false;
};
