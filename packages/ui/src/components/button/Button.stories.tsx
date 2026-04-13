import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { typography } from "../../tokens/typography/typography.css.ts";
import { Button } from "./Button.tsx";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "outline", "ghost"],
      description: "버튼 시각적 스타일",
    },
    intent: {
      control: "select",
      options: ["primary", "neutral"],
      description: "버튼 의미/색상 의도",
    },
    size: {
      control: "select",
      options: ["S", "L"],
      description: "버튼 크기",
    },
    isDisabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
  },
  args: {
    children: "버튼",
    variant: "filled",
    intent: "primary",
    size: "L",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

type State = "default" | "disabled";

const STATE_PROPS: Record<State, Record<string, unknown>> = {
  default: {},
  disabled: { isDisabled: true },
};

const STATES: { state: State; label: string }[] = [
  { state: "default", label: "Default" },
  { state: "disabled", label: "Disable" },
];

const SIZES = ["S", "L"] as const;

export const AllVariants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={typography.font.caption}>
        <strong>Hover / Active / Focus</strong> 상태는 정적으로 강제할 수 없어
        이 표에서 제외되었습니다.
        <br />각 버튼에 직접 마우스를 올리거나(hover), 클릭한 채로
        유지하거나(active), 키보드 Tab으로 포커스를 이동(focus)하여 상태를
        확인하세요.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "72px 32px repeat(6, auto)",
          alignItems: "center",
          gap: "10px 20px",
        }}
      >
        {/* Type header row */}
        <div />
        <div />
        {(["Filled", "Outline", "Ghost"] as const).map((type) => (
          <span
            key={type}
            style={{
              ...LABEL_STYLE,
              gridColumn: "span 2",
              textAlign: "center",
            }}
          >
            {type}
          </span>
        ))}

        {/* Intent header row */}
        <div />
        <div />
        {(
          ["Primary", "Neutral", "Primary", "Neutral", "Primary", "—"] as const
        ).map((label, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <span key={i} style={LABEL_STYLE}>
            {label}
          </span>
        ))}

        {/* Data rows */}
        {STATES.map(({ state, label }) =>
          SIZES.map((size, sizeIdx) => (
            <React.Fragment key={`${state}-${size}`}>
              <span style={LABEL_STYLE}>{sizeIdx === 0 ? label : ""}</span>
              <span style={LABEL_STYLE}>{size}</span>
              <Button
                variant="filled"
                intent="primary"
                size={size}
                {...STATE_PROPS[state]}
              >
                버튼
              </Button>
              <Button
                variant="filled"
                intent="neutral"
                size={size}
                {...STATE_PROPS[state]}
              >
                버튼
              </Button>
              <Button
                variant="outline"
                intent="primary"
                size={size}
                {...STATE_PROPS[state]}
              >
                버튼
              </Button>
              <Button
                variant="outline"
                intent="neutral"
                size={size}
                {...STATE_PROPS[state]}
              >
                버튼
              </Button>
              <Button
                variant="ghost"
                intent="primary"
                size={size}
                {...STATE_PROPS[state]}
              >
                버튼
              </Button>
              <div />
            </React.Fragment>
          )),
        )}
      </div>
    </div>
  ),
};
