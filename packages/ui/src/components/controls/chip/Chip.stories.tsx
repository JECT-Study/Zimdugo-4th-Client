import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, type ComponentProps, useEffect } from "react";
import { Chip } from "./Chip.tsx";

const meta = {
  title: "Components/Controls/chip",
  component: Chip,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "input", "icon"],
      description: "칩 시각적 스타일",
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "칩 크기",
    },
    isSelected: {
      control: "boolean",
      description: "선택 상태 여부(aria-pressed)",
    },
    isDisabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
  },
  args: {
    children: "짐두고",
    variant: "default",
    size: "medium",
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. 인터랙티브 기본 스토리
export const Default: Story = {
  name: "default",
  render: function DefaultStory(args: ComponentProps<typeof Chip>) {
    const [isSelected1, setIsSelected1] = useState(args.isSelected ?? false);
    const [isSelected2, setIsSelected2] = useState(args.isSelected ?? false);

    // args가 변경될 때만 상태 동기화
    useEffect(() => {
      if (args.isSelected !== undefined) {
        setIsSelected1(args.isSelected);
        setIsSelected2(args.isSelected);
      }
    }, [args.isSelected]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          background: "#fff",
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          minWidth: 280,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Chip
            {...args}
            isSelected={isSelected1}
            onPress={() => setIsSelected1((prev) => !prev)}
          >
            {args.children || "Option 1"}
          </Chip>
          <Chip
            {...args}
            isSelected={isSelected2}
            onPress={() => setIsSelected2((prev) => !prev)}
          >
            {args.children ? `${args.children} 2` : "Option 2"}
          </Chip>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.8,
              color: "#6b7280",
              textAlign: "left",
              backgroundColor: "#f9fafb",
              padding: "16px 20px",
              borderRadius: 6,
            }}
          >
            <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: "#374151" }}>
              테스트 가이드
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>클릭 (Click):</strong> 칩 선택 상태를 토글합니다.
              </li>
              <li>
                <strong>키보드 이동 (Tab / Shift+Tab):</strong> 다음/이전 칩으로 포커스를 이동합니다.
              </li>
              <li>
                <strong>키보드 선택 (Enter):</strong> 포커스된 칩 상태를 토글합니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};

export const Variants: Story = {
  name: "variants",
  render: () => {
    const states = [
      { key: "default", isSelected: false, isDisabled: false, label: "Default" },
      { key: "selected", isSelected: true, isDisabled: false, label: "Selected" },
      { key: "disabled", isSelected: false, isDisabled: true, label: "Disabled" },
    ];
    const sizes = ["small", "medium"] as const;

    const LABEL_STYLE = {
      fontSize: "12px",
      color: "#8E8E8E",
      fontWeight: "bold",
      textTransform: "uppercase" as const,
      textAlign: "center" as const,
      padding: "8px",
    };

    return (
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          background: "#fff", 
          padding: 32,
          borderRadius: 12,
          border: "1px solid #e5e7eb"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `120px repeat(${sizes.length}, 100px)`,
            rowGap: 24,
            columnGap: 12,
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {/* Header Row (가로: Size) */}
          <div /> {/* Top-left empty cell */}
          {sizes.map((size) => (
            <span key={`header-${size}`} style={LABEL_STYLE}>
              {size}
            </span>
          ))}

          {/* Data Rows (세로: State) */}
          {states.map((state) => (
            <React.Fragment key={`row-${state.key}`}>
              {/* Row Header */}
              <span style={{ ...LABEL_STYLE, textAlign: "right", width: "100%", paddingRight: 16 }}>
                {state.label}
              </span>
              
              {/* Cells */}
              {sizes.map((size) => (
                <div key={`cell-${state.key}-${size}`} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Chip 
                    size={size} 
                    isSelected={state.isSelected} 
                    isDisabled={state.isDisabled}
                  >
                    짐두고
                  </Chip>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};
