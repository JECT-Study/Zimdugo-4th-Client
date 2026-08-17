import type { LocationRequestOutcome } from "./useLocationTracking";

interface ResolveLocationRequestSettlementOptions {
  outcome: LocationRequestOutcome;
  isUserInitiated: boolean;
}

interface LocationRequestSettlement {
  isPendingIntentClearRequired: boolean;
  isCameraCenterResetRequired: boolean;
  isErrorPopupRequired: boolean;
}

export const resolveLocationRequestSettlement = ({
  outcome,
  isUserInitiated,
}: ResolveLocationRequestSettlementOptions): LocationRequestSettlement => {
  const canPreservePendingIntent =
    outcome === "success" || outcome === "cancelled";
  const isErrorPopupRequired =
    isUserInitiated && (outcome === "timeout" || outcome === "unavailable");

  return {
    isPendingIntentClearRequired: !canPreservePendingIntent,
    isCameraCenterResetRequired: !canPreservePendingIntent,
    isErrorPopupRequired,
  };
};
