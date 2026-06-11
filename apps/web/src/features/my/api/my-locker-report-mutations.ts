import type { LockerReportCreateRequest } from "#/features/report/model/report-types";
import { apiClient } from "#/shared/lib/apiClient";
import type { BackendResponse } from "#/shared/api/lockers";

const unwrapBackendData = <T>(response: BackendResponse<T> | undefined): T => {
  if (response?.data == null) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};

export const updateMyLockerReport = async (
  reportId: number,
  payload: LockerReportCreateRequest,
  signal?: AbortSignal,
): Promise<void> => {
  const { data: response } = await apiClient.put<BackendResponse<unknown>>(
    `/api/v1/me/locker-reports/${reportId}`,
    payload,
    { signal },
  );

  unwrapBackendData(response);
};

export const deleteMyLockerReport = async (
  reportId: number,
  signal?: AbortSignal,
): Promise<void> => {
  const { data: response } = await apiClient.delete<BackendResponse<unknown>>(
    `/api/v1/me/locker-reports/${reportId}`,
    { signal },
  );

  unwrapBackendData(response);
};
