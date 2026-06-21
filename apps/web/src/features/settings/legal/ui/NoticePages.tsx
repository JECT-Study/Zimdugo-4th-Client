import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import { useNavigate } from "@tanstack/react-router";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { useDocuments } from "../model/useDocuments";
import {
  content,
  documentBox,
  header,
  introText,
  noticeDetailImage,
  noticeImageContainer,
  noticeListItem,
  noticeListItemDate,
  noticeListItemTitle,
  page,
  paragraph,
  section,
  sectionTitle,
} from "./legal-document.css.ts";

const formatAppliedAt = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// ─── 목록 페이지 ───────────────────────────────────────────────

interface NoticeListPageProps {
  onSelect: (doc: ClientDocumentResponse) => void;
}

export function NoticeListPage({ onSelect }: NoticeListPageProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDocuments("NOTICE");

  const handleRetry = () => {
    void refetch();
  };

  if (isLoading) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={() => navigate({ to: "/settings" })}
        />
        <main
          className={content}
          aria-label={m.settings_document_loading_aria()}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton is static
              key={i}
              style={{
                padding: "16px 0",
                borderBottom: "1px solid var(--color-border, #eee)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <Skeleton
                width={200}
                height={14}
                borderRadius={6}
                style={SKELETON_SURFACE_STYLE}
              />
              <Skeleton
                width={80}
                height={11}
                borderRadius={4}
                style={SKELETON_SURFACE_STYLE}
              />
            </div>
          ))}
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
          onBack={() => navigate({ to: "/settings" })}
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
            onClick={handleRetry}
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

  const notices = data ?? [];

  if (notices.length === 0) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={() => navigate({ to: "/settings" })}
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

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.settings_notice()}
        onBack={() => navigate({ to: "/settings" })}
      />
      <main className={content}>
        {notices.map((doc) => (
          <button
            key={doc.id}
            type="button"
            className={noticeListItem}
            onClick={() => onSelect(doc)}
          >
            <p className={noticeListItemTitle}>{doc.title}</p>
            <p className={noticeListItemDate}>
              {formatAppliedAt(doc.appliedAt)}
            </p>
          </button>
        ))}
      </main>
    </div>
  );
}

// ─── 상세 페이지 ───────────────────────────────────────────────

interface NoticeDetailPageProps {
  doc: ClientDocumentResponse;
  onBack: () => void;
}

export function NoticeDetailPage({ doc, onBack }: NoticeDetailPageProps) {
  const images = (
    doc.imageUrls && doc.imageUrls.length > 0
      ? doc.imageUrls
      : doc.imageUrl
        ? [doc.imageUrl]
        : []
  ).filter(Boolean);

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={doc.title}
        onBack={onBack}
      />

      <main className={content}>
        {images.length > 0 && (
          <div className={noticeImageContainer}>
            {images.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`${doc.title} - ${index + 1}`}
                className={noticeDetailImage}
              />
            ))}
          </div>
        )}

        <article className={documentBox}>
          {doc.sections.map((item) => (
            <section key={item.subtitle} className={section}>
              <h2 className={sectionTitle}>{item.subtitle}</h2>
              <p className={paragraph}>{item.content}</p>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
