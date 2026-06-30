import { languageTag, m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { IconStarOutline24 } from "@repo/ui/tokens/icons";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { FavoriteListItem } from "#/entities/favorite";
import { NonSearch } from "#/entities/search";
import { useFavoriteRemoval } from "#/features/my/hooks/useFavoriteRemoval";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import type { FavoriteLockerListItem } from "#/shared/api/my-page";
import { resolveEnglishSubVisibility } from "#/shared/i18n/english-sub-policy";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import { formatDistanceMeters } from "#/shared/lib/format-distance-meters";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  childContent,
  childEmpty,
  childList,
  childListItem,
  childLoadMoreSlot,
  childPage,
  childSkeletonFavorite,
  childSkeletonItem,
  childSkeletonList,
  childSkeletonText,
  header,
} from "./-my.css.ts";
import { requireAuthenticatedMyRoute } from "./-my-auth";

const FAVORITE_SKELETON_ROW_KEYS = [
  "favorite-skeleton-1",
  "favorite-skeleton-2",
  "favorite-skeleton-3",
  "favorite-skeleton-4",
  "favorite-skeleton-5",
] as const;

export const Route = createFileRoute("/my/favorites")({
  head: createNoIndexNoFollowHead,
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyFavoritesPage,
});

function MyFavoritesPage() {
  const navigate = useNavigate();
  const {
    listQuery,
    filteredItems,
    errorMessage,
    setErrorMessage,
    getEffectiveIsFavorite,
    handleFavoriteChange,
  } = useFavoriteRemoval();

  const canLoadMore =
    listQuery.hasNextPage === true && !listQuery.isFetchingNextPage;

  const isInitialLoading = listQuery.isPending;
  const isError = listQuery.isError && filteredItems.length === 0;
  const isEmpty = !isInitialLoading && !isError && filteredItems.length === 0;
  const appLanguage = normalizeLocale(languageTag()) ?? BASE_LOCALE;
  const showEnglishSub = resolveEnglishSubVisibility({ appLanguage });

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) return;
    void listQuery.fetchNextPage();
  }, [canLoadMore, listQuery]);

  const sentinelRef = useInfiniteScrollSentinel({
    enabled: canLoadMore,
    onIntersect: handleLoadMore,
  });

  const handleBack = () => {
    navigate({ to: "/my" });
  };

  const handleRetry = () => {
    void listQuery.refetch();
  };

  const handleLockerPress = (item: FavoriteLockerListItem) => {
    navigate({
      to: "/",
      search: {
        openLockerId: item.lockerId,
        detailSnap: "full",
        focusLat: item.latitude,
        focusLng: item.longitude,
      },
    });
  };

  const handleErrorPopupOpenChange = (open: boolean) => {
    if (!open) setErrorMessage(null);
  };

  const handleConfirmError = () => {
    setErrorMessage(null);
  };

  return (
    <div className={childPage}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_menu_favorite()}
        onBack={handleBack}
      />

      <main className={childContent}>
        {isInitialLoading ? <MyFavoritesSkeleton /> : null}

        {isError ? <MyListErrorState onRetry={handleRetry} /> : null}

        {isEmpty ? (
          <div className={childEmpty}>
            <NonSearch
              icon={<IconStarOutline24 size={24} />}
              titleText={m.my_favorites_empty_title()}
              descriptionText={m.my_favorites_empty()}
              englishTitleText={m.my_favorites_empty_title_en()}
              englishDescriptionText={m.my_favorites_empty_en()}
              showEnglishSub={showEnglishSub}
            />
          </div>
        ) : null}

        {!isError && filteredItems.length > 0 ? (
          <section aria-label={m.my_favorites_list_aria()}>
            <ul className={childList}>
              {filteredItems.map((item, index) => (
                <li key={item.lockerId} className={childListItem}>
                  <FavoriteListItem
                    titleText={item.lockerName}
                    distanceLabel={
                      item.distanceMeters > 0
                        ? formatDistanceMeters(item.distanceMeters)
                        : "-"
                    }
                    updatedLabel={
                      item.updatedAt ? formatUpdatedLabel(item.updatedAt) : "-"
                    }
                    isFavorite={getEffectiveIsFavorite(
                      item.lockerId,
                      item.isFavorite,
                    )}
                    onPress={() => handleLockerPress(item)}
                    onFavoriteChange={(next) =>
                      handleFavoriteChange(item, index, next)
                    }
                  />
                </li>
              ))}
            </ul>

            {listQuery.hasNextPage ? (
              <div className={childLoadMoreSlot}>
                <Button
                  variant="outline"
                  intent="neutral"
                  size="S"
                  onPress={handleLoadMore}
                  isDisabled={listQuery.isFetchingNextPage}
                >
                  {m.my_report_history_load_more()}
                </Button>
              </div>
            ) : null}

            <div ref={sentinelRef} aria-hidden="true" />
          </section>
        ) : null}
      </main>

      <Popup
        isOpen={errorMessage != null}
        onOpenChange={handleErrorPopupOpenChange}
        titleText={m.my_favorite_delete_failed()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: handleConfirmError,
        }}
      />
    </div>
  );
}

function MyFavoritesSkeleton() {
  return (
    <div className={childSkeletonList} aria-hidden="true">
      {FAVORITE_SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={childSkeletonItem}>
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={SKELETON_SURFACE_STYLE}
          />
          <div className={childSkeletonText}>
            <Skeleton
              width="68%"
              height={16}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width="42%"
              height={12}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
          </div>
          <Skeleton
            className={childSkeletonFavorite}
            width={24}
            height={24}
            borderRadius={6}
            style={SKELETON_SURFACE_STYLE}
          />
        </div>
      ))}
    </div>
  );
}
