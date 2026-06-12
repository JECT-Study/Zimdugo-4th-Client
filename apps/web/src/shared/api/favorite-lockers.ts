import { apiClient } from "#/shared/lib/apiClient";

export async function addFavoriteLocker(lockerId: number): Promise<void> {
  await apiClient.post(`/api/v1/me/favorite-lockers/${lockerId}`, null);
}

export async function removeFavoriteLocker(lockerId: number): Promise<void> {
  await apiClient.delete(`/api/v1/me/favorite-lockers/${lockerId}`);
}
