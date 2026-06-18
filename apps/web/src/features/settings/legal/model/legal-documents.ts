import type { ClientDocumentResponse } from "#/shared/api/documents";

export interface LegalDocumentSection {
  subtitle: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  sections: LegalDocumentSection[];
}

export const toLegalDocument = (
  response: ClientDocumentResponse,
): LegalDocument => ({
  title: response.title,
  sections: response.sections.map((section) => ({
    subtitle: section.subtitle,
    content: section.content,
  })),
});
