import { apiClient } from "#/shared/lib/apiClient";
import type { BackendResponse } from "./lockers";

export interface MyPageSummaryData {
  favoriteLockerCount: number;
  lockerReportCount: number;
}

export interface FavoriteLockerListItem {
  lockerId: number;
  lockerName: string;
  roadAddress: string;
  lockerType: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  updatedAt: string;
  isFavorite: boolean;
}

export interface PaginatedListData<T> {
  count: number;
  totalCount: number;
  hasNext: boolean;
  items: T[];
}

export interface MyLockerReportHistoryItem {
  reportId: number;
  lockerName: string;
  roadAddress: string;
  lockerType: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  updatedAt: string;
  imageUrl?: string | null;
}

export interface MyLockerReportDetail {
  reportId: number;
  lockerName: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  hasFloor: boolean;
  floorType: string | null;
  floorNumber: number | null;
  indoorOutdoorType: string | null;
  lockerType: string | null;
  sizeTypes: string[];
  isFree: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  startTime: string | null;
  endTime: string | null;
  additionalInfo: string | null;
  imageUrl: string | null;
  locationConsentAgreed: boolean;
}

export interface MyListLocationParams {
  lat: number;
  lng: number;
}

export interface MyPaginatedListParams extends MyListLocationParams {
  page: number;
  size: number;
  signal?: AbortSignal;
}

const unwrapBackendData = <T>(response: BackendResponse<T> | undefined): T => {
  if (response?.data == null) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};

export const getMyPageSummary = async (
  signal?: AbortSignal,
): Promise<MyPageSummaryData> => {
  const { data: response } = await apiClient.get<
    BackendResponse<MyPageSummaryData>
  >("/api/v1/me/summary", { signal });

  return unwrapBackendData(response);
};

export const getFavoriteLockerList = async (
  params: MyPaginatedListParams,
): Promise<PaginatedListData<FavoriteLockerListItem>> => {
  const { signal, ...queryParams } = params;
  const { data: response } = await apiClient.get<
    BackendResponse<PaginatedListData<FavoriteLockerListItem>>
  >("/api/v1/me/favorite-lockers", { params: queryParams, signal });

  return unwrapBackendData(response);
};

export const getMyLockerReportHistory = async (
  params: MyPaginatedListParams,
): Promise<PaginatedListData<MyLockerReportHistoryItem>> => {
  const { signal, ...queryParams } = params;
  const { data: response } = await apiClient.get<
    BackendResponse<PaginatedListData<MyLockerReportHistoryItem>>
  >("/api/v1/me/locker-reports", { params: queryParams, signal });

  return unwrapBackendData(response);
};

export const getMyLockerReportDetail = async (
  reportId: number,
  signal?: AbortSignal,
): Promise<MyLockerReportDetail> => {
  const { data: response } = await apiClient.get<
    BackendResponse<MyLockerReportDetail>
  >(`/api/v1/me/locker-reports/${reportId}`, { signal });

  return unwrapBackendData(response);
};
