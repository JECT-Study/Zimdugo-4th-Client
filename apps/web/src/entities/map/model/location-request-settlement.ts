import type { LocationRequestOutcome } from "./useLocationTracking";

interface ResolveLocationRequestSettlementOptions {
  outcome: LocationRequestOutcome;
  isUserInitiated: boolean;
}

interface LocationRequestSettlement {
  shouldClearPendingIntent: boolean;
  shouldResetCameraCentered: boolean;
  shouldOpenErrorPopup: boolean;
}

export const resolveLocationRequestSettlement = ({
  outcome,
  isUserInitiated,
}: ResolveLocationRequestSettlementOptions): LocationRequestSettlement => {
  const shouldPreservePendingIntent =
    outcome === "success" || outcome === "cancelled";
  const shouldOpenErrorPopup =
    isUserInitiated && (outcome === "timeout" || outcome === "unavailable");

  return {
    shouldClearPendingIntent: !shouldPreservePendingIntent,
    shouldResetCameraCentered: !shouldPreservePendingIntent,
    shouldOpenErrorPopup,
  };
};
