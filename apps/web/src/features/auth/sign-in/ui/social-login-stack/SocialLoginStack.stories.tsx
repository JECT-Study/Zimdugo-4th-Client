import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { SocialLoginStack } from "./SocialLoginStack.tsx";

const meta = {
  title: "Product/Auth/Social Login",
  component: SocialLoginStack,
  parameters: {
    layout: "centered",
  },
  args: {
    showEnglishLabel: false,
  },
  argTypes: {
    showEnglishLabel: { control: "boolean" },
  },
} satisfies Meta<typeof SocialLoginStack>;

export default meta;

type Story = StoryObj<typeof meta>;
type SocialLoginStackProps = ComponentProps<typeof SocialLoginStack>;

export const Default: Story = {
  render: (args: SocialLoginStackProps) => (
    <div style={{ width: "375px", padding: "20px", border: "1px solid #eee" }}>
      <SocialLoginStack {...args} />
    </div>
  ),
};

export const WithEnglishLabel: Story = {
  render: (args: SocialLoginStackProps) => (
    <div style={{ width: "375px", padding: "20px", border: "1px solid #eee" }}>
      <SocialLoginStack {...args} showEnglishLabel={true} />
    </div>
  ),
};
