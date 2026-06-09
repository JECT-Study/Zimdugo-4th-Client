import type { Meta, StoryObj } from "@storybook/react";
import { SearchResultsHeading } from "./SearchResultsHeading.tsx";

const meta = {
  title: "Features/Search/SearchResultsHeading",
  component: SearchResultsHeading,
  parameters: {
    layout: "centered",
  },
  args: {
    queryText: "코엑스",
    subtitleText: "강남구 삼성동",
  },
} satisfies Meta<typeof SearchResultsHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "375px" }}>
      <SearchResultsHeading {...args} />
    </div>
  ),
};

export const WithoutSubtitle: Story = {
  args: {
    subtitleText: undefined,
  },
  render: (args) => (
    <div style={{ width: "375px" }}>
      <SearchResultsHeading {...args} />
    </div>
  ),
};
