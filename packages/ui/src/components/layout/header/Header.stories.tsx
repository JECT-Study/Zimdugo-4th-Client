import { vars } from "@repo/ui/vars.css";
import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { Header } from "./Header.tsx";

const meta = {
  title: "Design System/Components/Layout/Header",
  component: Header,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: vars.layout.designWidth, position: "relative" }}>
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Storybook-only CSS override for fixed header framing.
          dangerouslySetInnerHTML={{
            __html: `
              header {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                transform: none !important;
              }
            `,
          }}
        />
        <Story />
      </div>
    ),
  ],
  args: {
    leading: "none",
    titleType: "logo",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

const LABEL_STYLE: CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "12px",
};

export const AllVariants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div>
        <p style={LABEL_STYLE}>Logo Only</p>
        <Header leading="none" titleType="logo" />
      </div>
      <div>
        <p style={LABEL_STYLE}>Back + Logo</p>
        <Header leading="back" titleType="logo" />
      </div>
      <div>
        <p style={LABEL_STYLE}>Step</p>
        <Header
          leading="back"
          titleType="step"
          stepCurrent={1}
          stepTotal={2}
          stepState="default"
        />
      </div>
      <div>
        <p style={LABEL_STYLE}>Step Active</p>
        <Header
          leading="back"
          titleType="step"
          stepCurrent={2}
          stepTotal={2}
          stepState="active"
        />
      </div>
      <div>
        <p style={LABEL_STYLE}>Text Title</p>
        <Header leading="back" titleType="text" title="Page title" />
      </div>
    </div>
  ),
};
