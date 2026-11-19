import type { Meta, StoryObj } from "@storybook/react";
import { Snackbar } from "./Snackbar.tsx";

const meta = {
  title: "Design System/Components/Snackbar",
  component: Snackbar,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "341px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: "반가워요!\n오늘은 어떤 보관함을 찾으시나요?",
    actionLabel: "서비스 안내",
    closeAriaLabel: "안내 닫기",
    onAction: () => undefined,
    onClose: () => undefined,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["light", "dark"],
      description: "스낵바의 배경과 밀도",
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: {
    variant: "light",
  },
};

export const Dark: Story = {
  args: {
    variant: "dark",
  },
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Snackbar {...args} variant="light" />
      <Snackbar {...args} variant="dark" />
    </div>
  ),
};
