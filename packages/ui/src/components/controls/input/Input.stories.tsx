import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, type CSSProperties, useState } from "react";
import {
  Input,
  type InputLabelTypeVariant,
  type InputProps,
  type InputSearchIconPlacement,
  type InputState,
  type InputTextActive,
} from "./Input.tsx";

const meta = {
  title: "Components/Controls/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Input variants. Figma: `194-310`, `458-426`, `194-340`, `358-604`, `337-528`, `339-354`, `338-713`. ",
      },
    },
  },
  args: {
    text: "검색어를 입력하세요",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABEL_STYLE: CSSProperties = {
  fontSize: "11px",
  color: "#8E8E8E",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const Default: Story = {
  name: "default",
  render: function DefaultStory(args: ComponentProps<typeof Input>) {
    const [isFocusWithin, setIsFocusWithin] = useState(false);
    const [state, setState] = useState<InputState>(args.state ?? "default");
    const [textActive, setTextActive] = useState<InputTextActive>(
      args.textActive ?? "on",
    );
    const [labelTypeVariant, setLabelTypeVariant] =
      useState<InputLabelTypeVariant>(args.labelTypeVariant ?? "text");
    const [searchIconPlacement, setSearchIconPlacement] =
      useState<InputSearchIconPlacement>(args.searchIconPlacement ?? "auto");
    const [showLabel, setShowLabel] = useState(Boolean(args.labelTitleText));
    const [labelTitleText, setLabelTitleText] = useState(
      args.labelTitleText ?? "label.text",
    );
    const [placeholder, setPlaceholder] = useState(
      args.placeholder ?? "검색어를 입력하세요",
    );
    const [canEditPlaceholder, setCanEditPlaceholder] = useState(false);
    const effectiveState: InputState =
      isFocusWithin && state !== "disabled" ? "active" : state;
    const effectiveDisabled =
      (args.isDisabled ?? false) || effectiveState === "disabled";
    const isSearchPlacementLocked = labelTypeVariant === "iconText";
    const sharedProps: InputProps = {
      ...args,
      state: effectiveState,
      textActive,
      labelTypeVariant,
      searchIconPlacement,
      placeholder,
      isDisabled: effectiveDisabled,
      labelTitleText: showLabel ? labelTitleText : undefined,
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          background: "#fff",
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          minWidth: 760,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            maxWidth: 520,
          }}
          onFocusCapture={() => setIsFocusWithin(true)}
          onBlurCapture={(event) => {
            const nextFocused = event.relatedTarget as Node | null;
            if (!event.currentTarget.contains(nextFocused)) {
              setIsFocusWithin(false);
            }
          }}
        >
          <Input {...sharedProps} />
          <Input
            {...sharedProps}
            labelTitleText={showLabel ? `${labelTitleText} 2` : undefined}
          />
        </div>

        <div
          style={{
            width: "100%",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 160px)",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>state</span>
            <select
              value={effectiveState}
              onChange={(event) =>
                setState(event.currentTarget.value as InputState)
              }
            >
              {[
                "default",
                "ghost",
                "disabled",
                "active",
                "error",
                "searchHome",
                "searchFilter",
                "underlined",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>input.text active</span>
            <select
              value={textActive}
              onChange={(event) =>
                setTextActive(event.currentTarget.value as InputTextActive)
              }
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>labelText type</span>
            <select
              value={labelTypeVariant}
              onChange={(event) => {
                const nextType = event.currentTarget
                  .value as InputLabelTypeVariant;
                setLabelTypeVariant(nextType);
                if (nextType === "iconText") {
                  setSearchIconPlacement("none");
                }
              }}
            >
              <option value="iconText">iconText</option>
              <option value="text">text</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>search icon placement</span>
            <select
              value={searchIconPlacement}
              onChange={(event) =>
                setSearchIconPlacement(
                  event.currentTarget.value as InputSearchIconPlacement,
                )
              }
              disabled={isSearchPlacementLocked}
            >
              <option value="auto">auto</option>
              <option value="left">left</option>
              <option value="right">right</option>
              <option value="none">none</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>placeholder</span>
            <input
              value={placeholder}
              onChange={(event) => setPlaceholder(event.currentTarget.value)}
              disabled={!canEditPlaceholder}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={LABEL_STYLE}>label text</span>
            <input
              value={labelTitleText}
              onChange={(event) => setLabelTitleText(event.currentTarget.value)}
              disabled={!showLabel}
            />
          </label>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <input
              type="checkbox"
              checked={showLabel}
              onChange={(event) => setShowLabel(event.currentTarget.checked)}
            />
            label on/off
          </label>
          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <input
              type="checkbox"
              checked={canEditPlaceholder}
              onChange={(event) =>
                setCanEditPlaceholder(event.currentTarget.checked)
              }
            />
            placeholder 수정하기
          </label>
        </div>
      </div>
    );
  },
};

export const InputBasic: Story = {
  name: "input.basic",
  render: (args: InputProps) => {
    const BASIC_STATES = [
      "default",
      "ghost",
      "disabled",
      "active",
      "error",
      "searchHome",
      "searchFilter",
      "underlined",
    ] as const;
    const iconColumns = [
      { key: "left", label: "left.search", placement: "left" as const },
      { key: "right", label: "right.search", placement: "right" as const },
      { key: "none", label: "none", placement: "none" as const },
    ];

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
            gridTemplateColumns: `96px repeat(${iconColumns.length}, 220px)`,
            rowGap: 20,
            columnGap: 20,
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <div />
          {iconColumns.map((column) => (
            <span
              key={`header-${column.key}`}
              style={{ ...LABEL_STYLE, textAlign: "center" }}
            >
              {column.label}
            </span>
          ))}

          {BASIC_STATES.flatMap((state) => [
            <span
              key={`row-${state}`}
              style={{
                ...LABEL_STYLE,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {state}
            </span>,
            ...iconColumns.map((column) => (
              <div
                key={`${state}-${column.key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Input
                  {...args}
                  state={state}
                  labelTypeVariant="text"
                  searchIconPlacement={column.placement}
                />
              </div>
            )),
          ])}
        </div>
      </div>
    );
  },
};

export const InputLabel: Story = {
  name: "input.label",
  render: (args: InputProps) => {
    const labelTextTypeColumns = [
      {
        key: "text",
        label: "labelText.text",
        variant: "text" as const,
        searchIconPlacement: "left" as const,
      },
      {
        key: "iconText",
        label: "labelText. icon-text",
        variant: "iconText" as const,
        searchIconPlacement: "none" as const,
      },
    ];
    const textActiveRows = [
      { key: "on", label: "input.text active: on", active: "on" as const },
      { key: "off", label: "input.text active: off", active: "off" as const },
    ];
    const CELL_CENTER: CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
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
            gridTemplateColumns: `170px repeat(${labelTextTypeColumns.length}, 220px)`,
            gridTemplateRows: `40px repeat(${textActiveRows.length}, 92px)`,
            alignItems: "center",
            justifyItems: "center",
            gap: "20px 20px",
          }}
        >
          <div />
          {labelTextTypeColumns.map((column) => (
            <span
              key={column.key}
              style={{ ...LABEL_STYLE, textAlign: "center" }}
            >
              {column.label}
            </span>
          ))}

          {textActiveRows.flatMap((row) => [
            <span
              key={`row-${row.key}`}
              style={{
                ...LABEL_STYLE,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {row.label}
            </span>,
            ...labelTextTypeColumns.map((column) => (
              <div key={`${row.key}-${column.key}`} style={CELL_CENTER}>
                <Input
                  {...args}
                  labelTitleText="label"
                  labelTypeVariant={column.variant}
                  searchIconPlacement={column.searchIconPlacement}
                  textActive={row.active}
                  state="ghost"
                />
              </div>
            )),
          ])}
        </div>
      </div>
    );
  },
};
