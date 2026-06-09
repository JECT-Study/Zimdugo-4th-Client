// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  DEFAULT_NAVIGATION_ORIGIN,
  getNavigationPlatformLinks,
  getNavigationPlatformUrl,
  hasNavigationDestination,
  NAVIGATION_ORIGIN_POSITION_OPTIONS,
  openNavigationPlatformLinks,
  resolveNavigationOrigin,
  resolveNavigationOriginWithPermissionRequest,
} from "./navigation-platform-links";

const LOCKER_WITHOUT_COORDS: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 B2층 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
};

const LOCKER_WITH_COORDS: LockerDetailItem = {
  ...LOCKER_WITHOUT_COORDS,
  latitude: 37.5559,
  longitude: 126.9364,
};

const CURRENT_ORIGIN = {
  lat: 37.5012,
  lng: 127.0396,
};

const WEB_ORIGIN = "https://app.zimdugo.com";

const linkOptions = (navigationOrigin = resolveNavigationOrigin(CURRENT_ORIGIN)) => ({
  navigationOrigin,
  webOrigin: WEB_ORIGIN,
});

describe("navigation-platform-links", () => {
  it("이미 알고 있는 위치가 있으면 GPS 재요청 없이 출발지를 반환한다", async () => {
    await expect(
      resolveNavigationOriginWithPermissionRequest({
        knownLocation: CURRENT_ORIGIN,
        getCurrentCoordinates: async () => {
          throw new Error("should not request geolocation");
        },
      }),
    ).resolves.toEqual({
      origin: {
        lat: CURRENT_ORIGIN.lat,
        lng: CURRENT_ORIGIN.lng,
        label: "현재 위치",
      },
      permissionDenied: false,
    });
  });

  it("길찾기 직전에 위치 권한을 요청해 출발지를 결정한다", async () => {
    await expect(
      resolveNavigationOriginWithPermissionRequest({
        getCurrentCoordinates: async () => ({
          lat: 37.5012,
          lng: 127.0396,
        }),
      }),
    ).resolves.toEqual({
      origin: {
        lat: 37.5012,
        lng: 127.0396,
        label: "현재 위치",
      },
      permissionDenied: false,
    });

    await expect(
      resolveNavigationOriginWithPermissionRequest({
        getCurrentCoordinates: async () => {
          throw { code: 1 };
        },
      }),
    ).resolves.toEqual({
      origin: DEFAULT_NAVIGATION_ORIGIN,
      permissionDenied: true,
    });

    await expect(
      resolveNavigationOriginWithPermissionRequest({
        getCurrentCoordinates: async () => {
          throw new Error("timeout");
        },
      }),
    ).resolves.toEqual({
      origin: DEFAULT_NAVIGATION_ORIGIN,
      permissionDenied: false,
    });
  });

  it("길찾기 출발지 조회 시 5초 타임아웃 옵션을 전달한다", async () => {
    const getCurrentCoordinates = vi.fn(async () => ({
      lat: 37.5012,
      lng: 127.0396,
    }));

    await resolveNavigationOriginWithPermissionRequest({
      getCurrentCoordinates,
    });

    expect(getCurrentCoordinates).toHaveBeenCalledWith(
      NAVIGATION_ORIGIN_POSITION_OPTIONS,
    );
    expect(NAVIGATION_ORIGIN_POSITION_OPTIONS.timeout).toBe(5_000);
  });

  it("출발지는 현재 위치를 우선하고 없으면 강남역 11번 출구로 폴백한다", () => {
    expect(resolveNavigationOrigin(CURRENT_ORIGIN)).toEqual({
      lat: CURRENT_ORIGIN.lat,
      lng: CURRENT_ORIGIN.lng,
      label: "현재 위치",
    });
    expect(resolveNavigationOrigin(null)).toEqual(DEFAULT_NAVIGATION_ORIGIN);
    expect(DEFAULT_NAVIGATION_ORIGIN.label).toBe("강남역 11번 출구");
  });

  it("도착지 좌표가 없으면 길찾기 URL을 만들지 않는다", () => {
    expect(hasNavigationDestination(LOCKER_WITHOUT_COORDS)).toBe(false);
    expect(
      getNavigationPlatformLinks(
        "google",
        LOCKER_WITHOUT_COORDS,
        linkOptions(),
      ),
    ).toBeNull();
  });

  it("구글맵은 출발지·도착지 좌표로 길찾기 URL을 만든다", () => {
    const links = getNavigationPlatformLinks(
      "google",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    expect(links?.appUrl).toBe(links?.webUrl);
    expect(links?.webUrl).toContain("google.com/maps/dir/");
    expect(decodeURIComponent(links?.webUrl ?? "")).toContain(
      `origin=${CURRENT_ORIGIN.lat},${CURRENT_ORIGIN.lng}`,
    );
    expect(decodeURIComponent(links?.webUrl ?? "")).toContain(
      "destination=37.5559,126.9364",
    );
    expect(
      getNavigationPlatformUrl("google", LOCKER_WITH_COORDS, linkOptions()),
    ).toBe(links?.webUrl ?? null);
  });

  it("네이버맵 iOS는 출발지·도착지가 포함된 길찾기 앱 스킴을 만든다", () => {
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    expect(links?.webUrl).toContain("m.map.naver.com/route.nhn");
    expect(links?.webUrl).toContain(`sy=${CURRENT_ORIGIN.lat}`);
    expect(links?.webUrl).toContain(`sx=${CURRENT_ORIGIN.lng}`);
    expect(links?.appUrl).toContain("nmap://route/public?");
    expect(links?.appUrl).toContain(`slat=${CURRENT_ORIGIN.lat}`);
    expect(links?.appUrl).toContain(`slng=${CURRENT_ORIGIN.lng}`);
    expect(links?.appUrl).toContain("dlat=37.5559");
    expect(links?.appUrl).toContain("dlng=126.9364");
    expect(decodeURIComponent(links?.appUrl ?? "")).toContain("현재 위치");
    expect(decodeURIComponent(links?.appUrl ?? "")).toContain(WEB_ORIGIN);
  });

  it("네이버맵 Android는 intent URL과 browser_fallback_url을 포함한다", () => {
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(resolveNavigationOrigin(null)),
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
    });

    expect(links?.appUrl).toContain("intent://route/public?");
    expect(links?.appUrl).toContain(`slat=${DEFAULT_NAVIGATION_ORIGIN.lat}`);
    expect(links?.appUrl).toContain("scheme=nmap");
    expect(links?.appUrl).toContain("package=com.nhn.android.nmap");
    expect(links?.appUrl).toContain("browser_fallback_url=");
    expect(decodeURIComponent(links?.appUrl ?? "")).toContain(
      links?.webUrl ?? "",
    );
    expect(links?.webUrl).toContain("m.map.naver.com/route.nhn");
    expect(links?.webUrl).toContain(`sy=${DEFAULT_NAVIGATION_ORIGIN.lat}`);
    expect(links?.webUrl).toContain(`sx=${DEFAULT_NAVIGATION_ORIGIN.lng}`);
  });

  it("네이버맵 데스크톱 웹은 index.nhn 길찾기 URL을 만든다", () => {
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });

    expect(links?.webUrl).toContain("map.naver.com/index.nhn");
    expect(links?.webUrl).toContain(`slat=${CURRENT_ORIGIN.lat}`);
    expect(links?.webUrl).toContain(`slng=${CURRENT_ORIGIN.lng}`);
    expect(links?.webUrl).toContain("menu=route");
  });

  it("데스크톱에서는 웹 URL만 연다", () => {
    const assign = vi.fn();
    const links = getNavigationPlatformLinks(
      "naver",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    openNavigationPlatformLinks(links!, {
      platform: "naver",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      assign,
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.webUrl);
  });

  it("Android 네이버맵은 intent URL만 열고 JS 폴백 타이머를 사용하지 않는다", () => {
    const assign = vi.fn();
    const setTimeoutFn = vi.fn();
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
    });

    openNavigationPlatformLinks(links!, {
      platform: "naver",
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
      assign,
      setTimeoutFn,
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.appUrl);
    expect(setTimeoutFn).not.toHaveBeenCalled();
  });

  it("모바일 네이버맵은 앱 URL을 먼저 열고 앱 미설치 시 웹으로 폴백한다", () => {
    vi.useFakeTimers();

    const assign = vi.fn();
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    openNavigationPlatformLinks(links!, {
      platform: "naver",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      assign,
      isDocumentHidden: () => false,
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.appUrl);

    vi.runAllTimers();

    expect(assign).toHaveBeenCalledTimes(2);
    expect(assign).toHaveBeenLastCalledWith(links?.webUrl);

    vi.useRealTimers();
  });

  it("모바일에서 앱이 열리면 웹 폴백을 취소한다", () => {
    vi.useFakeTimers();

    const assign = vi.fn();
    let hidden = false;
    let visibilityListener: (() => void) | undefined;
    const links = getNavigationPlatformLinks("naver", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    openNavigationPlatformLinks(links!, {
      platform: "naver",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      assign,
      isDocumentHidden: () => hidden,
      addVisibilityListener: (listener) => {
        visibilityListener = listener;
        return () => undefined;
      },
    });

    hidden = true;
    visibilityListener?.();
    vi.runAllTimers();

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.appUrl);

    vi.useRealTimers();
  });
});
