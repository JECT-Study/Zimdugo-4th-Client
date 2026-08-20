import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useEffect, useState } from "react";
import { storyRelativeFrame } from "./BottomTabBar.stories.css.ts";
import { BottomTabBar, type BottomTabKey } from "./BottomTabBar.tsx";

const meta = {
  title: "Product/Navigation/Bottom Tab Bar",
  component: BottomTabBar,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div
        style={{
          width: vars.layout.designWidth,
          maxWidth: "100vw",
          padding: "20px",
          backgroundColor: vars.color.bg.default,
          border: `1px solid ${vars.color.palette.gray[200]}`,
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    activeTab: {
      control: "select",
      options: ["home", "report", "my", "settings"],
      description: "현재 활성화된 탭",
    },
  },
} satisfies Meta<typeof BottomTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;
type BottomTabBarStoryProps = React.ComponentProps<typeof BottomTabBar>;

const STATE_CONTROL_ID = "bottom-tab-state-control";

const defaultArgs = {
  activeTab: "home" as const,
  links: {
    home: "#",
    report: "#",
    my: "#",
    settings: "#",
  },
};

const englishLabels = {
  home: "Home",
  report: "Report",
  my: "MY",
  settings: "Settings",
} satisfies Record<BottomTabKey, string>;

export const Default: Story = {
  name: "Default",
  args: defaultArgs,
  render: function Render(args: BottomTabBarStoryProps) {
    const [activeTab, setActiveTab] = useState<BottomTabKey>(
      args.activeTab ?? "home",
    );

    useEffect(() => {
      if (args.activeTab !== undefined) {
        setActiveTab(args.activeTab);
      }
    }, [args.activeTab]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <BottomTabBar
          {...args}
          activeTab={activeTab}
          className={storyRelativeFrame}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            padding: "12px",
            border: "1px dashed #D1D5DB",
            borderRadius: "6px",
            backgroundColor: "#F9FAFB",
          }}
        >
          <label
            htmlFor={STATE_CONTROL_ID}
            style={{
              color: "#6B7280",
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            State Control
          </label>
          <select
            id={STATE_CONTROL_ID}
            value={activeTab}
            onChange={(event) =>
              setActiveTab(event.target.value as BottomTabKey)
            }
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #D1D5DB",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <option value="home">홈</option>
            <option value="report">제보</option>
            <option value="my">MY</option>
            <option value="settings">설정</option>
          </select>
        </div>
      </div>
    );
  },
};

export const English: Story = {
  name: "English",
  args: {
    ...defaultArgs,
    activeTab: "home",
    labels: englishLabels,
  },
  render: function Render(args: BottomTabBarStoryProps) {
    return <BottomTabBar {...args} className={storyRelativeFrame} />;
  },
};
