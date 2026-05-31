import type { Meta, StoryObj } from "@storybook/react";
import { LoginPageSkeleton } from "./LoginPageSkeleton.tsx";

const meta = {
  title: "Features/Auth/LoginPageSkeleton",
  component: LoginPageSkeleton,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginPageSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** CSS 청크 도착 전 로그인 화면 스켈레톤 (390×844) */
export const MobileViewport: Story = {
  tags: ["!autodocs"],
  parameters: {
    docs: { disable: true },
  },
  render: () => (
    <div style={{ width: 390, height: 844, margin: "0 auto", overflow: "hidden" }}>
      <LoginPageSkeleton />
    </div>
  ),
};
