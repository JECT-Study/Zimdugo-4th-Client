import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LanguageDropdown } from "./LanguageDropdown.tsx";

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
] as const;

const meta = {
  title: "Design System/Components/Layout/LanguageDropdown",
  component: LanguageDropdown,
  parameters: { layout: "centered" },
  args: {
    options: LANGUAGE_OPTIONS,
    value: "ko",
    ariaLabel: "언어 선택",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 240,
          minHeight: 260,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 48,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LanguageDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <LanguageDropdown {...args} value={value} onChange={setValue} />;
  },
};
