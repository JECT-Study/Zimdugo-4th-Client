import { useNaverMapSdk } from "#/entities/map";
import { useMapRuntime } from "#/entities/map/model/MapRuntimeProvider";
import type { LockerMarkerOffset } from "#/entities/map/model/map-marker";
import { useSearchResultMarkers } from "#/entities/map/model/useSearchResultMarkers";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export interface SearchResultMarkersLayerProps {
  pins: LockerPinItemResponse[];
  selectedPinId?: string | null;
  onSelectLocker: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
    offset: LockerMarkerOffset,
  ) => void;
  spreadCenter?: { lat: number; lng: number } | null;
  preservedOffsets?: ReadonlyMap<string, LockerMarkerOffset>;
}

/**
 * 검색 결과 핀을 지도에 얹는 층.
 *
 * `LockerMarkersLayer` 와 마찬가지로 그리는 것이 없어 `null` 을 돌려준다. 다른 점은 핀을
 * 스스로 가져오지 않고 이미 만들어진 목록을 받는다는 것이다. 무엇을 찾은 결과인지는
 * 검색 쪽이 알고, 이 층은 그것을 지도에 얹는 일만 안다.
 */
export function SearchResultMarkersLayer({
  pins,
  selectedPinId,
  onSelectLocker,
  spreadCenter,
  preservedOffsets,
}: SearchResultMarkersLayerProps) {
  const { maps } = useNaverMapSdk();
  const { map } = useMapRuntime();

  useSearchResultMarkers({
    map,
    maps,
    pins,
    selectedPinId,
    onSelectLocker,
    spreadCenter,
    preservedOffsets,
  });

  return null;
}
