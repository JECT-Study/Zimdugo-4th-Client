import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import { useReportHistoryList } from "#/features/my/hooks/useReportHistoryList";
import { formatReportDetailRows } from "#/features/my/lib/format-report-detail-labels";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import {
  listCard,
  listCardAddress,
  listCardPressable,
  listCardMeta,
  listCardTitle,
  summaryText,
} from "#/features/my/ui/my-list.css.ts";
import {
  getMyLockerReportDetail,
  type MyLockerReportDetail,
} from "#/shared/api/my-page";
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

export const Route = createFileRoute("/my/reports")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyReportsPage,
});

const buildReportDetailHelperText = (
  detailQuery: UseQueryResult<MyLockerReportDetail>,
) => {
  if (detailQuery.isPending) {
    return m.my_summary_loading();
  }

  if (!detailQuery.data) {
    return undefined;
  }

  const detail = detailQuery.data;
  const rows = formatReportDetailRows(detail);
  const lines = [
    detail.roadAddress,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ];

  return lines.join("\n");
};

function MyReportsPage() {
  const navigate = useNavigate();
  const listQuery = useReportHistoryList();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const detailQuery = useQuery({
    queryKey: ["my-report-detail", selectedReportId],
    queryFn: ({ signal }) =>
      getMyLockerReportDetail(selectedReportId!, signal),
    enabled: selectedReportId != null,
  });

  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = listQuery.data?.pages[0]?.totalCount ?? 0;

  const handleLoadMore = useCallback(() => {
    if (!listQuery.hasNextPage || listQuery.isFetchingNextPage) return;
    void listQuery.fetchNextPage();
  }, [listQuery]);

  const sentinelRef = useInfiniteScrollSentinel({
    enabled: listQuery.hasNextPage === true && !listQuery.isFetchingNextPage,
    onIntersect: handleLoadMore,
  });

  const isInitialLoading = listQuery.isPending;
  const isError = listQuery.isError && items.length === 0;
  const isEmpty = !isInitialLoading && !isError && items.length === 0;

  return (
    <div className={childPage}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_report_history_title()}
        onBack={() => navigate({ to: "/my" })}
      />

      <main className={childContent}>
        {totalCount > 0 ? (
          <p className={summaryText}>
            {m.my_report_history_total({ count: String(totalCount) })}
          </p>
        ) : null}

        {isInitialLoading ? (
          <p>{m.my_summary_loading()}</p>
        ) : null}

        {isError ? (
          <MyListErrorState onRetry={() => void listQuery.refetch()} />
        ) : null}

        {isEmpty ? (
          <div className={childEmpty}>
            <p>{m.my_history_empty()}</p>
            <Button
              variant="filled"
              intent="primary"
              size="S"
              onPress={() => navigate({ to: "/report" })}
            >
              {m.my_history_go_report()}
            </Button>
          </div>
        ) : null}

        {!isError && items.length > 0 ? (
          <section aria-label={m.my_report_history_list_aria()}>
            <ul className={childList}>
              {items.map((item) => (
                <li key={item.reportId}>
                  <div className={listCard}>
                    <button
                      type="button"
                      className={listCardPressable}
                      onClick={() => setSelectedReportId(item.reportId)}
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

      <Popup
        isOpen={selectedReportId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedReportId(null);
        }}
        titleText={detailQuery.data?.lockerName ?? m.my_report_history_title()}
        helperText={buildReportDetailHelperText(detailQuery)}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setSelectedReportId(null),
        }}
      />
    </div>
  );
}
