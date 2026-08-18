import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconPencil24 } from "../../tokens/icons/Icons.tsx";
import { TextareaField, type TextareaFieldProps } from "./TextareaField.tsx";

function TextareaFieldStory(props: TextareaFieldProps) {
  const [value, setValue] = useState(props.value);

  return (
    <TextareaField
      {...props}
      value={value}
      onChange={setValue}
      trailingIcon={<IconPencil24 />}
    />
  );
}

const meta = {
  title: "Design System/Components/Controls/Textarea Field",
  component: TextareaFieldStory,
  parameters: { layout: "centered" },
  args: {
    value: "",
    onChange: () => undefined,
    placeholder: "상세 내용을 입력해주세요 (선택).",
    maxLength: 255,
    showCounter: true,
  },
} satisfies Meta<typeof TextareaFieldStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "default",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 343 }}>
        <Story />
      </div>
    ),
  ],
};

export const Compact: Story = {
  args: {
    size: "compact",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 287 }}>
        <Story />
      </div>
    ),
  ],
};
