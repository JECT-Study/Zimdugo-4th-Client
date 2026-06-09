// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  it("renders two navigation platform choices", () => {
    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        navigationOrigin={NAVIGATION_ORIGIN}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("어떤 지도로 길찾기 할까요?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "네이버맵으로 길찾기" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "구글맵스로 길찾기" }),
    ).toBeTruthy();
  });

  it("builds directions urls with origin and destination coordinates", () => {
    expect(
      getNavigationPlatformUrl("naver", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("map.naver.com/p/directions/");
    expect(
      getNavigationPlatformUrl("google", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("google.com/maps/dir/");
    expect(
      getNavigationPlatformUrl("google", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain(
      `origin=${NAVIGATION_ORIGIN.lat},${NAVIGATION_ORIGIN.lng}`,
    );
    expect(
      getNavigationPlatformUrl("google", LOCKER_DETAIL, {
        navigationOrigin: NAVIGATION_ORIGIN,
      }),
    ).toContain("destination=37.5559,126.9364");
  });
});
