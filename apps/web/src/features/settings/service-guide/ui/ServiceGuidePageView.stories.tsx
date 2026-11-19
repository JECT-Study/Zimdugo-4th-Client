import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import markerIconUrl from "../assets/icon-marker.svg";
import reportIconUrl from "../assets/icon-report.svg";
import searchIconUrl from "../assets/icon-search.svg";
import { ServiceGuideChecklist } from "./ServiceGuideChecklist";
import { ServiceGuideFaq } from "./ServiceGuideFaq";
import { ServiceGuideNotice } from "./ServiceGuideNotice";
import { ServiceGuidePageView } from "./ServiceGuidePageView";
import { ServiceGuideSteps } from "./ServiceGuideSteps";

const STEPS = [
  {
    title: "1. 지도를 움직이거나 검색해요",
    description:
      "원하는 지역과 장소를 검색하면 주변 보관함을 바로 볼 수 있어요.",
    icon: <img src={searchIconUrl} alt="" />,
  },
  {
    title: "2. 핀을 눌러 정보를 확인해요",
    description: "위치·가격·운영시간과 실시간 잔여 여부를 한눈에 확인해요.",
    icon: <img src={markerIconUrl} alt="" />,
  },
  {
    title: "3. 최신 정보는 함께 채워요",
    description: "정보가 다르면 신고해 주세요. 확인 후 빠르게 반영할게요.",
    icon: <img src={reportIconUrl} alt="" />,
  },
];

const CHECKLIST_ITEMS = [
  "개찰구 안쪽·바깥쪽 위치를 확인하세요.",
  "역 운영시간 안에 짐을 찾아야 해요.",
  "가격과 이용 가능 여부는 현장 안내를 우선해요.",
  "영수증이나 비밀번호는 사진으로 남겨두세요.",
];

const FAQ_ITEMS = [
  {
    id: "availability",
    question: "실시간 잔여 보관함 정보는 정확한가요?",
    answer: "FAQ 답변 문구는 프로덕트 연결 전에 확정합니다.",
  },
  {
    id: "operation",
    question: "가격이나 운영시간이 현장과 달라요.",
    answer: "FAQ 답변 문구는 프로덕트 연결 전에 확정합니다.",
  },
  {
    id: "location",
    question: "지도 핀 위치에서 보관함을 찾지 못했어요.",
    answer: "FAQ 답변 문구는 프로덕트 연결 전에 확정합니다.",
  },
  {
    id: "capacity",
    question: "큰 캐리어가 들어가는지 어떻게 확인하나요?",
    answer: "FAQ 답변 문구는 프로덕트 연결 전에 확정합니다.",
  },
  {
    id: "hours",
    question: "보관함은 24시간 이용할 수 있나요?",
    answer: "FAQ 답변 문구는 프로덕트 연결 전에 확정합니다.",
  },
];

const PAGE_ARGS = {
  title: "서비스 안내",
  onBack: () => undefined,
  introTitle: "물품보관함, 이렇게 찾아보세요",
  introDescription: "검색부터 정보 확인까지, 세 단계면 충분해요.",
  steps: STEPS,
  checklistTitle: "이용 전에 꼭 확인하세요",
  checklistItems: CHECKLIST_ITEMS,
  faqTitle: "자주 묻는 질문",
  faqItems: FAQ_ITEMS,
  notice: "보관함 운영 정보는 현장 상황에 따라 달라질 수 있어요.",
} satisfies ComponentProps<typeof ServiceGuidePageView>;

const meta = {
  title: "Product/Pages/Settings/Service Guide",
  component: ServiceGuidePageView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: vars.layout.designWidth,
          maxWidth: "100%",
          height: "812px",
          margin: "0 auto",
          overflow: "hidden",
          background: vars.color.bg.default,
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: PAGE_ARGS,
} satisfies Meta<typeof ServiceGuidePageView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};

export const Components: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: "24px 16px",
      }}
    >
      <ServiceGuideSteps steps={STEPS} />
      <ServiceGuideChecklist items={CHECKLIST_ITEMS} />
      <ServiceGuideFaq items={FAQ_ITEMS.slice(0, 2)} />
      <ServiceGuideNotice>{PAGE_ARGS.notice}</ServiceGuideNotice>
    </div>
  ),
};
