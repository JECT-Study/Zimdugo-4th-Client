import { useNaverMapSdk } from "#/entities/map";
import type { LockerMarkerOffset } from "#/entities/map/model/map-marker";
import type { ResolvePinFavorite } from "#/entities/map/model/map-pin-favorite";
import { useLockerMarkers } from "#/entities/map/model/useLockerMarkers";
import type {
  LockerBoundsRaw,
  LockerPinItemResponse,
  LockerPinSearchParams,
} from "#/shared/api/lockers";

export interface LockerMarkersLayerProps {
  map: naver.maps.Map | null;
  searchParams?: LockerPinSearchParams | null;
  selectedPinId?: string | null;
  selectedPin?: LockerPinItemResponse | null;
  onSelectPin?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
    offset: LockerMarkerOffset,
  ) => void;
  onClusterClick?: (bounds: LockerBoundsRaw) => void;
  spreadCenter?: { lat: number; lng: number } | null;
  resolveEffectiveFavorite?: ResolvePinFavorite;
}

/**
 * 보관함 핀을 지도에 얹는 층.
 *
 * 화면에 그리는 것이 없어 `null` 을 돌려준다. 마커는 지도 SDK 가 자기 캔버스에 직접
 * 그리므로, 이 컴포넌트가 하는 일은 "지금 무엇을 얹을지"를 훅에 넘기는 것뿐이다.
 * 컴포넌트로 두는 이유는 마운트·언마운트가 곧 층의 생몰이 되기 때문이다.
 */
export function LockerMarkersLayer({
  map,
  searchParams,
  selectedPinId,
  selectedPin,
  onSelectPin,
  onClusterClick,
  spreadCenter,
  resolveEffectiveFavorite,
}: LockerMarkersLayerProps) {
  const { maps } = useNaverMapSdk();

  useLockerMarkers({
    map,
    maps,
    searchParams,
    selectedPinId,
    selectedPin,
    onSelectLocker: onSelectPin,
    onClusterClick,
    spreadCenter,
    resolveEffectiveFavorite,
  });

  return null;
}
