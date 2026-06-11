import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Header } from "@repo/ui/components/layout/header";
import { Popup } from "@repo/ui/components/popup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  ReportDetailViewerModal,
  type ReportDetailViewerLoadState,
  ReportListItem,
} from "#/entities/report";
import { deleteMyLockerReport } from "#/features/my/api/my-locker-report-mutations";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import {
  REPORT_HISTORY_LIST_QUERY_KEY,
  useReportHistoryList,
} from "#/features/my/hooks/useReportHistoryList";
import { MY_PAGE_SUMMARY_QUERY_KEY } from "#/features/my/hooks/useMyPageSummary";
import { mapReportDetailToFormValues } from "#/features/my/lib/map-report-detail-to-form";
import { formatReportListDetailText } from "#/features/my/lib/format-report-list-labels";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import { summaryText } from "#/features/my/ui/my-list.css.ts";
import { stashReportEditSession } from "#/features/report/lib/report-edit-session";
import { getMyLockerReportDetail } from "#/shared/api/my-page";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { requireAuthenticatedMyRoute } from "./-my-auth";
import {
  childContent,
  childEmpty,
  childList,
  childListItem,
  childLoadMoreSlot,
  childPage,
  header,
} from "./-my.css.ts";

export const Route = createFileRoute("/my/reports")({
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyReportsPage,
});

const MY_REPORT_DETAIL_QUERY_KEY = "my-report-detail";

function MyReportsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listQuery = useReportHistoryList();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [deleteTargetReportId, setDeleteTargetReportId] = useState<
    number | null
  >(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  const detailQuery = useQuery({
    queryKey: [MY_REPORT_DETAIL_QUERY_KEY, selectedReportId],
    queryFn: ({ signal }) =>
      getMyLockerReportDetail(selectedReportId!, signal),
    enabled: selectedReportId != null,
  });

  const deleteMutation = useMutation({
    mutationFn: (reportId: number) => deleteMyLockerReport(reportId),
    onSuccess: async () => {
      setSelectedReportId(null);
      setDeleteTargetReportId(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [REPORT_HISTORY_LIST_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [MY_PAGE_SUMMARY_QUERY_KEY],
        }),
      ]);
    },
    onError: () => {
      setDeleteTargetReportId(null);
      setDeleteErrorMessage(m.my_report_detail_delete_failed());
    },
  });

  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = listQuery.data?.pages[0]?.totalCount ?? 0;
  const canLoadMore =
    listQuery.hasNextPage === true && !listQuery.isFetchingNextPage;

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

  const handleGoReport = () => {
    navigate({ to: "/report" });
  };

  const handleSelectReport = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReportId(null);
    }
  };

  const handleEditReport = () => {
    if (!detailQuery.data) {
      return;
    }

    stashReportEditSession({
      reportId: detailQuery.data.reportId,
      values: mapReportDetailToFormValues(detailQuery.data),
    });
    setSelectedReportId(null);
    navigate({ to: "/report" });
  };

  const handleDeleteRequest = () => {
    if (selectedReportId == null) {
      return;
    }

    setDeleteTargetReportId(selectedReportId);
  };

  const handleDeletePopupOpenChange = (open: boolean) => {
    if (!open && !deleteMutation.isPending) {
      setDeleteTargetReportId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTargetReportId == null) {
      return;
    }

    deleteMutation.mutate(deleteTargetReportId);
  };

  const handleDeleteErrorPopupOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteErrorMessage(null);
    }
  };

  const viewerLoadState: ReportDetailViewerLoadState =
    selectedReportId == null
      ? "idle"
      : detailQuery.isPending
        ? "loading"
        : detailQuery.isError
          ? "error"
          : "ready";

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
        onBack={handleBack}
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
              onPress={handleGoReport}
            >
              {m.my_history_go_report()}
            </Button>
          </div>
        ) : null}

        {!isError && items.length > 0 ? (
          <section aria-label={m.my_report_history_list_aria()}>
            <ul className={childList}>
              {items.map((item) => (
                <li key={item.reportId} className={childListItem}>
                  <ReportListItem
                    titleText={item.lockerName}
                    locationLabel={item.roadAddress}
                    detailText={formatReportListDetailText(item)}
                    updatedLabel={
                      item.updatedAt
                        ? formatUpdatedLabel(item.updatedAt)
                        : "-"
                    }
                    onPress={() => handleSelectReport(item.reportId)}
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

      <ReportDetailViewerModal
        isOpen={selectedReportId != null}
        onOpenChange={handleViewerOpenChange}
        titleText={detailQuery.data?.lockerName ?? m.my_report_history_title()}
        detail={detailQuery.data ?? null}
        loadState={viewerLoadState}
        onEdit={handleEditReport}
        onDelete={handleDeleteRequest}
        isDeletePending={deleteMutation.isPending}
      />

      <Popup
        isOpen={deleteTargetReportId != null}
        onOpenChange={handleDeletePopupOpenChange}
        titleText={m.my_report_detail_delete_title()}
        helperText={m.my_report_detail_delete_helper()}
        primaryAction={{
          label: m.my_report_detail_delete_confirm(),
          onPress: handleConfirmDelete,
        }}
        secondaryAction={{
          label: m.my_report_detail_delete_cancel(),
          onPress: () => setDeleteTargetReportId(null),
        }}
      />

      <Popup
        isOpen={deleteErrorMessage != null}
        onOpenChange={handleDeleteErrorPopupOpenChange}
        titleText={deleteErrorMessage ?? ""}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setDeleteErrorMessage(null),
        }}
      />
    </div>
  );
}
