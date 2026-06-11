import { describe, expect, it } from "vitest";
import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/report-types";
import {
  isAcceptedReportPhotoFile,
  resolveReportPhotoContentType,
  validateReportPhotoFile,
} from "#/features/report/lib/validate-report-photo-file";

const createFile = (
  name: string,
  type: string,
  sizeBytes: number,
): File => new File([new Uint8Array(sizeBytes)], name, { type });

describe("validateReportPhotoFile", () => {
  it("이미지 MIME 타입이면 허용한다", () => {
    const file = createFile("photo.jpg", "image/jpeg", 1024);

    expect(validateReportPhotoFile(file)).toEqual({ ok: true });
  });

  it("MIME이 비어 있어도 허용된 확장자면 허용한다", () => {
    const file = createFile("photo.png", "", 1024);

    expect(isAcceptedReportPhotoFile(file)).toBe(true);
    expect(validateReportPhotoFile(file)).toEqual({ ok: true });
  });

  it("MIME이 비어 있으면 확장자로 Content-Type을 추론한다", () => {
    const file = createFile("photo.jpg", "", 1024);

    expect(resolveReportPhotoContentType(file)).toBe("image/jpeg");
  });

  it("image/* 단축 통과 없이 허용되지 않은 MIME은 거부한다", () => {
    const file = createFile("photo.svg", "image/svg+xml", 1024);

    expect(isAcceptedReportPhotoFile(file)).toBe(false);
    expect(validateReportPhotoFile(file)).toEqual({
      ok: false,
      error: "invalid_type",
    });
  });

  it("hwp 파일은 형식 오류를 반환한다", () => {
    const file = createFile("document.hwp", "application/x-hwp", 6735 * 1024);

    expect(validateReportPhotoFile(file)).toEqual({
      ok: false,
      error: "invalid_type",
    });
  });

  it("5MB를 초과하는 이미지는 크기 오류를 반환한다", () => {
    const file = createFile(
      "large.jpg",
      "image/jpeg",
      MAX_REPORT_PHOTO_SIZE_BYTES + 1,
    );

    expect(validateReportPhotoFile(file)).toEqual({
      ok: false,
      error: "max_size",
    });
  });

  it("5MB 이하 이미지는 허용한다", () => {
    const file = createFile(
      "ok.jpg",
      "image/jpeg",
      MAX_REPORT_PHOTO_SIZE_BYTES,
    );

    expect(validateReportPhotoFile(file)).toEqual({ ok: true });
  });
});
