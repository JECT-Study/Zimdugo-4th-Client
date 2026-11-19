import { Header } from "@repo/ui/components/layout/header";
import type { ServiceGuideContentProps } from "./ServiceGuideContent";
import { ServiceGuideContent } from "./ServiceGuideContent";
import { page, pageHeader, pageMain } from "./service-guide.css.ts";

export interface ServiceGuidePageViewProps extends ServiceGuideContentProps {
  title: string;
  onBack: () => void;
}

export function ServiceGuidePageView({
  title,
  onBack,
  ...contentProps
}: ServiceGuidePageViewProps) {
  return (
    <div className={page}>
      <Header
        className={pageHeader}
        leading="back"
        titleType="text"
        title={title}
        onBack={onBack}
      />
      <main className={pageMain}>
        <ServiceGuideContent {...contentProps} />
      </main>
    </div>
  );
}
