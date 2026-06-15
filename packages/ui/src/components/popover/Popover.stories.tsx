import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button as AriaButton } from "react-aria-components";
import { Popover } from "./Popover.tsx";

const meta = {
  title: "Design System/Components/Layout/Popover",
  component: Popover,
  parameters: { layout: "fullscreen" },
  argTypes: {
    tailPosition: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "말풍선 꼬리 위치",
    },
    placement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const hiddenTriggerStyle = {
  width: 1,
  height: 1,
  padding: 0,
  border: "none",
  opacity: 0,
  pointerEvents: "none",
} satisfies CSSProperties;

const guideText =
  "팝오버 콘텐츠는 최대 4줄까지 입력할 수 있습니다. 버튼이나 다른 컴포넌트도 함께 배치할 수 있습니다.";

const longGuideText =
  "첫 번째 줄에는 팝오버가 안내하는 핵심 내용을 보여줍니다. 두 번째 줄에는 사용자가 다음 행동을 이해할 수 있는 설명을 둡니다. 세 번째 줄과 네 번째 줄까지 자연스럽게 표시되는지 확인합니다.";

function CenterFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: 420,
        display: "grid",
        placeItems: "center",
        padding: 24,
        backgroundColor: "rgba(0, 0, 0, 0.36)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

const DEFAULT_ARGS = {
  defaultOpen: true,
  placement: "top" as const,
  offset: -102,
  tailPosition: 50,
  trigger: <AriaButton aria-label="팝오버 기준점" style={hiddenTriggerStyle} />,
  titleText: "팝오버 라벨",
  bodyText: guideText,
  primaryAction: { label: "Button" },
};

export const Default: Story = {
  name: "Default",
  args: DEFAULT_ARGS,
  render: (args: ComponentProps<typeof Popover>) => (
    <CenterFrame>
      <Popover {...args} />
    </CenterFrame>
  ),
};

export const LongBody: Story = {
  name: "Long Body",
  args: {
    ...DEFAULT_ARGS,
    bodyText: longGuideText,
  },
  render: (args: ComponentProps<typeof Popover>) => (
    <CenterFrame>
      <Popover {...args} />
    </CenterFrame>
  ),
};
