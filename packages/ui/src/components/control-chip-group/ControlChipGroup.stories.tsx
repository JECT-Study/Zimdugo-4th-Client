import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ControlChipGroup } from "./ControlChipGroup.tsx";

const lockerTypeOptions = [
  { label: "박물관", value: "museum" },
  { label: "지하철역", value: "subway" },
  { label: "백화점", value: "department" },
  { label: "편의점", value: "convenience" },
  { label: "공공기관", value: "public" },
  { label: "사설 보관함", value: "private" },
  { label: "기차역", value: "train" },
  { label: "기타", value: "other" },
];

const meta = {
  title: "Shared/Controls/ControlChipGroup",
  component: ControlChipGroup,
  parameters: { layout: "centered" },
  args: {
    options: lockerTypeOptions,
    value: ["museum"],
    selectionMode: "single",
  },
} satisfies Meta<typeof ControlChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [value, setValue] = useState(args.value);

    return <ControlChipGroup {...args} value={value} onChange={setValue} />;
  },
};
