import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type { LockerVoteType } from "../api/post-locker-vote";
import type { LockerVoteServerState } from "../model/vote-locker-session";

export type ResolveEffectiveVoteFlags = (
  lockerId: number,
  server: LockerVoteServerState,
) => Required<LockerVoteServerState>;

export type ResolveEffectiveVoteCounts = (
  lockerId: number,
  server: Pick<
    LockerDetailItem,
    | "isAccurateVoted"
    | "isInaccurateVoted"
    | "accurateCount"
    | "inaccurateCount"
  >,
) => Pick<LockerDetailItem, "accurateCount" | "inaccurateCount"> | null;

/** @deprecated vote 기능 롤백 호환용으로 보존한다. */
export const applyVoteOverlayToLockerDetail = (
  locker: LockerDetailItem,
  resolveEffectiveVoteFlags: ResolveEffectiveVoteFlags,
  resolveEffectiveVoteCounts: ResolveEffectiveVoteCounts,
): LockerDetailItem => {
  const voteFlags = resolveEffectiveVoteFlags(locker.lockerId, {
    isAccurateVoted: locker.isAccurateVoted,
    isInaccurateVoted: locker.isInaccurateVoted,
  });
  const counts = resolveEffectiveVoteCounts(locker.lockerId, locker);

  return {
    ...locker,
    ...voteFlags,
    ...(counts ?? {}),
  };
};

export type VoteChangeHandler = (
  item: LockerDetailItem,
  voteType: LockerVoteType,
) => void;
