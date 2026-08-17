import { describe, expect, it } from "vitest";
import { canStartFreshLocationRequest } from "./location-request-retry";

describe("canStartFreshLocationRequest", () => {
  it.each(["delayed", "interrupted"] as const)(
    "%s 상태에서는 기존 요청을 새 요청으로 교체할 수 있다",
    (status) => {
      expect(
        canStartFreshLocationRequest({
          isTracking: status === "delayed",
          location: null,
          status,
        }),
      ).toBe(true);
    },
  );

  it("진행 중인 정상 요청은 중복으로 시작하지 않는다", () => {
    expect(
      canStartFreshLocationRequest({
        isTracking: true,
        location: null,
        status: "requesting",
      }),
    ).toBe(false);
  });

  it("이미 좌표가 있으면 새로운 요청을 시작하지 않는다", () => {
    expect(
      canStartFreshLocationRequest({
        isTracking: false,
        location: { lat: 37, lng: 127, heading: null },
        status: "success",
      }),
    ).toBe(false);
  });
});
