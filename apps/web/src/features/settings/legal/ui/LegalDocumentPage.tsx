import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Header } from "@repo/ui/components/layout/header";
import { useNavigate } from "@tanstack/react-router";
import type { DocumentType } from "#/shared/api/documents";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { toLegalDocument } from "../model/legal-documents";
import type { LegalReturnSearch } from "../model/legal-return-search";
import { useDocuments } from "../model/useDocuments";
import {
  content,
  documentBox,
  header,
  introText,
  page,
  paragraph,
  section,
  sectionTitle,
} from "./legal-document.css.ts";

const DOCUMENT_TYPE_TITLE: Record<DocumentType, () => string> = {
  NOTICE: () => m.settings_notice(),
  TERMS: () => m.settings_terms(),
  PRIVACY: () => m.settings_privacy(),
};

interface LegalDocumentPageProps {
  documentType: DocumentType;
  returnSearch?: LegalReturnSearch;
}

export function LegalDocumentPage({
  documentType,
  returnSearch,
}: LegalDocumentPageProps) {
  // 1. Hooks
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDocuments(documentType);

  // 2. Derived values
  const title = DOCUMENT_TYPE_TITLE[documentType]();
  const documents = data?.map(toLegalDocument) ?? [];

  // 3. Event handlers
  const handleBack = () => {
    if (returnSearch?.returnTo) {
      navigate({
        to: returnSearch.returnTo,
        ...(returnSearch.step === 2 ? { search: { step: 2 } } : {}),
      });
      return;
    }

    navigate({ to: "/settings" });
  };

  const handleRetry = () => {
    void refetch();
  };

  // 5. Early returns — loading
  if (isLoading) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={title}
          onBack={handleBack}
        />
        <main className={content} aria-label={m.settings_document_loading_aria()}>
          <Skeleton width={200} height={16} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
          <div className={documentBox} style={{ marginTop: 16 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={section}>
                <Skeleton width={120} height={14} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
                <Skeleton width="100%" height={12} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
                <Skeleton width="80%" height={12} borderRadius={6} style={SKELETON_SURFACE_STYLE} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 5. Early returns — error
  if (isError) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={title}
          onBack={handleBack}
        />
        <main className={content} style={{ textAlign: "center", paddingTop: 64 }}>
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

  // 5. Early returns — empty (NOTICE only)
  if (documentType === "NOTICE" && documents.length === 0) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={title}
          onBack={handleBack}
        />
        <main className={content} style={{ textAlign: "center", paddingTop: 64 }}>
          <p className={introText}>{m.settings_notice_empty()}</p>
        </main>
      </div>
    );
  }

  // 6. JSX return
  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={title}
        onBack={handleBack}
      />

      <main className={content}>
        {documents.map((doc) => (
          <div key={doc.title}>
            <p className={introText}>{doc.title}</p>

            <article className={documentBox}>
              {doc.sections.map((item) => (
                <section key={item.subtitle} className={section}>
                  <h2 className={sectionTitle}>{item.subtitle}</h2>
                  <p className={paragraph}>{item.content}</p>
                </section>
              ))}
            </article>
          </div>
        ))}
      </main>
    </div>
  );
}
