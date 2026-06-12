import { apiClient } from "#/shared/lib/apiClient";

export type LockerVoteType = "CORRECT" | "INCORRECT";

export async function toggleLockerVote(
  userId: number,
  lockerId: number,
  voteType: LockerVoteType,
): Promise<void> {
  await apiClient.post(`/api/v1/lockers/${lockerId}/votes`, { voteType }, {
    params: { userId },
  });
}
