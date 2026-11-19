import { m } from "@repo/i18n";
import { useBackNavigation } from "#/shared/hooks/useBackNavigation";
import markerIconUrl from "../assets/icon-marker.svg";
import reportIconUrl from "../assets/icon-report.svg";
import searchIconUrl from "../assets/icon-search.svg";
import { ServiceGuidePageView } from "./ServiceGuidePageView";

export function ServiceGuidePage() {
  // 1. Hooks
  const handleBack = useBackNavigation("/settings");

  // 2. Derived values
  const steps = [
    {
      title: m.service_guide_step_search_title(),
      description: m.service_guide_step_search_description(),
      icon: <img src={searchIconUrl} alt="" />,
    },
    {
      title: m.service_guide_step_detail_title(),
      description: m.service_guide_step_detail_description(),
      icon: <img src={markerIconUrl} alt="" />,
    },
    {
      title: m.service_guide_step_report_title(),
      description: m.service_guide_step_report_description(),
      icon: <img src={reportIconUrl} alt="" />,
    },
  ];

  const checklistItems = [
    m.service_guide_checklist_gate(),
    m.service_guide_checklist_hours(),
    m.service_guide_checklist_onsite(),
    m.service_guide_checklist_receipt(),
  ];

  const faqItems = [
    {
      id: "availability",
      question: m.service_guide_faq_availability_question(),
      answer: m.service_guide_faq_availability_answer(),
    },
    {
      id: "operation",
      question: m.service_guide_faq_operation_question(),
      answer: m.service_guide_faq_operation_answer(),
    },
    {
      id: "location",
      question: m.service_guide_faq_location_question(),
      answer: m.service_guide_faq_location_answer(),
    },
    {
      id: "capacity",
      question: m.service_guide_faq_capacity_question(),
      answer: m.service_guide_faq_capacity_answer(),
    },
    {
      id: "hours",
      question: m.service_guide_faq_hours_question(),
      answer: m.service_guide_faq_hours_answer(),
    },
  ];

  // 6. JSX return
  return (
    <ServiceGuidePageView
      title={m.settings_service_guide()}
      onBack={handleBack}
      introTitle={m.service_guide_intro_title()}
      introDescription={m.service_guide_intro_description()}
      steps={steps}
      checklistTitle={m.service_guide_checklist_title()}
      checklistItems={checklistItems}
      faqTitle={m.service_guide_faq_title()}
      faqItems={faqItems}
      notice={m.service_guide_notice()}
    />
  );
}
