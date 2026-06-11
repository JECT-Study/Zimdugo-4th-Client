import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useFavoriteRemoval } from "#/features/my/hooks/useFavoriteRemoval";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import { MyUndoToast } from "#/features/my/ui/MyUndoToast";
import {
  listCard,
  listCardAddress,
  listCardPressable,
  listCardDeleteButton,
  listCardMeta,
  listCardTitle,
} from "#/features/my/ui/my-list.css.ts";
import { formatDistanceMeters } from "#/shared/lib/format-distance-meters";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { getLockerTypeLabel } from "#/shared/lib/locker-type-label";
import { requireAuthenticatedMyRoute } from "./-my-auth";
import {
  childContent,
  childEmpty,
  childList,
  childLoadMoreSlot,
  childPage,
  header,
} from "./-my.css.ts";

export const Route = createFileRoute("/my/favorites")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyFavoritesPage,
});

function MyFavoritesPage() {
  const navigate = useNavigate();
  const {
    listQuery,
    filteredItems,
    undoItem,
    errorMessage,
    setErrorMessage,
    requestRemoval,
    undoRemoval,
  } = useFavoriteRemoval();

  const handleLoadMore = useCallback(() => {
    if (!listQuery.hasNextPage || listQuery.isFetchingNextPage) return;
    void listQuery.fetchNextPage();
  }, [listQuery]);

  const sentinelRef = useInfiniteScrollSentinel({
    enabled: listQuery.hasNextPage === true && !listQuery.isFetchingNextPage,
    onIntersect: handleLoadMore,
  });

  const handleLockerPress = (lockerId: number) => {
    navigate({
      to: "/",
      search: { openLockerId: lockerId, detailSnap: "full" },
    });
  };

  const isInitialLoading = listQuery.isPending;
  const isError = listQuery.isError && filteredItems.length === 0;
  const isEmpty =
    !isInitialLoading && !isError && filteredItems.length === 0;

  return (
    <div className={childPage}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_menu_favorite()}
        onBack={() => navigate({ to: "/my" })}
      />

      <main className={childContent}>
        {isInitialLoading ? (
          <p>{m.my_summary_loading()}</p>
        ) : null}

        {isError ? (
          <MyListErrorState onRetry={() => void listQuery.refetch()} />
        ) : null}

        {isEmpty ? (
          <div className={childEmpty}>
            <p>{m.my_favorites_empty()}</p>
          </div>
        ) : null}

        {!isError && filteredItems.length > 0 ? (
          <section aria-label={m.my_favorites_list_aria()}>
            <ul className={childList}>
              {filteredItems.map((item, index) => (
                <li key={item.lockerId}>
                  <div className={listCard}>
                    <button
                      type="button"
                      className={listCardPressable}
                      onClick={() => handleLockerPress(item.lockerId)}
                    >
                      <span className={listCardTitle}>{item.lockerName}</span>
                      <span className={listCardAddress}>{item.roadAddress}</span>
                      <span className={listCardMeta}>
                        <span>{getLockerTypeLabel(item.lockerType)}</span>
                        {item.distanceMeters > 0 ? (
                          <span>
                            {formatDistanceMeters(item.distanceMeters)}
                          </span>
                        ) : null}
                        {item.updatedAt ? (
                          <span>{formatUpdatedLabel(item.updatedAt)}</span>
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={listCardDeleteButton}
                      onClick={() => requestRemoval(item, index)}
                    >
                      {m.my_favorite_delete()}
                    </button>
                  </div>
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
        onOpenChange={(open) => {
          if (!open) setErrorMessage(null);
        }}
        titleText={m.my_favorite_delete_failed()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setErrorMessage(null),
        }}
      />
    </div>
  );
}
