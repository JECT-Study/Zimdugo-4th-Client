// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as navigationPlatformLinks from "#/features/search/lib/navigation-platform-links";
import type { LockerDetailItem } from "./LockerDetailBottomSheet";
import {
  getNavigationPlatformUrl,
  NavigationPlatformPopup,
} from "./NavigationPlatformPopup";

const LOCKER_DETAIL: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 B2층 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
  latitude: 37.5559,
  longitude: 126.9364,
};

const NAVIGATION_ORIGIN = {
  lat: 37.5012,
  lng: 127.0396,
  label: "현재 위치",
};

const DEFAULT_NAVIGATION_ORIGIN = {
  lat: 37.498095,
  lng: 127.02761,
  label: "강남역 11번 출구",
};

describe("NavigationPlatformPopup", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("네이버지도·구글맵스 길찾기 선택지를 렌더링한다", () => {
    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("어떤 지도로 길찾기 할까요?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "네이버지도로 길찾기" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "구글맵스로 길찾기" }),
    ).toBeTruthy();

    const naverMapButton = screen.getByRole("button", {
      name: "네이버지도로 길찾기",
    });
    const naverMapIcon = naverMapButton.querySelector("img");

    expect(naverMapIcon?.getAttribute("src")).toBe(
      "/icons/navigation/naver-map.jpg",
    );

    const googleMapsButton = screen.getByRole("button", {
      name: "구글맵스로 길찾기",
    });
    const googleMapsIcon = googleMapsButton.querySelector("img");

    expect(googleMapsIcon?.getAttribute("src")).toBe(
      "/icons/navigation/google-maps.jpg",
    );
  });

  it("출발지·도착지 좌표로 길찾기 URL을 만든다", () => {
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("map.naver.com/p/directions/");
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("3zfUVq,2ALBpK");
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("ADDRESS_POI");
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).not.toMatch(/\/\d{8,}\./);
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toMatch(/\/-\/transit$/);
    expect(
      getNavigationPlatformUrl("google", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("google.com/maps/dir/");
    expect(
      decodeURIComponent(
        getNavigationPlatformUrl("google", LOCKER_DETAIL, {
          navigationOrigin: NAVIGATION_ORIGIN,
        }) ?? "",
      ),
    ).toContain(`origin=${NAVIGATION_ORIGIN.lat},${NAVIGATION_ORIGIN.lng}`);
    expect(
      decodeURIComponent(
        getNavigationPlatformUrl("google", LOCKER_DETAIL, {
          navigationOrigin: NAVIGATION_ORIGIN,
        }) ?? "",
      ),
    ).toContain("destination=37.5559,126.9364");
  });

  it("이미 알고 있는 위치가 있으면 해당 좌표로 길찾기를 연다", () => {
    const onSelectPlatform = vi.fn();
    const open = vi
      .spyOn(navigationPlatformLinks, "openNavigationPlatformLinks")
      .mockImplementation(() => undefined);

    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        knownLocation={{ lat: 37.5012, lng: 127.0396 }}
        onOpenChange={() => undefined}
        onSelectPlatform={onSelectPlatform}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "구글맵스로 길찾기" }));

    const url = onSelectPlatform.mock.calls[0]?.[1] as string;
    expect(onSelectPlatform).toHaveBeenCalledWith(
      "google",
      url,
      LOCKER_DETAIL,
    );
    expect(decodeURIComponent(url)).toContain("origin=37.5012,127.0396");
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("네이버 버튼 선택 시 onSelectPlatform에 naver 플랫폼을 전달한다", () => {
    const onSelectPlatform = vi.fn();

    vi.spyOn(
      navigationPlatformLinks,
      "openNavigationPlatformLinks",
    ).mockImplementation(() => undefined);

    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        knownLocation={{ lat: 37.5012, lng: 127.0396 }}
        onOpenChange={() => undefined}
        onSelectPlatform={onSelectPlatform}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "네이버지도로 길찾기" }));

    expect(onSelectPlatform).toHaveBeenCalledWith(
      "naver",
      expect.stringContaining("map.naver.com/p/directions/"),
      LOCKER_DETAIL,
    );
  });

  it("현재 위치가 없으면 기본 출발지로 길찾기를 연다", () => {
    const onSelectPlatform = vi.fn();

    vi.spyOn(
      navigationPlatformLinks,
      "openNavigationPlatformLinks",
    ).mockImplementation(() => undefined);

    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        onOpenChange={() => undefined}
        onSelectPlatform={onSelectPlatform}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "구글맵스로 길찾기" }));

    const url = onSelectPlatform.mock.calls[0]?.[1] as string;
    expect(decodeURIComponent(url)).toContain(
      `origin=${DEFAULT_NAVIGATION_ORIGIN.lat},${DEFAULT_NAVIGATION_ORIGIN.lng}`,
    );
  });
});
