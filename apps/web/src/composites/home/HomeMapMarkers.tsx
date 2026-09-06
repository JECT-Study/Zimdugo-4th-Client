import type { LockerMarkerOffset } from "#/entities/map/model/map-marker";
import type { ResolvePinFavorite } from "#/entities/map/model/map-pin-favorite";
import { LockerMarkersLayer } from "#/entities/map/ui/LockerMarkersLayer";
import { SearchResultMarkersLayer } from "#/entities/map/ui/SearchResultMarkersLayer";
import type { MapMarkerLayerKind } from "#/features/search/model/map-marker-layer-policy";
import type {
  LockerBoundsRaw,
  LockerPinItemResponse,
  LockerPinSearchParams,
} from "#/shared/api/lockers";

type SelectPin = (
  pinType: "LOCKER" | "PLACE",
  id: number,
  pin: LockerPinItemResponse,
  offset: LockerMarkerOffset,
) => void;

interface HomeMapMarkersProps {
  /** 지금 무엇을 보여 줄 층인가. `null` 이면 아무것도 얹지 않는다. */
  layer: MapMarkerLayerKind | null;
  /** 지도가 준비됐는지. 준비되기 전에 얹으면 붙을 곳이 없다. */
  isMapReady: boolean;
  /**
   * 키워드 검색 조건.
   *
   * 있으면 검색 층을 이미 만들어진 핀 목록 대신 **지도가 직접 가져오는** 층으로 바꾼다.
   * 목록이 화면 밖의 핀까지 보여 주지 않도록, 지금 보이는 범위를 지도가 스스로 묻는다.
   * 검색 층이 아닐 때는 무시된다.
   */
  keywordSearchParams: LockerPinSearchParams | null;
  /** 층마다 다른 핀 목록. 지도가 직접 가져오는 `idle` 층에는 없다. */
  pins: Record<
    "search" | "mapPlace" | "selectedMapDetail",
    LockerPinItemResponse[]
  >;
  /** 층마다 다른 선택 핸들러. */
  onSelectPin: Record<
    "idle" | "search" | "mapPlace" | "selectedMapDetail",
    SelectPin
  >;
  onClusterClick: (bounds: LockerBoundsRaw) => void;
  resolveEffectiveFavorite: ResolvePinFavorite;
  /** 같은 자리에 겹친 핀들을 펼칠 중심. 호출자가 층과 장소를 보고 정한다. */
  spreadCenter?: { lat: number; lng: number };
  /** 고른 핀이 방금까지 있던 자리. 다시 그릴 때 튀지 않게 물려준다. */
  preservedOffsets?: ReadonlyMap<string, LockerMarkerOffset>;
}

/**
 * 지도 위에 핀을 얹는 층을 고르는 자리.
 *
 * 층이 넷인데 셋은 이미 만들어진 목록을 받고 하나(`idle`)와 키워드 검색은 지도가 직접
 * 가져온다. 어느 층이냐에 따라 어떤 컴포넌트에 어떤 목록과 핸들러를 주는지가 갈리는데,
 * 그 갈래가 라우트 JSX 안에서 삼중 삼항으로 접혀 있었다.
 *
 * 경로 라우트 전환(#215)의 1-3 에서 마커는 지도와 함께 레이아웃 라우트로 올라간다.
 * 컴포넌트로 세워 두면 그때 옮기는 것이 하나고, **무엇을 넘겨야 하는지가 prop 목록으로
 * 드러난다.** #238 이 지도 컨트롤에 한 것과 같다.
 */
export function HomeMapMarkers({
  layer,
  isMapReady,
  keywordSearchParams,
  pins,
  onSelectPin,
  onClusterClick,
  resolveEffectiveFavorite,
  spreadCenter,
  preservedOffsets,
}: HomeMapMarkersProps) {
  if (!isMapReady || layer === null) {
    return null;
  }

  if (layer === "idle") {
    return (
      <LockerMarkersLayer
        onSelectPin={onSelectPin.idle}
        onClusterClick={onClusterClick}
      />
    );
  }

  if (layer === "search" && keywordSearchParams !== null) {
    return (
      <LockerMarkersLayer
        searchParams={keywordSearchParams}
        onSelectPin={onSelectPin.search}
        onClusterClick={onClusterClick}
        resolveEffectiveFavorite={resolveEffectiveFavorite}
      />
    );
  }

  return (
    <SearchResultMarkersLayer
      pins={pins[layer]}
      onSelectLocker={onSelectPin[layer]}
      spreadCenter={layer === "selectedMapDetail" ? undefined : spreadCenter}
      preservedOffsets={
        layer === "selectedMapDetail" ? preservedOffsets : undefined
      }
    />
  );
}
