import type { LockerBoundsRaw } from "#/shared/api/lockers";

export const SEARCH_MAP_TOP_PADDING_PX = 136;

export interface FitNaverMapBoundsOptions {
  map: naver.maps.Map | null | undefined;
  bounds: LockerBoundsRaw | null | undefined;
  maps?: typeof naver.maps | null;
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
}

export const fitNaverMapToBounds = ({
  map,
  bounds,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  topPadding = SEARCH_MAP_TOP_PADDING_PX,
  rightPadding = 48,
  bottomPadding = 120,
  leftPadding = 48,
}: FitNaverMapBoundsOptions): boolean => {
  if (!map || !bounds || !maps?.LatLng || !maps.LatLngBounds) {
    return false;
  }

  const sw = new maps.LatLng(bounds.swLat, bounds.swLng);
  const ne = new maps.LatLng(bounds.neLat, bounds.neLng);
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
