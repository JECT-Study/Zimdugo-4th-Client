import { sectionErrorText } from "./report.css.ts";

interface ReportSectionErrorProps {
  message?: string;
  id?: string;
}

export function ReportSectionError({ message, id }: ReportSectionErrorProps) {
  if (!message) return null;

  return (
    <p id={id} className={sectionErrorText} role="alert">
      {message}
    </p>
  );
}
