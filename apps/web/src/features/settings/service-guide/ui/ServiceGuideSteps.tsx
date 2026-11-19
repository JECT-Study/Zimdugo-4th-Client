import type { ReactNode } from "react";
import {
  stepCopy,
  stepDescription,
  stepIcon,
  stepItem,
  stepList,
  stepTitle,
} from "./service-guide.css.ts";

export interface ServiceGuideStep {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface ServiceGuideStepsProps {
  steps: ServiceGuideStep[];
}

export function ServiceGuideSteps({ steps }: ServiceGuideStepsProps) {
  return (
    <ol className={stepList}>
      {steps.map((step) => (
        <li key={step.title} className={stepItem}>
          <span className={stepIcon} aria-hidden="true">
            {step.icon}
          </span>
          <div className={stepCopy}>
            <strong className={stepTitle}>{step.title}</strong>
            <span className={stepDescription}>{step.description}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
