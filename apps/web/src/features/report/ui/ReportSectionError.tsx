import {
  sectionErrorTextBottom,
  sectionErrorTextInline,
} from "./report.css.ts";

interface ReportSectionErrorProps {
  message?: string;
  defaultMessage?: string;
  id?: string;
  /** title: 섹션 제목 옆, bottom: 섹션 하단(롤백용) */
  placement?: "title" | "bottom";
}

export function ReportSectionError({
  message,
  defaultMessage,
  id,
  placement = "title",
}: ReportSectionErrorProps) {
  const hasError = message !== undefined;
  const displayMessage = hasError ? message || defaultMessage : undefined;

  if (placement === "title" && !displayMessage) {
    return null;
  }

  const className =
    placement === "bottom" ? sectionErrorTextBottom : sectionErrorTextInline;

  return (
    <p
      id={hasError ? id : undefined}
      className={className}
      role={hasError ? "alert" : undefined}
      aria-hidden={displayMessage ? undefined : true}
    >
      {displayMessage ?? "\u00A0"}
    </p>
  );
}
