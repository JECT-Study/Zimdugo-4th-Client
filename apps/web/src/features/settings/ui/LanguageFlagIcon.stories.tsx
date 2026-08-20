import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { LanguageFlagIcon } from "./LanguageFlagIcon";

const LANGUAGES = ["ko", "en", "ja", "zh", "zh-TW"] as const;

const meta = {
  title: "Product/Settings/Language Flag Icon",
  component: LanguageFlagIcon,
  parameters: { layout: "centered" },
  args: { language: "ko" },
} satisfies Meta<typeof LanguageFlagIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllLanguages: Story = {
  render: () => (
    <div style={{ display: "flex", gap: vars.spacing[16] }}>
      {LANGUAGES.map((language) => (
        <LanguageFlagIcon key={language} language={language} />
      ))}
    </div>
  ),
};
