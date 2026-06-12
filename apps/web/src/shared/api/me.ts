import { apiClient } from "#/shared/lib/apiClient";
import type { BackendResponse } from "./lockers";

export interface MeProfileData {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
  status: string;
  providers: string[];
}

export type PatchMeProfileBody = {
  nickname?: string;
  profileImageUrl?: string;
};

const unwrapBackendData = <T>(response: BackendResponse<T> | undefined): T => {
  if (response?.data == null) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};

export const getMeProfile = async (
  signal?: AbortSignal,
): Promise<MeProfileData> => {
  const { data: response } = await apiClient.get<BackendResponse<MeProfileData>>(
    "/api/v1/me",
    { signal },
  );

  return unwrapBackendData(response);
};

export const patchMeProfile = async (
  body: PatchMeProfileBody,
  signal?: AbortSignal,
): Promise<MeProfileData> => {
  const { data: response } = await apiClient.patch<
    BackendResponse<MeProfileData>
  >("/api/v1/me", body, { signal });

  return unwrapBackendData(response);
};
