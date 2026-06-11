import { describe, expect, it } from "vitest";
import {
  noticeDocument,
  privacyDocument,
  termsDocument,
} from "./legal-documents";

const getDocumentText = (document: {
  intro: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
}) =>
  [
    document.intro,
    ...document.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
    ]),
  ].join(" ");

describe("legal documents", () => {
  it("서비스 초기 운영 공지와 제보 및 문의 안내를 제공한다", () => {
    const noticeText = getDocumentText(noticeDocument);

    expect(noticeDocument.title).toBe("서비스 공지사항");
    expect(noticeText).toContain("서비스 초기 운영 안내");
    expect(noticeText).toContain("제보하기");
    expect(noticeText).toContain("zimdugo@gmail.com");
  });

  it("이용약관에 사용자 제보와 운영 정보 이용 기준을 안내한다", () => {
    const termsText = getDocumentText(termsDocument);

    expect(termsText).toContain("사용자 제보");
    expect(termsText).toContain("검토");
    expect(termsText).toContain("공지사항");
  });

  it("개인정보처리방침에 EXIF 수집 항목과 이용 및 파기 기준을 안내한다", () => {
    const privacyText = getDocumentText(privacyDocument);

    expect(privacyText).toContain("EXIF");
    expect(privacyText).toContain("촬영 위치");
    expect(privacyText).toContain("촬영 일시");
    expect(privacyText).toContain("기기 정보");
    expect(privacyText).toContain("동의");
    expect(privacyText).toContain("파기");
  });

  it("문서에 임시 법률 검토 안내 데이터를 포함하지 않는다", () => {
    expect(termsDocument).not.toHaveProperty("notice");
    expect(privacyDocument).not.toHaveProperty("notice");
    expect(noticeDocument).not.toHaveProperty("notice");
  });
});
