// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  DEFAULT_NAVIGATION_ORIGIN,
  encodeNaverCoordinate,
  getNavigationPlatformLinks,
  getNavigationPlatformUrl,
  hasNavigationDestination,
  openNavigationPlatformLinks,
  resolveNavigationOrigin,
  resolveNavigationOriginForDirections,
  sanitizeNaverNavigationLabel,
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

  it("이미 알고 있는 위치가 있으면 해당 좌표를 출발지로 사용한다", () => {
    expect(
      resolveNavigationOriginForDirections(CURRENT_ORIGIN),
    ).toEqual({
      origin: {
        lat: CURRENT_ORIGIN.lat,
        lng: CURRENT_ORIGIN.lng,
        label: "현재 위치",
      },
      permissionDenied: false,
      usedCurrentLocation: true,
    });
  });

  it("알려진 위치가 없으면 기본 출발지를 즉시 사용한다", () => {
    expect(resolveNavigationOriginForDirections(null)).toEqual({
      origin: DEFAULT_NAVIGATION_ORIGIN,
      permissionDenied: false,
      usedCurrentLocation: false,
    });
    expect(resolveNavigationOriginForDirections()).toEqual({
      origin: DEFAULT_NAVIGATION_ORIGIN,
      permissionDenied: false,
      usedCurrentLocation: false,
    });
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

  it("네이버 단축 좌표를 base62로 인코딩한다", () => {
    expect(encodeNaverCoordinate(126.9364)).toBe("3zfUVq");
    expect(encodeNaverCoordinate(37.5559)).toBe("2ALBpK");
  });

  it("네이버 길찾기 라벨에서 path 구분을 깨는 특수문자를 정리한다", () => {
    expect(
      sanitizeNaverNavigationLabel(
        "블루보틀커피 성수 카페 2번 무료 보관함 [주간전용]",
      ),
    ).toBe("블루보틀커피 성수 카페 2번 무료 보관함 주간전용");
    expect(sanitizeNaverNavigationLabel("A, B")).toBe("A B");
  });

  it("네이버지도는 map.naver.com/p/directions 웹 길찾기 URL을 만든다", () => {
    const links = getNavigationPlatformLinks(
      "naver",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    expect(links?.webUrl).toContain("map.naver.com/p/directions/");
    expect(links?.webUrl).toContain("3zfUVq,2ALBpK");
    expect(links?.webUrl).toContain("ADDRESS_POI");
    expect(links?.webUrl).toContain(encodeURIComponent("현재 위치"));
    expect(links?.webUrl).toContain(
      encodeURIComponent(LOCKER_WITH_COORDS.title),
    );
    expect(links?.webUrl).not.toMatch(/\/\d{8,}\./);
    expect(links?.webUrl).toMatch(/\/-\/transit$/);
  });

  it("도착지 이름의 대괄호는 네이버 URL에서 제거한다", () => {
    const lockerWithBracketTitle: LockerDetailItem = {
      ...LOCKER_WITH_COORDS,
      title: "테스트 보관함 [주간전용]",
    };
    const links = getNavigationPlatformLinks(
      "naver",
      lockerWithBracketTitle,
      linkOptions(),
    );

    expect(links?.webUrl).toContain(
      encodeURIComponent("테스트 보관함 주간전용"),
    );
    expect(links?.webUrl).not.toContain("%5B");
    expect(links?.webUrl).not.toContain("%5D");
  });

  it("길찾기 열기는 새 탭에서 연다", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const links = getNavigationPlatformLinks(
      "naver",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    openNavigationPlatformLinks(links!);
    expect(open).toHaveBeenCalledWith(
      links?.webUrl,
      "_blank",
      "noopener,noreferrer",
    );

    open.mockRestore();
  });

  it("길찾기 열기는 assign 옵션으로 열기 방식을 주입할 수 있다", () => {
    const assign = vi.fn();
    const links = getNavigationPlatformLinks(
      "naver",
      LOCKER_WITH_COORDS,
      linkOptions(),
    );

    openNavigationPlatformLinks(links!, { assign });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.webUrl);

    assign.mockClear();

    openNavigationPlatformLinks(links!, { assign });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.webUrl);

    assign.mockClear();

    openNavigationPlatformLinks(links!, { assign });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(links?.webUrl);
  });
});
