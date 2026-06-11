// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("NavigationPlatformPopup", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("카카오맵·구글맵스 길찾기 선택지를 렌더링한다", () => {
    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("어떤 지도로 길찾기 할까요?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "카카오맵으로 길찾기" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "구글맵스로 길찾기" }),
    ).toBeTruthy();
  });

  it("출발지·도착지 좌표로 길찾기 URL을 만든다", () => {
    expect(
      getNavigationPlatformUrl("kakao", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("map.kakao.com/link/from/");
    expect(
      getNavigationPlatformUrl("kakao", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("/to/");
    expect(
      getNavigationPlatformUrl("kakao", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).not.toContain("/by/");
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
    ).toContain(
      `origin=${NAVIGATION_ORIGIN.lat},${NAVIGATION_ORIGIN.lng}`,
    );
    expect(
      decodeURIComponent(
        getNavigationPlatformUrl("google", LOCKER_DETAIL, {
          navigationOrigin: NAVIGATION_ORIGIN,
        }) ?? "",
      ),
    ).toContain("destination=37.5559,126.9364");
  });

  it("이미 알고 있는 위치가 있으면 GPS 재요청 없이 길찾기를 연다", async () => {
    const getCurrentCoordinates = vi.fn(async () => {
      throw new Error("should not request geolocation");
    });

    vi.spyOn(
      navigationPlatformLinks,
      "resolveNavigationOriginWithPermissionRequest",
    ).mockImplementationOnce((options) =>
      navigationPlatformLinks.resolveNavigationOriginWithPermissionRequest({
        ...options,
        getCurrentCoordinates,
      }),
    );
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
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "구글맵스로 길찾기" }));

    await waitFor(() => {
      expect(getCurrentCoordinates).not.toHaveBeenCalled();
    });
  });

  it("지도 플랫폼 선택 시 위치 권한을 요청한다", async () => {
    const onSelectPlatform = vi.fn();

    vi.spyOn(
      navigationPlatformLinks,
      "resolveNavigationOriginWithPermissionRequest",
    ).mockResolvedValueOnce({
      origin: NAVIGATION_ORIGIN,
      permissionDenied: false,
    });
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

    await waitFor(() => {
      expect(
        navigationPlatformLinks.resolveNavigationOriginWithPermissionRequest,
      ).toHaveBeenCalledTimes(1);
      expect(
        navigationPlatformLinks.resolveNavigationOriginWithPermissionRequest,
      ).toHaveBeenCalledWith({ knownLocation: null });
    });
    expect(onSelectPlatform).toHaveBeenCalledWith(
      "google",
      expect.stringContaining("google.com/maps/dir/"),
      LOCKER_DETAIL,
    );
  });
});
