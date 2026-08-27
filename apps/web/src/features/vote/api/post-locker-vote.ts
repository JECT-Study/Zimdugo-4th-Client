import { httpPost } from "#/shared/lib/apiClient";

export type LockerVoteType = "CORRECT" | "INCORRECT";

/** @deprecated 상세 화면에서 vote 기능 노출과 API 호출을 중단했다. */
export async function postLockerVote(
  lockerId: number,
  voteType: LockerVoteType,
): Promise<void> {
  await httpPost(`/api/v1/lockers/${lockerId}/votes`, { voteType });
}
