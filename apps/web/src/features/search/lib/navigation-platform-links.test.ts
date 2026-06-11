// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    setLanguageTag("ko");
  });

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

  it("카카오맵은 앱 딥링크와 웹 지도 URL을 분리해 만든다", () => {
    const links = getNavigationPlatformLinks("kakao", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    expect(links?.appUrl).toMatch(
      /^http:\/\/m\.map\.kakao\.com\/scheme\/route\?/,
    );
    expect(links?.webUrl).toContain("map.kakao.com/link/from/");
    expect(links?.webUrl).toContain("/to/");
    expect(links?.webUrl).not.toContain("nmap://");
    expect(links?.webUrl).not.toContain("intent://");

    const appUrl = new URL(links?.appUrl ?? "");
    expect(appUrl.searchParams.get("sp")).toBe(
      `${CURRENT_ORIGIN.lat.toFixed(5)},${CURRENT_ORIGIN.lng.toFixed(5)}`,
    );
    expect(appUrl.searchParams.get("ep")).toBe(
      `${LOCKER_WITH_COORDS.latitude!.toFixed(5)},${LOCKER_WITH_COORDS.longitude!.toFixed(5)}`,
    );
  });

  it("카카오맵 Android도 앱 딥링크와 웹 지도 URL을 분리해 만든다", () => {
    const links = getNavigationPlatformLinks("kakao", LOCKER_WITH_COORDS, {
      ...linkOptions(resolveNavigationOrigin(null)),
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
    });

    expect(links?.appUrl).toContain("http://m.map.kakao.com/scheme/route?");
    expect(links?.webUrl).toContain("map.kakao.com/link/from/");

    const appUrl = new URL(links?.appUrl ?? "");
    expect(appUrl.searchParams.get("sp")).toBe(
      `${DEFAULT_NAVIGATION_ORIGIN.lat.toFixed(5)},${DEFAULT_NAVIGATION_ORIGIN.lng.toFixed(5)}`,
    );
  });

  it("길찾기 열기는 데스크톱에서 웹 URL을 사용한다", () => {
    const assign = vi.fn();
    const links = getNavigationPlatformLinks(
      "kakao",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    openNavigationPlatformLinks(links!, {
      assign,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.webUrl);
  });

  it("Android UA에서는 앱 딥링크를 먼저 연다", () => {
    const assign = vi.fn();
    const links = getNavigationPlatformLinks("kakao", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
    });

    openNavigationPlatformLinks(links!, {
      assign,
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.appUrl);
  });

  it("iOS UA에서는 앱 딥링크를 먼저 연다", () => {
    const assign = vi.fn();
    const links = getNavigationPlatformLinks("kakao", LOCKER_WITH_COORDS, {
      ...linkOptions(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    openNavigationPlatformLinks(links!, {
      assign,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.appUrl);
  });
});
