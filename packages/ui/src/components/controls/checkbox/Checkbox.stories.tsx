import type { Meta, StoryObj } from "@storybook/react";
import React, { type ComponentProps, useEffect, useState } from "react";
import { Checkbox, type CheckboxLabelLocation } from "./Checkbox.tsx";

const meta = {
  title: "Components/Controls/checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Checkbox 상태(`186-17750`) 및 라벨 위치(`210-459`) 스토리.",
      },
    },
  },
  argTypes: {
    state: {
      control: "select",
      options: ["default", "hover", "pressed", "disabled", "focus"],
      description: "체크박스 상태",
    },
    labelLocation: {
      control: "select",
      options: ["left", "right", "bottom"],
      description: "라벨 텍스트 위치",
    },
    labelText: {
      control: "text",
      description: "라벨 텍스트",
    },
    isSelected: {
      control: "boolean",
      description: "선택 여부 (제어 컴포넌트로 사용할 때)",
    },
  },
  args: {
    labelText: "Text",
    labelLocation: "right",
    state: "default",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. 인터랙티브 기본 스토리
export const Default: Story = {
  name: "default",
  render: function DefaultStory(args: ComponentProps<typeof Checkbox>) {
    const [isChecked1, setIsChecked1] = useState(args.isSelected ?? false);
    const [isChecked2, setIsChecked2] = useState(args.isSelected ?? false);
    const [labelLocation, setLabelLocation] = useState<
      CheckboxLabelLocation | undefined
    >(args.labelLocation ?? "right");

    // args가 변경될 때만 상태 동기화 (무한 루프 방지 및 의도적 덮어쓰기 방지)
    useEffect(() => {
      if (args.isSelected !== undefined) {
        setIsChecked1(args.isSelected);
        setIsChecked2(args.isSelected);
      }
    }, [args.isSelected]);

    useEffect(() => {
      if (args.labelLocation !== undefined)
        setLabelLocation(args.labelLocation);
    }, [args.labelLocation]);

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
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <Checkbox
            {...args}
            state={undefined}
            labelLocation={labelLocation}
            labelText={labelLocation === undefined ? undefined : "Option 1"}
            isSelected={isChecked1}
            onSelectedChange={setIsChecked1}
          />
          <Checkbox
            {...args}
            state={undefined}
            labelLocation={labelLocation}
            labelText={labelLocation === undefined ? undefined : "Option 2"}
            isSelected={isChecked2}
            onSelectedChange={setIsChecked2}
          />
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
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setLabelLocation("left")}
              style={{ padding: "4px 8px", fontSize: 12 }}
            >
              Text: Left
            </button>
            <button
              type="button"
              onClick={() => setLabelLocation("right")}
              style={{ padding: "4px 8px", fontSize: 12 }}
            >
              Text: Right
            </button>
            <button
              type="button"
              onClick={() => setLabelLocation("bottom")}
              style={{ padding: "4px 8px", fontSize: 12 }}
            >
              Text: Bottom
            </button>
            <button
              type="button"
              onClick={() => setLabelLocation(undefined)}
              style={{ padding: "4px 8px", fontSize: 12 }}
            >
              No Text
            </button>
          </div>

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
                <strong>클릭 (Click):</strong> 체크박스 상태를 토글합니다.
              </li>
              <li>
                <strong>마우스 올리기 (Hover):</strong> hover 시각 효과를 확인합니다.
              </li>
              <li>
                <strong>키보드 이동 (Tab / Shift+Tab):</strong> 다음/이전 체크박스로 포커스를 이동합니다.
              </li>
              <li>
                <strong>키보드 선택 (Enter):</strong> 포커스된 체크박스 상태를 토글합니다.
              </li>
              <li>
                <strong>라벨 위치 변경:</strong> 위 버튼을 클릭하여 레이아웃을 테스트합니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};

// 2. 가로(텍스트 위치) x 세로(상태) 2D 그리드 (Variants)
export const Variants: Story = {
  name: "variants",
  render: () => {
    const states = [
      "default",
      "hover",
      "pressed",
      "disabled",
      "focus",
    ] as const;
    const locations = [
      { key: "none", label: undefined, location: undefined },
      { key: "left", label: "Text", location: "left" as const },
      { key: "right", label: "Text", location: "right" as const },
      { key: "bottom", label: "Text", location: "bottom" as const },
    ];

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
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `80px repeat(${locations.length}, 100px)`,
            rowGap: 24,
            columnGap: 24,
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {/* Header Row (가로: 텍스트 위치) */}
          <div /> {/* Top-left empty cell */}
          {locations.map((loc) => (
            <span key={`header-${loc.key}`} style={LABEL_STYLE}>
              {loc.key === "none" ? "NO TEXT" : `TEXT ${loc.key}`}
            </span>
          ))}

          {/* Data Rows (세로: 상태) */}
          {states.map((state) => (
            <React.Fragment key={`row-${state}`}>
              {/* Row Header */}
              <span
                style={{
                  ...LABEL_STYLE,
                  textAlign: "right",
                  width: "100%",
                  paddingRight: 16,
                }}
              >
                {state}
              </span>

              {/* Cells */}
              {locations.map((loc) => (
                <div
                  key={`${loc.key}-${state}`}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Checkbox
                    state={state}
                    labelText={loc.label}
                    labelLocation={loc.location}
                    isSelected={state === "pressed" || state === "focus"}
                    isDisabled={state === "disabled"}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};
