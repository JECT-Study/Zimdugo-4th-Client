import { createContext, type ReactNode, useContext } from "react";
import type { LocationEventBus } from "./useLocationEventBus";
import type {
  LocationData,
  LocationPermissionState,
  LocationRequestStatus,
} from "./useLocationTracking";

export interface MapLocationValue {
  /** 위치 권한이 지금 어떤 상태인가. */
  permission: LocationPermissionState;
  /** 위치를 계속 지켜보는 중인지. */
  isTracking: boolean;
  /** 지금 위치를 받아 오는 중인지. */
  isLocating: boolean;
  /** 마지막으로 받은 위치. 아직 없으면 `null`. */
  location: LocationData | null;
  /** 마지막 위치 요청이 남긴 오류. */
  error: GeolocationPositionError | null;
  /** 마지막 위치 요청의 진행·결말. */
  requestStatus: LocationRequestStatus;
  /**
   * 위치 추적을 시작한다.
   *
   * 읽기 전용 원칙(#233)에 넣는 예외다. 추적을 켜는 계기는 언제나 화면에 있고
   * — 내 위치 버튼, 홈 첫 진입 — 추적을 실제로 돌리는 것은 여전히 쥔 쪽이다.
   * `MapRuntimeValue.remount` 와 같은 갈래의 **명령**이지 소유가 아니다.
   */
  startTracking: () => void;
  /** 첫 위치를 듣는다. 반환값으로 정리한다. */
  subscribeFirstLocation: LocationEventBus["subscribeFirstLocation"];
  /** 위치 요청의 결말을 듣는다. 반환값으로 정리한다. */
  subscribeRequestSettled: LocationEventBus["subscribeRequestSettled"];
}

const MapLocationContext = createContext<MapLocationValue | null>(null);

/**
 * 위치 추적을 쥔 쪽이 그 아래에 지금 위치를 내려 주는 자리.
 *
 * 경로 라우트 전환(#215)의 1-3 에서 위치 추적은 레이아웃 라우트로 올라간다. 지도의
 * 초기 카메라(`resolveMapBootstrapViewport`)가 `permission` 과 GPS 를 보기 때문에,
 * 지도를 올리려면 위치가 **먼저** 올라가 있어야 한다. 그러면 `<Outlet>` 자식에 남는
 * 팝업·안내는 위치를 prop 으로 받을 길이 없다. 그 통로를 미리 세운다.
 *
 * 값을 바꾸는 일은 넣지 않는다. `startTracking` 은 명령이라 예외고, 그 이유는 위에
 * 적었다. 알림 둘은 #242 에서 뒤집어 둔 것을 그대로 흘려보낸다 — 위치 추적이 자식의
 * 핸들러를 받지 않고, 자식이 듣는다.
 *
 * 방향 센서(`useDeviceOrientation`)는 아직 여기 없다. 내 위치 마커가 방향을 보므로
 * 마커가 올라갈 때 함께 온다.
 */
export function MapLocationProvider({
  value,
  children,
}: {
  value: MapLocationValue;
  children: ReactNode;
}) {
  return (
    <MapLocationContext.Provider value={value}>
      {children}
    </MapLocationContext.Provider>
  );
}

export function useMapLocation() {
  const context = useContext(MapLocationContext);
  if (!context) {
    throw new Error("useMapLocation must be used within MapLocationProvider.");
  }

  return context;
}
