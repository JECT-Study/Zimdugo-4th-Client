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

/** PR 스크린샷용 — 실제 LoginPageSkeleton (390×844) */
export const MobileViewport: Story = {
  render: () => (
    <div
      style={{
        width: 390,
        height: 844,
        margin: "0 auto",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      <LoginPageSkeleton />
    </div>
  ),
};
