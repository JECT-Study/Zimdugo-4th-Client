import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { AppLanguage } from "#/shared/store/language";
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
    onSelectLanguage: () => undefined,
  },
  render: (args) => <LanguageSettingListStory {...args} />,
} satisfies Meta<typeof LanguageSettingList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function LanguageSettingListStory({
  currentLanguage: initialLanguage,
}: {
  currentLanguage: AppLanguage;
}) {
  const [currentLanguage, setCurrentLanguage] =
    useState<AppLanguage>(initialLanguage);

  return (
    <LanguageSettingList
      currentLanguage={currentLanguage}
      onSelectLanguage={setCurrentLanguage}
    />
  );
}
