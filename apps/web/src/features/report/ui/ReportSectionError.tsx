import { sectionErrorTextBottom, sectionErrorTextInline } from "./report.css.ts";

interface ReportSectionErrorProps {
  message?: string;
  id?: string;
  /** title: 섹션 제목 옆, bottom: 섹션 하단(롤백용) */
  placement?: "title" | "bottom";
}

export function ReportSectionError({
  message,
  id,
  placement = "title",
}: ReportSectionErrorProps) {
  const className =
    placement === "bottom" ? sectionErrorTextBottom : sectionErrorTextInline;

  return (
    <p
      id={message ? id : undefined}
      className={className}
      role={message ? "alert" : undefined}
      aria-hidden={message ? undefined : true}
    >
      {message ?? "\u00A0"}
    </p>
  );
}
