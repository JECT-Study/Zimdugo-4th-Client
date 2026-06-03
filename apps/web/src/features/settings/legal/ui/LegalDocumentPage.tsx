import { Header } from "@repo/ui/components/layout/header";
import { useNavigate } from "@tanstack/react-router";
import type { LegalDocument } from "../model/legal-documents";
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
}

export function LegalDocumentPage({ legalDocument }: LegalDocumentPageProps) {
  const navigate = useNavigate();

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={legalDocument.title}
        onBack={() => navigate({ to: "/settings" })}
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
