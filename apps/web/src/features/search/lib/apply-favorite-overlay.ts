import type {
  SearchLockerResultItem,
  SearchLockerResultItems,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

export type ResolveEffectiveFavorite = (
  lockerId: number,
  serverIsFavorite: boolean | undefined,
) => boolean;

const withFavoriteOverlay = <T extends SearchLockerResultItem>(
  locker: T,
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): T => ({
  ...locker,
  isFavorite: resolveEffectiveFavorite(locker.lockerId, locker.isFavorite),
});

export const applyFavoriteOverlayToLockerItems = (
  items: SearchLockerResultItem[],
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): SearchLockerResultItem[] =>
  items.map((item) => withFavoriteOverlay(item, resolveEffectiveFavorite));

export const applyFavoriteOverlayToSearchResultItems = (
  items: SearchResultItem[],
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): SearchResultItem[] =>
  items.map((item) => {
    if (item.itemType === "LOCKER") {
      return withFavoriteOverlay(item, resolveEffectiveFavorite);
    }

    return {
      ...item,
      lockers: item.lockers.map((locker) =>
        withFavoriteOverlay(locker, resolveEffectiveFavorite),
      ) as SearchLockerResultItems,
    };
  });

export const applyFavoriteOverlayToLockerDetail = (
  locker: LockerDetailItem,
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): LockerDetailItem => ({
  ...locker,
  isFavorite: resolveEffectiveFavorite(locker.lockerId, locker.isFavorite),
});

/**
 * 지도 핀에 즐겨찾기 상태를 덧입힌다.
 *
 * 목록과 상세는 이미 덧입히는데 여러 핀을 그리는 레이어만 빠져 있어, 즐겨찾기를 눌러도
 * 목록의 별만 바뀌고 지도 위 마커는 그대로였다.
 *
 * 장소 핀은 보관함 하나를 가리키지 않으므로 건드리지 않는다.
 */
export const applyFavoriteOverlayToPins = (
  pins: LockerPinItemResponse[],
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): LockerPinItemResponse[] =>
  pins.map((pin) =>
    pin.pinType === "LOCKER" && pin.lockerId != null
      ? {
          ...pin,
          isFavorite: resolveEffectiveFavorite(
            pin.lockerId,
            pin.isFavorite ?? undefined,
          ),
        }
      : pin,
  );
