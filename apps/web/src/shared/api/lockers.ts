import { httpGet } from "#/shared/lib/apiClient";

interface LockerPinBase {
  latitude: number;
  longitude: number;
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
}

const toLockerPinItem = (
  item: LockerPinItemRaw,
): LockerPinItemResponse | null => {
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
    };
  }

  return null;
};

export interface LockerPinData {
  count: number;
  items: LockerPinItemRaw[];
}

export interface BackendValidationError {
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

export type LockerItemType = "PLACE" | "LOCKER";

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
}

export interface LockerKeywordItemRaw {
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
  lockers: LockerNestedRaw[];
}

export interface LockerKeywordDataRaw {
  count: number;
  bounds: LockerBoundsRaw;
  items: LockerKeywordItemRaw[];
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
  distanceMeters?: number;
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

export interface LockerSearchLocationParams {
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
  signal?: AbortSignal;
}

export interface GetLockerKeywordParams
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

/**
 * @deprecated bounds 기반 API로 전환됨. 호환성을 위해 유지.
 */
export const ZOOM_TO_RADIUS_MAP: Record<number, number> = {
  10: 1000,
  11: 1000,
  12: 1000,
  13: 1000,
  14: 1000,
  15: 750,
  16: 500,
  17: 250,
  18: 100,
  19: 50,
  20: 25,
  21: 10,
};

/**
 * @deprecated bounds 기반 API로 전환됨. 호환성을 위해 유지.
 */
export const getRadiusFromZoom = (zoom: number): number => {
  if (zoom < 10) return 1000;
  if (zoom > 21) return 10;
  return ZOOM_TO_RADIUS_MAP[zoom] ?? 500;
};

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
  const { data: response } = await httpGet<BackendResponse<LockerPinData>>(
    "/api/v1/lockers/pin",
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

export const getLockerKeyword = async (
  params: GetLockerKeywordParams,
): Promise<LockerKeywordDataRaw> => {
  const { signal, ...queryParams } = params;
  const { data: response } = await httpGet<
    BackendResponse<LockerKeywordDataRaw>
  >("/api/v1/lockers/keyword", { params: queryParams, signal });

  return unwrapBackendData(response);
};

export const getLockerSuggest = async (
  params: GetLockerSuggestParams,
): Promise<LockerSuggestDataRaw> => {
  const { signal, ...queryParams } = params;
  const { data: response } = await httpGet<
    BackendResponse<LockerSuggestDataRaw>
  >("/api/v1/lockers/suggest", { params: queryParams, signal });

  return unwrapBackendData(response);
};

export const getPlaceLockers = async (
  params: GetPlaceLockersParams,
): Promise<PlaceLockersDataRaw> => {
  const { placeId, signal, ...queryParams } = params;
  const { data: response } = await httpGet<
    BackendResponse<PlaceLockersDataRaw>
  >(`/api/v1/places/${placeId}`, { params: queryParams, signal });

  return unwrapBackendData(response);
};

export const getLockerDetail = async (
  params: GetLockerDetailParams,
): Promise<LockerDetailRaw> => {
  const { lockerId, signal, ...queryParams } = params;
  const { data: response } = await httpGet<BackendResponse<LockerDetailRaw>>(
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

export interface SeoLockerResponseData {
  lockers: SeoLockerItem[];
}

export const getSeoLockers = async (
  signal?: AbortSignal,
): Promise<SeoLockerItem[]> => {
  const { data: response } = await httpGet<
    BackendResponse<SeoLockerResponseData>
  >("/api/v1/lockers/seo-list", { signal });

  const data = unwrapBackendData(response);
  return data.lockers || [];
};
