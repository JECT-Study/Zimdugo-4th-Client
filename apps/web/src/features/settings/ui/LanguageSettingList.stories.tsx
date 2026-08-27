import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSettingList } from "./LanguageSettingList";

const meta = {
  title: "Product/Pages/Settings/Language",
  component: LanguageSettingList,
  decorators: [
    (Story) => (
      <div
        style={{
          width: "343px",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  args: {
    currentLanguage: "ko",
    getLanguageHref: (language) =>
      `/set-language/${language}/settings/language`,
  },
} satisfies Meta<typeof LanguageSettingList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
