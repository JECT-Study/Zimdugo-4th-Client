import { ServiceGuideChecklist } from "./ServiceGuideChecklist";
import type { ServiceGuideFaqItem } from "./ServiceGuideFaq";
import { ServiceGuideFaq } from "./ServiceGuideFaq";
import { ServiceGuideNotice } from "./ServiceGuideNotice";
import type { ServiceGuideStep } from "./ServiceGuideSteps";
import { ServiceGuideSteps } from "./ServiceGuideSteps";
import {
  content,
  intro,
  introDescription,
  introTitle,
  section,
  sectionTitle,
} from "./service-guide.css.ts";

export interface ServiceGuideContentProps {
  introTitle: string;
  introDescription: string;
  steps: ServiceGuideStep[];
  checklistTitle: string;
  checklistItems: string[];
  faqTitle: string;
  faqItems: ServiceGuideFaqItem[];
  notice: string;
}

export function ServiceGuideContent({
  introTitle: title,
  introDescription: description,
  steps,
  checklistTitle,
  checklistItems,
  faqTitle,
  faqItems,
  notice,
}: ServiceGuideContentProps) {
  return (
    <div className={content}>
      <section className={section}>
        <div className={intro}>
          <h1 className={introTitle}>{title}</h1>
          <p className={introDescription}>{description}</p>
        </div>
        <ServiceGuideSteps steps={steps} />
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>{checklistTitle}</h2>
        <ServiceGuideChecklist items={checklistItems} />
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>{faqTitle}</h2>
        <ServiceGuideFaq items={faqItems} />
      </section>

      <ServiceGuideNotice>{notice}</ServiceGuideNotice>
    </div>
  );
}
