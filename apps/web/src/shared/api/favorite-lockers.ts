import { httpDelete, httpPost } from "#/shared/lib/apiClient";

export async function addFavoriteLocker(lockerId: number): Promise<void> {
  await httpPost(`/api/v1/me/favorite-lockers/${lockerId}`, null);
}

export async function removeFavoriteLocker(lockerId: number): Promise<void> {
  await httpDelete(`/api/v1/me/favorite-lockers/${lockerId}`);
}
