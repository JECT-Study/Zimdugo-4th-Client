import type { ReactNode } from "react";
import {
  body,
  bodyNavLayout,
  handle,
  handleArea,
  homeBar,
  homeIndicator,
  sheet,
  sheetNavLayout,
} from "./BottomSheetFrame.css.ts";

export interface BottomSheetFrameProps {
  children: ReactNode;
  /** iOS 홈 인디케이터 막대 표시 */
  showHomeIndicator?: boolean;
  className?: string;
  /** 760px 고정·세로 플렉스 스크롤 영역(기디팀 바텀시트 패턴) */
  layout?: "default" | "nav";
}

/** 바텀시트 래퍼(핸들·그림자·상단 라운드). 순수 UI 프레임 버전. */
export function BottomSheetFrame({
  children,
  showHomeIndicator = true,
  className,
  layout = "default",
}: BottomSheetFrameProps) {
  const isNav = layout === "nav";
  return (
    <section
      className={[sheet, isNav ? sheetNavLayout : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={handleArea} aria-hidden>
        <div className={handle} />
      </div>
      <div
        className={[body, isNav ? bodyNavLayout : ""].filter(Boolean).join(" ")}
      >
        {children}
      </div>
      {showHomeIndicator ? (
        <div className={homeIndicator} aria-hidden>
          <div className={homeBar} />
        </div>
      ) : null}
    </section>
  );
}
