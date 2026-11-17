import { useState } from "react";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import type { LockerMarkerOffset } from "#/entities/map/model/map-marker";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import type { MapScreen } from "./map-screen";
import type { SheetModeForContext } from "./sheet-session";

export const DEFAULT_SEARCH_COORDINATES = { lat: 37.498095, lng: 127.02761 };

export interface MapSheetSessionInput {
  /** 주소가 가리키는 화면. */
  screen: Pick<MapScreen, "target" | "lockerId">;
  /** 주소의 보관함 상세. 로더가 서버에서 채운다. */
  deepLinkDetail: LockerDetailItem | null | undefined;
}

export interface InitialMapSheetSession {
  sheetMode: SheetModeForContext;
  selectedLockerDetail: LockerDetailItem | null;
  selectedMapPin: LockerPinItemResponse | null;
}

/**
 * 첫 렌더에 그릴 시트.
 *
 * 화면은 주소가 정하므로 여기서는 "처음 그릴 것" 만 고른다. 상세는 로더가 내용을
 * 채웠을 때만 바로 연다. 내용 없이 열면 빈 시트가 뜨므로, 그때는 시트를 닫아 두고
 * 딥링크 처리가 내용을 받아 연다.
 */
export const resolveInitialMapSheetSession = ({
  screen,
  deepLinkDetail,
}: MapSheetSessionInput): InitialMapSheetSession => {
  const hasDetailContent =
    screen.target === "detail" &&
    screen.lockerId !== undefined &&
    Boolean(deepLinkDetail);

  return {
    sheetMode: hasDetailContent
      ? "detail"
      : screen.target === "list"
        ? "list"
        : "idle",
    selectedLockerDetail:
      screen.lockerId !== undefined ? (deepLinkDetail ?? null) : null,
    selectedMapPin:
      hasDetailContent && deepLinkDetail
        ? {
            pinType: "LOCKER",
            lockerId: screen.lockerId as number,
            placeId: null,
            latitude: deepLinkDetail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
            longitude:
              deepLinkDetail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
            isFavorite: null,
            lockerCount: null,
            pinCount: null,
            bounds: null,
          }
        : null,
  };
};

/**
 * 지금 **그려진** 시트와 그 위에 띄운 것.
 *
 * 어느 화면에 있어야 하는지(검색인지, 어떤 장소·보관함인지, 돌아갈 곳은 어디인지)는
 * 주소가 정한다(`map-screen`). 여기에 남은 것은 주소로 나타낼 수 없는 표현 상태다.
 *
 * - `sheetMode` — 그려진 시트. 핀 애니메이션이 끝난 뒤 시트를 여는 것처럼 주소를
 *   잠깐 늦게 따라가고, 필터 시트처럼 주소에 없는 단계도 있다.
 * - `selectedLockerDetail` — 서버 응답 전에 먼저 보여 줄 상세.
 * - `selectedMapPin`, `selectedMapPinOffset` — 지도에서 고른 핀과 그 자리.
 */
export function useMapSheetSession(input: MapSheetSessionInput) {
  // 첫 렌더에서 한 번만 계산한다. 이후의 변화는 화면이 주소를 따라가며 맞춘다.
  const [initial] = useState(() => resolveInitialMapSheetSession(input));

  const [sheetMode, setSheetMode] = useState<SheetModeForContext>(
    initial.sheetMode,
  );
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(initial.selectedLockerDetail);
  const [selectedMapPin, setSelectedMapPin] =
    useState<LockerPinItemResponse | null>(initial.selectedMapPin);
  const [selectedMapPinOffset, setSelectedMapPinOffset] =
    useState<LockerMarkerOffset | null>(null);

  return {
    sheetMode,
    setSheetMode,
    selectedLockerDetail,
    setSelectedLockerDetail,
    selectedMapPin,
    setSelectedMapPin,
    selectedMapPinOffset,
    setSelectedMapPinOffset,
  };
}
