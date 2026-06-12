import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { FavoriteListItem } from "#/entities/favorite";
import type { FavoriteLockerListItem } from "#/shared/api/my-page";
import { NonSearch } from "#/entities/search";
import { useFavoriteRemoval } from "#/features/my/hooks/useFavoriteRemoval";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import { MyUndoToast } from "#/features/my/ui/MyUndoToast";
import { resolveEnglishSubVisibility } from "#/shared/i18n/english-sub-policy";
import { formatDistanceMeters } from "#/shared/lib/format-distance-meters";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { useAppLanguageStore } from "#/shared/store/language";
import {
  childContent,
  childEmpty,
  childList,
  childListItem,
  childLoadMoreSlot,
  childPage,
  header,
} from "./-my.css.ts";
import { requireAuthenticatedMyRoute } from "./-my-auth";

export const Route = createFileRoute("/my/favorites")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyFavoritesPage,
});

function MyFavoritesPage() {
  const navigate = useNavigate();
  const appLanguage = useAppLanguageStore((state) => state.appLanguage);
  const {
    listQuery,
    filteredItems,
    undoItem,
    errorMessage,
    setErrorMessage,
    getEffectiveIsFavorite,
    handleFavoriteChange,
    undoRemoval,
  } = useFavoriteRemoval();

  const canLoadMore =
    listQuery.hasNextPage === true && !listQuery.isFetchingNextPage;

  const isInitialLoading = listQuery.isPending;
  const isError = listQuery.isError && filteredItems.length === 0;
  const isEmpty = !isInitialLoading && !isError && filteredItems.length === 0;
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
        {isInitialLoading ? <p>{m.my_summary_loading()}</p> : null}

        {isError ? <MyListErrorState onRetry={handleRetry} /> : null}

        {isEmpty ? (
          <div className={childEmpty}>
            <NonSearch
              titleText={m.my_favorites_empty_title()}
              descriptionText={m.my_favorites_empty()}
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

      {undoItem ? (
        <MyUndoToast
          message={m.my_favorite_delete_toast()}
          actionLabel={m.my_favorite_delete_undo()}
          onUndo={undoRemoval}
        />
      ) : null}

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
