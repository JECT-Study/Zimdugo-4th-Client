import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import type {
  AppMapContext,
  MapDetailBack,
  SearchDetailBackTarget,
  SearchListKind,
  SheetModeForContext,
} from "./sheet-session";

const MAP_SHEET_SESSION_STORAGE_KEY = "zimdugo-map-sheet-session-v1";

export interface MapSheetSessionSnapshot {
  sheetMode: SheetModeForContext;
  context: AppMapContext;
  activeLockerId: number | null;
  selectedLockerDetail: LockerDetailItem | null;
  selectedMapPin: LockerPinItemResponse | null;
  mapPlaceId: number | null;
  mapDetailBack: MapDetailBack | null;
  listKind: SearchListKind | null;
  searchPlaceId: number | null;
  searchDetailBack: SearchDetailBackTarget | null;
}

export type MapSheetRestorableSession = Pick<
  MapSheetSessionSnapshot,
  | "mapPlaceId"
  | "mapDetailBack"
  | "listKind"
  | "searchPlaceId"
  | "searchDetailBack"
>;

export const readMapSheetSessionSnapshot =
  (): MapSheetSessionSnapshot | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem(MAP_SHEET_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as MapSheetSessionSnapshot;
    } catch {
      window.sessionStorage.removeItem(MAP_SHEET_SESSION_STORAGE_KEY);
      return null;
    }
  };

export const readRestoredSessionForTabReturn =
  (): MapSheetRestorableSession | null => {
    const snap = readMapSheetSessionSnapshot();
    if (!snap) {
      return null;
    }

    return {
      mapPlaceId: snap.mapPlaceId,
      mapDetailBack: snap.mapDetailBack,
      listKind: snap.listKind,
      searchPlaceId: snap.searchPlaceId,
      searchDetailBack: snap.searchDetailBack,
    };
  };

export const writeMapSheetSessionSnapshot = (
  snapshot: MapSheetSessionSnapshot | null,
) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!snapshot || snapshot.sheetMode === "idle") {
    window.sessionStorage.removeItem(MAP_SHEET_SESSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    MAP_SHEET_SESSION_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
};
