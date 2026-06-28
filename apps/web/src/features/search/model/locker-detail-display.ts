import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";

const mergeLockerDetailDistance = (
  detail: LockerDetailItem,
  previousDetail: LockerDetailItem | null,
): LockerDetailItem => {
  if (!previousDetail || previousDetail.lockerId !== detail.lockerId) {
    return detail;
  }

  return {
    ...detail,
    distanceLabel: detail.distanceLabel || previousDetail.distanceLabel,
    distanceMeters: detail.distanceMeters ?? previousDetail.distanceMeters,
  };
};

export const mergeDisplayLockerDetailWithPreviousDistance = (
  detail: LockerDetailItem,
  previousDetail: LockerDetailItem | null,
): LockerDetailItem => mergeLockerDetailDistance(detail, previousDetail);

export const mergeStoredLockerDetailWithPreviousDistance = (
  detail: LockerDetailItem,
  previousDetail: LockerDetailItem | null,
): LockerDetailItem => {
  const detailSnapshot = {
    ...mergeLockerDetailDistance(detail, previousDetail),
  };

  delete detailSnapshot.isFavorite;
  delete detailSnapshot.accurateCount;
  delete detailSnapshot.inaccurateCount;
  delete detailSnapshot.isAccurateVoted;
  delete detailSnapshot.isInaccurateVoted;

  return detailSnapshot;
};
