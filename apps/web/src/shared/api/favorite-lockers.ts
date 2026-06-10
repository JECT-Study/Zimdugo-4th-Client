import { apiClient } from "#/shared/lib/apiClient";

export async function addFavoriteLocker(
  userId: number,
  lockerId: number,
): Promise<void> {
  await apiClient.post(`/api/v1/me/favorite-lockers/${lockerId}`, null, {
    params: { userId },
  });
}

export async function removeFavoriteLocker(
  userId: number,
  lockerId: number,
): Promise<void> {
  await apiClient.delete(`/api/v1/me/favorite-lockers/${lockerId}`, {
    params: { userId },
  });
}
