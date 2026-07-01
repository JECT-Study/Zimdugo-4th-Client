import type { Meta, StoryObj } from "@storybook/react";
import { MapPinMarker } from "./MapPinMarker.tsx";

const meta = {
  title: "Design System/Components/Map/MapPinMarker",
  component: MapPinMarker,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["locker", "favoriteLocker", "place", "placeCluster", "cluster"],
    },
    count: {
      control: "text",
    },
    scale: {
      control: { type: "range", min: 0.3, max: 1.5, step: 0.05 },
    },
  },
  args: {
    variant: "locker",
    count: 3,
    scale: 1,
  },
} satisfies Meta<typeof MapPinMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <MapPinMarker variant="locker" />
      <MapPinMarker variant="favoriteLocker" />
      <MapPinMarker variant="place" count={3} />
      <MapPinMarker variant="place" count={12} />
      <MapPinMarker variant="placeCluster" count={3} />
      <MapPinMarker variant="placeCluster" count={12} />
      <MapPinMarker variant="cluster" count={3} />
      <MapPinMarker variant="cluster" count={12} />
    </div>
  ),
};

export const MapDisplayScale: Story = {
  name: "Map display scale",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <MapPinMarker variant="locker" scale={0.45} />
      <MapPinMarker variant="favoriteLocker" scale={0.45} />
      <MapPinMarker variant="place" count={3} scale={0.45} />
      <MapPinMarker variant="place" count={12} scale={0.45} />
      <MapPinMarker variant="placeCluster" count={3} scale={0.45} />
      <MapPinMarker variant="placeCluster" count={12} scale={0.45} />
      <MapPinMarker variant="cluster" count={3} scale={0.45} />
      <MapPinMarker variant="cluster" count={12} scale={0.45} />
    </div>
  ),
};
