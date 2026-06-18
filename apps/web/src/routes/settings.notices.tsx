import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import {
  NoticeDetailPage,
  NoticeListPage,
} from "#/features/settings/legal/ui/NoticePages";

type NoticesSearch = {
  id?: number;
};

const parseNoticesSearch = (search: Record<string, unknown>): NoticesSearch => {
  const id =
    typeof search.id === "number" && Number.isInteger(search.id)
      ? search.id
      : typeof search.id === "string" && /^\d+$/.test(search.id)
        ? Number(search.id)
        : undefined;
  return id !== undefined ? { id } : {};
};

export const Route = createFileRoute("/settings/notices")({
  validateSearch: parseNoticesSearch,
  component: SettingsNoticesPage,
});

function SettingsNoticesPage() {
  const navigate = useNavigate();
  const { id } = useSearch({ from: "/settings/notices" }) as NoticesSearch;

  const handleSelect = (doc: ClientDocumentResponse) => {
    void navigate({
      to: "/settings/notices",
      search: { id: doc.id },
    });
  };

  const handleBack = () => {
    void navigate({ to: "/settings/notices", search: {} });
  };

  if (id !== undefined) {
    return (
      <SettingsNoticeDetailPage
        noticeId={id}
        onBack={handleBack}
      />
    );
  }

  return <NoticeListPage onSelect={handleSelect} />;
}

// 상세 페이지 — 캐시에서 문서를 찾아 렌더링
import { useDocuments } from "#/features/settings/legal/model/useDocuments";
import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  content,
  header,
  page,
  introText,
  paragraph,
} from "#/features/settings/legal/ui/legal-document.css.ts";

function SettingsNoticeDetailPage({
  noticeId,
  onBack,
}: {
  noticeId: number;
  onBack: () => void;
}) {
  const { data, isLoading, isError, refetch } = useDocuments("NOTICE");
  const doc = data?.find((d) => d.id === noticeId);

  if (isLoading) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={onBack}
        />
        <main className={content} aria-label={m.settings_document_loading_aria()}>
          <Skeleton width="100%" height={200} borderRadius={8} style={SKELETON_SURFACE_STYLE} />
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton width={120} height={14} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
            <Skeleton width="100%" height={12} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
            <Skeleton width="80%" height={12} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={onBack}
        />
        <main className={content} style={{ textAlign: "center", paddingTop: 64 }}>
          <p className={introText}>{m.settings_document_error_title()}</p>
          <p className={paragraph} style={{ marginBottom: 16 }}>
            {m.settings_document_error_helper()}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: "#4A90D9",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {m.settings_document_retry()}
          </button>
        </main>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={onBack}
        />
        <main className={content} style={{ textAlign: "center", paddingTop: 64 }}>
          <p className={introText}>{m.settings_notice_empty()}</p>
        </main>
      </div>
    );
  }

  return <NoticeDetailPage doc={doc} onBack={onBack} />;
}
