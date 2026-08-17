import { describe, expect, it } from "vitest";
import { resolveLocationRequestSettlement } from "./location-request-settlement";
import type { LocationRequestOutcome } from "./useLocationTracking";

describe("resolveLocationRequestSettlement", () => {
  it.each<LocationRequestOutcome>(["success", "cancelled"])(
    "%s 결과에서는 진행 중인 사용자 의도를 보존한다",
    (outcome) => {
      expect(
        resolveLocationRequestSettlement({ outcome, isUserInitiated: true }),
      ).toEqual({
        isPendingIntentClearRequired: false,
        isCameraCenterResetRequired: false,
        isErrorPopupRequired: false,
      });
    },
  );

  it.each<LocationRequestOutcome>([
    "permission-denied",
    "unsupported",
    "timeout",
    "unavailable",
  ])("%s 결과에서는 진행 중인 사용자 의도를 정리한다", (outcome) => {
    const settlement = resolveLocationRequestSettlement({
      outcome,
      isUserInitiated: false,
    });

    expect(settlement.isPendingIntentClearRequired).toBe(true);
    expect(settlement.isCameraCenterResetRequired).toBe(true);
  });

  it.each<LocationRequestOutcome>(["timeout", "unavailable"])(
    "사용자가 시작한 %s 결과에서는 오류 팝업을 연다",
    (outcome) => {
      expect(
        resolveLocationRequestSettlement({ outcome, isUserInitiated: true })
          .isErrorPopupRequired,
      ).toBe(true);
    },
  );

  it.each<LocationRequestOutcome>(["timeout", "unavailable"])(
    "자동으로 시작한 %s 결과에서는 오류 팝업을 열지 않는다",
    (outcome) => {
      expect(
        resolveLocationRequestSettlement({ outcome, isUserInitiated: false })
          .isErrorPopupRequired,
      ).toBe(false);
    },
  );
});
