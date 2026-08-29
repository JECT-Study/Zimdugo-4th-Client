import type { Meta, StoryObj } from "@storybook/react";
import { LockerImageReportFrame } from "./LockerImageReportFrame";

const meta = {
  title: "Entities/Locker/LockerImageReportFrame",
  component: LockerImageReportFrame,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "이미지 자리에 이미지가 없을 때 쓰는 틀. `empty` 는 서버가 사진이 없다고 한 경우, `failed` 는 있다고 했는데 못 불러온 경우다.",
      },
    },
  },
} satisfies Meta<typeof LockerImageReportFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["compact", "half", "full", "fill"] as const;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#8e8e8e" }}>{label}</div>
      {children}
    </div>
  );
}

/**
 * 두 상태를 나란히 놓는다.
 *
 * 점선/실선, 아이콘 채색(카메라는 stroke, 실패는 fill), 여백이 서로 다르다.
 * 같은 모양으로 맞출지 판단할 때 이 스토리를 본다.
 */
export const States: Story = {
  name: "empty vs failed",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {SIZES.map((size) => (
        <Row key={size} label={size}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {/* fill 은 부모가 크기를 정하므로 4:3 칸을 흉내 낸다. */}
            <div style={{ width: 260, height: size === "fill" ? 195 : "auto" }}>
              <LockerImageReportFrame state="empty" size={size} />
            </div>
            <div style={{ width: 260, height: size === "fill" ? 195 : "auto" }}>
              <LockerImageReportFrame state="failed" size={size} />
            </div>
          </div>
        </Row>
      ))}
    </div>
  ),
};

/** 지금은 어느 호출부도 채우지 않지만, 다시 필요해질 때를 위해 자리는 남아 있다. */
export const WithHelperText: Story = {
  name: "helperText",
  render: () => (
    <div style={{ display: "flex", gap: 16, width: 540 }}>
      <LockerImageReportFrame
        state="empty"
        size="half"
        helperText="제보하기를 통해 등록할 수 있어요!"
      />
      <LockerImageReportFrame
        state="failed"
        size="half"
        helperText="잠시 후 다시 시도해 주세요"
      />
    </div>
  ),
};
