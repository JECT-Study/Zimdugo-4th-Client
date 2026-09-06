import { useEffect, useMemo, useRef } from "react";
import type { MapViewportCoord } from "./map-idle-controller";
import {
  type ResolvedMapBootstrapViewport,
  resolveMapBootstrapViewport,
} from "./map-viewport-bootstrap";
import { useMapViewportStore } from "./map-viewport-store";
import type { LocationPermissionState } from "./useLocationTracking";

interface UseMapInitialCameraOptions {
  /** URL 이 가리키는 보관함 번호. 상세를 열고 있지 않으면 `undefined`. */
  lockerId: number | undefined;
  /** 딥링크가 들고 온 좌표. 상세를 연 뒤 URL 에서 지워진다. */
  focusLat: number | null | undefined;
  focusLng: number | null | undefined;
  /** 로더가 가져온 상세. */
  detail:
    | { latitude?: number | null; longitude?: number | null }
    | null
    | undefined;
  /** 좌표가 비어 있을 때 떨어질 자리. */
  fallbackCenter: MapViewportCoord;
  /** 상세를 볼 때 쓰는 줌. */
  detailZoom: number;
  permission: LocationPermissionState;
  location: MapViewportCoord | null;
  /**
   * 지도를 다시 만들 때 올라가는 키.
   *
   * 값을 읽지 않는다. 지도를 다시 만들 때 초기 카메라를 새로 계산하게 만드는
   * 트리거로만 쓴다.
   */
  remountKey: number;
}

/**
 * 지도를 만들 때 어디를 어느 배율로 비출지.
 *
 * 지도가 화면에서 받는 prop 중 마지막으로 남은 것이다. #236 이 `onMapPress` 를,
 * #242 가 위치 콜백을, #244 가 `onLoad` 를 끊었고 이것이 `initialCenter` 다.
 * 여기까지 오면 지도는 화면 상태를 하나도 보지 않는다.
 *
 * 보는 것이 전부 URL·로더·위치라, `<Outlet>` 위의 레이아웃도 같은 값을 만들 수 있다.
 * 시트가 어디까지 올라왔는지 같은 화면 상태는 하나도 보지 않는다.
 *
 * ## 딥링크 좌표를 기억하는 이유
 *
 * 딥링크로 상세를 열면 URL 이 `?openLockerId=…&focusLat=…&focusLng=…` 에서
 * `?locker=…` 로 다시 쓰인다. 좌표가 사라진 뒤에 테마를 바꾸면 지도를 다시 만드는데,
 * 그때 딥링크가 가리키던 자리를 잊으면 엉뚱한 곳에서 다시 뜬다. 그래서 마지막으로 본
 * 좌표를 들고 있다가 상세가 닫히면(=URL 에서 보관함이 사라지면) 버린다.
 */
export function useMapInitialCamera({
  lockerId,
  focusLat,
  focusLng,
  detail,
  fallbackCenter,
  detailZoom,
  permission,
  location,
  remountKey,
}: UseMapInitialCameraOptions): ResolvedMapBootstrapViewport {
  const rememberedDeepLinkCenterRef = useRef<MapViewportCoord | null>(null);

  /*
   * 렌더 중에 쓰지 않는다. 라우터 전환의 렌더는 버려질 수 있는데, 그때 이 ref 는
   * 살아 있는 트리와 공유되므로 버려진 렌더가 기억을 지워 버린다.
   *
   * 대신 한 렌더 늦는다. 상세를 닫은 그 렌더에서는 아직 옛 좌표를 들고 있다.
   * 이 값은 **지도를 만드는 순간에만** 읽히고, 지도를 다시 만드는 계기(테마 변경·
   * 새로고침)는 상세를 닫는 것과 다른 동작이라 같은 렌더에 겹치지 않는다.
   */
  useEffect(() => {
    if (focusLat != null && focusLng != null) {
      rememberedDeepLinkCenterRef.current = { lat: focusLat, lng: focusLng };
      return;
    }

    if (lockerId === undefined) {
      rememberedDeepLinkCenterRef.current = null;
    }
  }, [focusLat, focusLng, lockerId]);

  /**
   * 상세를 보고 있지 않을 때만 저장된 뷰포트를 쓴다. 딥링크로 연 상세는 그 자리를
   * 비춰야 하는데, 저장된 뷰포트가 있으면 그쪽이 이긴다.
   */
  const shouldPreferSavedViewport =
    lockerId !== undefined || focusLat != null || focusLng != null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: remountKey 는 재계산 트리거다
  return useMemo(() => {
    if (lockerId !== undefined && detail) {
      return {
        center: {
          lat: detail.latitude ?? fallbackCenter.lat,
          lng: detail.longitude ?? fallbackCenter.lng,
        },
        zoom: detailZoom,
      };
    }

    return resolveMapBootstrapViewport({
      deepLinkCenter:
        focusLat != null && focusLng != null
          ? { lat: focusLat, lng: focusLng }
          : rememberedDeepLinkCenterRef.current,
      cache: shouldPreferSavedViewport
        ? useMapViewportStore.getState().cache
        : null,
      permission,
      gps: permission === "granted" && location ? location : null,
    });
  }, [
    detail,
    detailZoom,
    fallbackCenter.lat,
    fallbackCenter.lng,
    focusLat,
    focusLng,
    location,
    lockerId,
    permission,
    remountKey,
    shouldPreferSavedViewport,
  ]);
}
