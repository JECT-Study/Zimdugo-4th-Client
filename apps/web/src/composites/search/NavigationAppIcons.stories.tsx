import type { Meta, StoryObj } from "@storybook/react";

const NAVIGATION_APP_ICONS = [
  {
    name: "Naver Map",
    jpg: "/icons/navigation/naver-map.jpg",
    png: "/icons/navigation/naver-map.png",
  },
  {
    name: "Google Maps",
    jpg: "/icons/navigation/google-maps.jpg",
    png: "/icons/navigation/google-maps.png",
  },
  {
    name: "Kakao Map",
    jpg: "/icons/navigation/kakao-map.jpg",
    png: "/icons/navigation/kakao-map.png",
  },
  {
    name: "Apple Maps",
    jpg: "/icons/navigation/apple-maps.jpg",
    png: "/icons/navigation/apple-maps.png",
  },
] as const;

const meta = {
  title: "Product/Search/Navigation App Icons",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 140px)",
        gap: 16,
        padding: 24,
        background: "#1f1f1f",
        borderRadius: 16,
      }}
    >
      {NAVIGATION_APP_ICONS.map((icon) => (
        <div
          key={icon.name}
          style={{
            display: "grid",
            gap: 8,
            color: "#fff",
            fontSize: 13,
            fontFamily: "sans-serif",
          }}
        >
          <strong>{icon.name}</strong>
          <img src={icon.jpg} alt={`${icon.name} JPG`} width={64} height={64} />
          <img src={icon.png} alt={`${icon.name} PNG`} width={64} height={64} />
        </div>
      ))}
    </div>
  ),
};
