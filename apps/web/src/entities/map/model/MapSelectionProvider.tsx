import { createContext, type ReactNode, useContext } from "react";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export interface MapSelectionValue {
  /** 지금 선택된 핀의 id. 없으면 `null`. */
  selectedPinId: string | null;
  /**
   * 선택된 핀의 원본.
   *
   * id 와 따로 두는 이유는 둘의 출처가 다르기 때문이다. 지도에서 고른 핀은 원본을
   * 그대로 들고 있지만, 딥링크나 목록에서 연 상세는 보관함 번호만 알아 id 만 세운다.
   */
  selectedPin: LockerPinItemResponse | null;
}

const MapSelectionContext = createContext<MapSelectionValue | null>(null);

/**
 * 지도 위에서 무엇이 선택됐는지를 마커 층에 내려 주는 자리.
 *
 * 선택은 화면(시트)이 정하고 지도(마커 층)가 그린다. 지금은 한 컴포넌트가 둘 다 쥐고
 * 있어 prop 으로 건네지만, 경로 라우트 전환(#215)의 1-3·1-6 뒤에는 마커 층이 레이아웃
 * 라우트에, 시트가 `<Outlet>` 자식에 놓인다. 부모는 자식의 컨텍스트를 읽을 수 없으므로
 * 선택 상태는 **레이아웃보다 위**에 있어야 하고, 그 자리가 여기다.
 *
 * 읽기 전용이다. 선택을 바꾸는 일은 화면의 몫이라 여기서 내지 않는다 — #233 의
 * `MapRuntimeProvider` 와 같은 선긋기다.
 */
export function MapSelectionProvider({
  value,
  children,
}: {
  value: MapSelectionValue;
  children: ReactNode;
}) {
  return (
    <MapSelectionContext.Provider value={value}>
      {children}
    </MapSelectionContext.Provider>
  );
}

export function useMapSelection() {
  const context = useContext(MapSelectionContext);
  if (!context) {
    throw new Error(
      "useMapSelection must be used within MapSelectionProvider.",
    );
  }

  return context;
}
