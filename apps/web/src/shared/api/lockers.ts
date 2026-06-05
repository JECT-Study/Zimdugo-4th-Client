import { httpGet } from "../lib/axios";

export interface LockerPinItemResponse {
  pinType: "LOCKER" | "PLACE";
  placeId: number | null;
  lockerId: number | null;
  latitude: number;
  longitude: number;
  lockerCount?: number;
}

export interface LockerPinData {
  count: number;
  items: LockerPinItemResponse[];
}

export interface BackendResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface GetLockerPinsParams {
  lat: number;
  lng: number;
  radius?: number;
}

// B안 확정: 줌 레벨에 따른 고정 반경(Max 1000m) 매핑
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

export const getRadiusFromZoom = (zoom: number): number => {
  if (zoom < 10) return 1000;
  if (zoom > 21) return 10;
  return ZOOM_TO_RADIUS_MAP[zoom] ?? 500;
};

export const getLockerPins = async (
  params: GetLockerPinsParams,
): Promise<LockerPinItemResponse[]> => {
  const { data: response } = await httpGet<BackendResponse<LockerPinData>>(
    "/api/v1/lockers/pin",
    {
      params,
    },
  );
  return response.data.items;
};
