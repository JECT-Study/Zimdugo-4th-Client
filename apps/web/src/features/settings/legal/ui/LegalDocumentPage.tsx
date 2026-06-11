import { Header } from "@repo/ui/components/layout/header";
import { useNavigate } from "@tanstack/react-router";
import type { LegalDocument } from "../model/legal-documents";
import type { LegalReturnSearch } from "../model/legal-return-search";
import {
  content,
  documentBox,
  header,
  introText,
  noticeEmphasis,
  noticeText,
  page,
  paragraph,
  section,
  sectionTitle,
} from "./legal-document.css.ts";

interface LegalDocumentPageProps {
  legalDocument: LegalDocument;
  returnSearch?: LegalReturnSearch;
}

export function LegalDocumentPage({
  legalDocument,
  returnSearch,
}: LegalDocumentPageProps) {
  const navigate = useNavigate();

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

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={legalDocument.title}
        onBack={handleBack}
      />

      <main className={content}>
        <p className={introText}>{legalDocument.intro}</p>

        <p className={noticeText}>
          {legalDocument.notice.prefix}
          <span className={noticeEmphasis}>
            {legalDocument.notice.emphasis}
          </span>
          {legalDocument.notice.suffix}
        </p>

        <article className={documentBox}>
          {legalDocument.sections.map((item) => (
            <section key={item.title} className={section}>
              <h2 className={sectionTitle}>{item.title}</h2>
              {item.paragraphs.map((itemParagraph) => (
                <p
                  key={`${item.title}-${itemParagraph}`}
                  className={paragraph}
                >
                  {itemParagraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
