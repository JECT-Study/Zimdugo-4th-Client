import { httpGet } from "#/shared/lib/apiClient";

interface LockerPinBase {
  latitude: number;
  longitude: number;
  markerStatus?: "active" | "inactive";
}

export type LockerPinItemResponse =
  | (LockerPinBase & {
      pinType: "LOCKER";
      lockerId: number;
      placeId: null;
      isFavorite: boolean | null;
      lockerCount: null;
      pinCount: null;
      bounds: null;
    })
  | (LockerPinBase & {
      pinType: "PLACE";
      placeId: number;
      lockerId: null;
      isFavorite: null;
      lockerCount: number;
      pinCount: null;
      bounds: null;
    })
  | (LockerPinBase & {
      pinType: "CLUSTER";
      placeId: null;
      lockerId: null;
      isFavorite: null;
      lockerCount: null;
      pinCount: number;
      bounds: LockerBoundsRaw;
    });

interface LockerPinItemRaw {
  pinType: "LOCKER" | "PLACE" | "CLUSTER";
  placeId: number | null;
  lockerId: number | null;
  latitude: number;
  longitude: number;
  isFavorite?: boolean | null;
  lockerCount?: number | null;
  pinCount?: number | null;
  bounds?: LockerBoundsRaw | null;
  markerStatus?: "active" | "inactive";
}

const toLockerPinItem = (
  item: LockerPinItemRaw,
): LockerPinItemResponse | null => {
  if (item.pinType === "CLUSTER" && (item.pinCount ?? 0) <= 1) {
    if (item.lockerId !== null) {
      return toLockerPinItem({ ...item, pinType: "LOCKER" });
    }

    if (item.placeId !== null) {
      return toLockerPinItem({ ...item, pinType: "PLACE" });
    }
  }

  if (item.pinType === "LOCKER" && item.lockerId !== null) {
    return {
      pinType: "LOCKER",
      lockerId: item.lockerId,
      placeId: null,
      latitude: item.latitude,
      longitude: item.longitude,
      isFavorite: item.isFavorite ?? null,
      lockerCount: null,
      pinCount: null,
      bounds: null,
      markerStatus: item.markerStatus,
    };
  }

  if (item.pinType === "PLACE" && item.placeId !== null) {
    return {
      pinType: "PLACE",
      placeId: item.placeId,
      lockerId: null,
      latitude: item.latitude,
      longitude: item.longitude,
      isFavorite: null,
      lockerCount: item.lockerCount ?? 0,
      pinCount: null,
      bounds: null,
      markerStatus: item.markerStatus,
    };
  }

  if (
    item.pinType === "CLUSTER" &&
    item.pinCount != null &&
    item.pinCount > 1 &&
    item.bounds != null
  ) {
    return {
      pinType: "CLUSTER",
      placeId: null,
      lockerId: null,
      latitude: item.latitude,
      longitude: item.longitude,
      isFavorite: null,
      lockerCount: null,
      pinCount: item.pinCount,
      bounds: item.bounds,
      markerStatus: item.markerStatus,
    };
  }

  return null;
};

interface LockerPinData {
  count: number;
  items: LockerPinItemRaw[];
}

interface BackendValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface BackendResponse<T> {
  code: string;
  message: string;
  data: T;
  status?: number;
  timestamp?: string;
  path?: string;
  traceId?: string;
  validationErrors?: BackendValidationError[];
}

type LockerItemType = "PLACE" | "LOCKER";

export interface LockerBoundsRaw {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface LockerNestedRaw {
  lockerId: number;
  lockerName: string;
  roadAddress: string;
  lockerType: string;
  minPrice: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  updatedAt: string;
  isFavorite: boolean;
  startTime?: string;
  endTime?: string;
  operatingHours?: LockerOperatingHoursRaw | null;
}

export interface LockerSearchItemRaw {
  type: LockerItemType;
  placeId?: number;
  placeName?: string;
  lockerId?: number;
  lockerName?: string;
  roadAddress: string;
  lockerType?: string;
  minPrice?: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  updatedAt?: string;
  isFavorite?: boolean;
  startTime?: string;
  endTime?: string;
  operatingHours?: LockerOperatingHoursRaw | null;
  lockers: LockerNestedRaw[];
}

export interface LockerSearchDataRaw {
  count: number;
  bounds: LockerBoundsRaw;
  items: LockerSearchItemRaw[];
}

export interface LockerSuggestItemRaw {
  type: LockerItemType;
  placeId: number;
  placeName: string;
  lockerId: number;
  lockerName: string;
  roadAddress: string;
  lockerType: string;
  distanceMeters: number;
  updatedAt: string;
}

export interface LockerSuggestDataRaw {
  count: number;
  items: LockerSuggestItemRaw[];
}

export interface PlaceLockersDataRaw {
  placeId: number;
  placeName: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  bounds: LockerBoundsRaw;
  lockers: LockerNestedRaw[];
}

export interface LockerOperatingHoursRaw {
  open: string;
  close: string;
}

interface LockerRealtimeAvailabilityRaw {
  isAvailable: boolean;
  smallAvailableCount: number;
  mediumAvailableCount: number;
  largeAvailableCount: number;
  fetchedAt: string;
}

export interface LockerDetailRaw {
  lockerId: number;
  lockerName: string;
  placeId?: number;
  placeName?: string;
  roadAddress: string;
  lockerType: string;
  indoorOutdoorType?: string;
  groundLevelType?: string;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  lockerSizes?: string[];
  latitude: number;
  longitude: number;
  distanceMeters: number;
  updatedAt?: string;
  isFavorite?: boolean;
  startTime?: string;
  endTime?: string;
  detailInfo?: string;
  imageUrl?: string;
  accurateVoteCount?: number;
  inaccurateVoteCount?: number;
  createdAt?: string;
  isAccurateVoted?: boolean;
  isInaccurateVoted?: boolean;
  realtimeAvailability: LockerRealtimeAvailabilityRaw | null;
  /** @deprecated Swagger는 operatingHours 대신 startTime/endTime */
  operatingHours?: LockerOperatingHoursRaw | null;
  /** @deprecated Swagger는 floor 사용 */
  floorLabel?: string;
  /** @deprecated Swagger는 lockerSizes 사용 */
  sizeLabel?: string;
  /** @deprecated Swagger는 detailInfo 사용 */
  detailHelpText?: string;
  /** @deprecated Swagger는 accurateVoteCount 사용 */
  accurateCount?: number;
  /** @deprecated Swagger는 inaccurateVoteCount 사용 */
  inaccurateCount?: number;
}

interface LockerSearchLocationParams {
  lat: number;
  lng: number;
}

export interface LockerSearchFilterParams {
  sizeTypes?: string[];
  lockerTypes?: string[];
  indoorOutdoorTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
}

export interface LockerPinSearchParams
  extends LockerSearchLocationParams,
    Pick<
      LockerSearchFilterParams,
      | "sizeTypes"
      | "lockerTypes"
      | "indoorOutdoorTypes"
      | "minPrice"
      | "maxPrice"
      | "isFree"
    > {
  keyword: string;
}

export interface PlaceLockersFilterParams {
  sizeTypes?: string[];
  indoorOutdoorTypes?: string[];
  lockerTypes?: string[];
}

export interface GetLockerPinsParams {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  zoom: number;
  lat?: number;
  lng?: number;
  keyword?: string;
  sizeTypes?: string[];
  lockerTypes?: string[];
  indoorOutdoorTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  signal?: AbortSignal;
}

export interface GetLockerSearchParams
  extends LockerSearchLocationParams,
    LockerSearchFilterParams {
  keyword: string;
  signal?: AbortSignal;
}

export interface GetLockerSuggestParams extends LockerSearchLocationParams {
  keyword: string;
  signal?: AbortSignal;
}

export interface GetPlaceLockersParams
  extends LockerSearchLocationParams,
    PlaceLockersFilterParams {
  placeId: number;
  signal?: AbortSignal;
}

export interface GetLockerDetailParams extends LockerSearchLocationParams {
  lockerId: number;
  signal?: AbortSignal;
}

const unwrapBackendData = <T>(response: BackendResponse<T> | undefined): T => {
  if (!response?.data) {
    throw new Error(response?.message ?? "API response data is missing.");
  }

  return response.data;
};

export const getLockerPins = async (
  params: GetLockerPinsParams,
): Promise<LockerPinItemResponse[]> => {
  const { signal, ...queryParams } = params;
  const response = await httpGet<BackendResponse<LockerPinData>>(
    "/api/v1/lockers/pins",
    { params: queryParams, signal },
  );

  const items = response?.data?.items;
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(toLockerPinItem)
    .filter((item): item is LockerPinItemResponse => item !== null);
};

export const getLockerSearch = async (
  params: GetLockerSearchParams,
): Promise<LockerSearchDataRaw> => {
  const { signal, ...queryParams } = params;
  const response = await httpGet<BackendResponse<LockerSearchDataRaw>>(
    "/api/v1/lockers/search",
    { params: queryParams, signal },
  );

  return unwrapBackendData(response);
};

export const getLockerSuggest = async (
  params: GetLockerSuggestParams,
): Promise<LockerSuggestDataRaw> => {
  const { signal, ...queryParams } = params;
  const response = await httpGet<BackendResponse<LockerSuggestDataRaw>>(
    "/api/v1/lockers/suggest",
    { params: queryParams, signal },
  );

  return unwrapBackendData(response);
};

export const getPlaceLockers = async (
  params: GetPlaceLockersParams,
): Promise<PlaceLockersDataRaw> => {
  const { placeId, signal, ...queryParams } = params;
  const response = await httpGet<BackendResponse<PlaceLockersDataRaw>>(
    `/api/v1/places/${placeId}`,
    { params: queryParams, signal },
  );

  return unwrapBackendData(response);
};

export const getLockerDetail = async (
  params: GetLockerDetailParams,
): Promise<LockerDetailRaw> => {
  const { lockerId, signal, ...queryParams } = params;
  const response = await httpGet<BackendResponse<LockerDetailRaw>>(
    `/api/v1/lockers/${lockerId}`,
    { params: queryParams, signal },
  );

  return unwrapBackendData(response);
};

export interface SeoLockerItem {
  lockerId: number;
  names: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    "zh-TW"?: string;
    "zh-tw"?: string;
  };
}

interface SeoLockerResponseData {
  lockers: SeoLockerItem[];
}

export const getSeoLockers = async (
  signal?: AbortSignal,
): Promise<SeoLockerItem[]> => {
  const response = await httpGet<BackendResponse<SeoLockerResponseData>>(
    "/api/v1/lockers/seo-list",
    { signal },
  );

  const data = unwrapBackendData(response);
  return data.lockers || [];
};
