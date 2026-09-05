import { createContext, type ReactNode, useContext } from "react";
import type { useMapCamera } from "./useMapCamera";

export interface MapRuntimeValue {
  /** 지금 떠 있는 지도. 아직 만들어지지 않았으면 `null`. */
  map: naver.maps.Map | null;
  /** SDK 와 지도가 준비되는 중인지. */
  isLoading: boolean;
  /** 지도를 띄우지 못했는지. */
  hasError: boolean;
  /** 카메라에 내리는 명령. */
  camera: ReturnType<typeof useMapCamera>;
}

const MapRuntimeContext = createContext<MapRuntimeValue | null>(null);

/**
 * 지도를 소유한 쪽이 그 아래에 지도의 현재 상태를 내려 주는 자리.
 *
 * 지도를 만들고 부수는 일(`useMapInstance`)과 카메라에 명령을 내리는 일(`useMapCamera`)은
 * 소유자의 몫이고, 이 컨텍스트는 그 결과만 읽기 전용으로 흘려보낸다. `attach`·`remount`
 * 같은 쓰기는 넣지 않는다. 아래에서 지도를 갈아 끼울 수 있게 되면 소유가 두 곳이 된다.
 *
 * 경로 라우트 전환(#215)의 1-3 에서 지도는 레이아웃 라우트로 올라가고 화면은 `<Outlet>`
 * 의 자식이 된다. 그러면 화면은 지도를 prop 으로 받을 길이 없다. 그 통로를 미리 세운다.
 *
 * SDK 자체(스크립트·스타일·언어)는 `NaverMapProvider` 가 따로 맡는다. 이쪽은 그 SDK 로
 * 만들어진 **지도 하나**의 상태만 안다.
 */
export function MapRuntimeProvider({
  value,
  children,
}: {
  value: MapRuntimeValue;
  children: ReactNode;
}) {
  return (
    <MapRuntimeContext.Provider value={value}>
      {children}
    </MapRuntimeContext.Provider>
  );
}

export function useMapRuntime() {
  const context = useContext(MapRuntimeContext);
  if (!context) {
    throw new Error("useMapRuntime must be used within MapRuntimeProvider.");
  }

  return context;
}
