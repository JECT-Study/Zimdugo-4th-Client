import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown.tsx";

const meta = {
  title: "Components/Controls/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "필터 드롭다운. Figma: `pb08Ww9owybybpwWkySqu7` · 노드 `1097-5905`.",
      },
    },
  },
  args: {
    href: "#",
    children: "짐두고",
    state: "default" as const,
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  name: "States",
  render: () => (
    <table
      style={{
        borderCollapse: "collapse",
        width: 359,
        background: "#fff",
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "8px 12px" }}>Default</th>
          <th style={{ textAlign: "left", padding: "8px 12px" }}>Active</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "8px 12px" }}>
            <Dropdown href="#" state="default">
              짐두고
            </Dropdown>
          </td>
          <td style={{ padding: "8px 12px" }}>
            <Dropdown href="#" state="active">
              짐두고
            </Dropdown>
          </td>
        </tr>
      </tbody>
    </table>
  ),
};
