import { sectionErrorReserve } from "./report.css.ts";

/** 제목 옆 에러 배치 시에도 하단 에러 영역 높이를 유지해 섹션 간 gap을 보장한다. */
export function ReportSectionErrorReserve() {
  return <div className={sectionErrorReserve} aria-hidden="true" />;
}
