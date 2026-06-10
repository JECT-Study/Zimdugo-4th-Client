import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";

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
      ),
    };
  });

export const applyFavoriteOverlayToLockerDetail = (
  locker: LockerDetailItem,
  resolveEffectiveFavorite: ResolveEffectiveFavorite,
): LockerDetailItem => ({
  ...locker,
  isFavorite: resolveEffectiveFavorite(locker.lockerId, locker.isFavorite),
});
