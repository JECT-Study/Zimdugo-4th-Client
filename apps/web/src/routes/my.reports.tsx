import { languageTag, m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import { IconPencil24 } from "@repo/ui/tokens/icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  type ReportDetailViewerLoadState,
  ReportDetailViewerModal,
  ReportListItem,
} from "#/entities/report";
import { resolveReportStatusDisplay } from "#/entities/report/lib/resolve-report-status";
import { NonSearch } from "#/entities/search";
import { useInfiniteScrollSentinel } from "#/features/my/hooks/useInfiniteScrollSentinel";
import { useReportHistoryList } from "#/features/my/hooks/useReportHistoryList";
import { formatReportListDetailText } from "#/features/my/lib/format-report-list-labels";
import { MyListErrorState } from "#/features/my/ui/MyListErrorState";
import { summaryText } from "#/features/my/ui/my-list.css.ts";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { getMyLockerReportDetail } from "#/shared/api/my-page";
import { resolveEnglishSubVisibility } from "#/shared/i18n/english-sub-policy";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  childContent,
  childEmpty,
  childList,
  childListItem,
  childLoadingStatus,
  childLoadMoreSlot,
  childPage,
  childSkeletonFavorite,
  childSkeletonItem,
  childSkeletonList,
  childSkeletonText,
  header,
} from "./-my.css.ts";
import { requireAuthenticatedMyRoute } from "./-my-auth";

export const Route = createFileRoute("/my/reports")({
  head: createNoIndexNoFollowHead,
  beforeLoad: requireAuthenticatedMyRoute,
  component: MyReportsPage,
});

const MY_REPORT_DETAIL_QUERY_KEY = "my-report-detail";
const REPORT_SKELETON_ROW_KEYS = [
  "report-skeleton-1",
  "report-skeleton-2",
  "report-skeleton-3",
  "report-skeleton-4",
  "report-skeleton-5",
] as const;

function MyReportsPage() {
  const navigate = useNavigate();
  const listQuery = useReportHistoryList();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const detailQuery = useQuery({
    queryKey: [MY_REPORT_DETAIL_QUERY_KEY, selectedReportId],
    queryFn: ({ signal }) => {
      if (selectedReportId == null) {
        throw new Error("Report id is required.");
      }

      return getMyLockerReportDetail(selectedReportId, signal);
    },
    enabled: selectedReportId != null,
  });

  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = listQuery.data?.pages[0]?.totalCount ?? 0;
  const canLoadMore =
    listQuery.hasNextPage === true && !listQuery.isFetchingNextPage;

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

  const handleSelectReport = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReportId(null);
    }
  };

  return (
    <div className={childPage}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.my_report_history_title()}
        onBack={handleBack}
      />

      <main className={childContent} aria-busy={isInitialLoading}>
        {totalCount > 0 ? (
          <p className={summaryText}>
            {m.my_report_history_total({ count: String(totalCount) })}
          </p>
        ) : null}

        {isInitialLoading ? (
          <>
            <output className={childLoadingStatus}>
              {m.my_summary_loading()}
            </output>
            <MyReportsSkeleton />
          </>
        ) : null}

        {isError ? <MyListErrorState onRetry={handleRetry} /> : null}

        {isEmpty ? (
          <div className={childEmpty}>
            <NonSearch
              icon={<IconPencil24 />}
              titleText={m.my_history_empty_title()}
              descriptionText={m.my_history_empty()}
              englishTitleText={m.my_history_empty_title_en()}
              englishDescriptionText={m.my_history_empty_en()}
              showEnglishSub={showEnglishSub}
            />
          </div>
        ) : null}

        {!isError && items.length > 0 ? (
          <section aria-label={m.my_report_history_list_aria()}>
            <ul className={childList}>
              {items.map((item) => {
                const statusDisplay = resolveReportStatusDisplay(
                  item.reportStatus,
                );

                return (
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
                      status={statusDisplay?.variant}
                      statusLabel={statusDisplay?.label}
                      imageUrl={item.imageUrl}
                      imageTitleText={m.my_report_image_empty()}
                      imageHelperText=""
                      onPress={() => handleSelectReport(item.reportId)}
                    />
                  </li>
                );
              })}
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
      />
    </div>
  );
}

function MyReportsSkeleton() {
  return (
    <div className={childSkeletonList} aria-hidden="true">
      {REPORT_SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={childSkeletonItem}>
          <Skeleton
            width={76}
            height={76}
            borderRadius={8}
            style={SKELETON_SURFACE_STYLE}
          />
          <div className={childSkeletonText}>
            <Skeleton
              width="72%"
              height={16}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width="88%"
              height={12}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width="54%"
              height={12}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
          </div>
          <Skeleton
            className={childSkeletonFavorite}
            width={20}
            height={20}
            borderRadius={6}
            style={SKELETON_SURFACE_STYLE}
          />
        </div>
      ))}
    </div>
  );
}
