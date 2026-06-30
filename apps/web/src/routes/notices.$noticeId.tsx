import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useDocuments } from "#/features/settings/legal/model/useDocuments";
import {
  content,
  header,
  introText,
  page,
  paragraph,
} from "#/features/settings/legal/ui/legal-document.css.ts";
import { NoticeDetailPage } from "#/features/settings/legal/ui/NoticePages";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";

const parseNoticeId = (value: string): number | null => {
  if (!/^\d+$/.test(value)) return null;
  const noticeId = Number(value);
  return Number.isSafeInteger(noticeId) && noticeId > 0 ? noticeId : null;
};

export const Route = createFileRoute("/notices/$noticeId")({
  component: NoticeDetailRoutePage,
});

function NoticeDetailRoutePage() {
  const navigate = useNavigate();
  const { noticeId: rawNoticeId } = useParams({ from: "/notices/$noticeId" });
  const noticeId = parseNoticeId(rawNoticeId);
  const { data, isLoading, isError, refetch } = useDocuments("NOTICE");
  const doc =
    noticeId != null ? data?.find((item) => item.id === noticeId) : null;

  const handleBack = () => {
    void navigate({ to: "/notices" });
  };

  if (isLoading) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={handleBack}
        />
        <main
          className={content}
          aria-label={m.settings_document_loading_aria()}
        >
          <Skeleton
            width="100%"
            height={200}
            borderRadius={8}
            style={SKELETON_SURFACE_STYLE}
          />
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <Skeleton
              width={120}
              height={14}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width="100%"
              height={12}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
            <Skeleton
              width="80%"
              height={12}
              borderRadius={6}
              style={SKELETON_SURFACE_STYLE}
            />
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
          onBack={handleBack}
        />
        <main
          className={content}
          style={{ textAlign: "center", paddingTop: 64 }}
        >
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
          onBack={handleBack}
        />
        <main
          className={content}
          style={{ textAlign: "center", paddingTop: 64 }}
        >
          <p className={introText}>{m.settings_notice_empty()}</p>
        </main>
      </div>
    );
  }

  return <NoticeDetailPage doc={doc} onBack={handleBack} />;
}
