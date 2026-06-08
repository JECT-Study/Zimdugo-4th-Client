import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { DetailListName } from "./DetailListName.tsx";

const meta = {
  title: "Entities/Place/DetailListName",
  component: DetailListName,
  parameters: {
    layout: "centered", // 스토리북 미리보기 정중앙 배치
  },
  args: {
    titleText: "신촌역 5번출구",
    distanceLabel: "1.3km",
    categoryLabel: "지하철역",
    detailLabel: "실내",
  },
} satisfies Meta<typeof DetailListName>;

export default meta;
type Story = StoryObj<typeof meta>;
type DetailListNameProps = ComponentProps<typeof DetailListName>;

/** 영문 자막 유무에 따른 상태 시연 */
export const EnStates: Story = {
  name: "English Subtitle On/Off",
  render: (args: DetailListNameProps) => (
    <div
      style={{
        width: 360,
        display: "flex",
        flexDirection: "column",
        gap: 64,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "#888", fontSize: 12 }}>영문 보조 텍스트 OFF</div>
        <DetailListName {...args} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "#888", fontSize: 12 }}>
          영문 보조 텍스트 ON (거리 중앙 정렬 확인)
        </div>
        <DetailListName {...args} englishCaption="Exit 5 of Sinchon Station" />
      </div>
    </div>
  ),
};
