import type { Meta, StoryObj } from "@storybook/react";
import saveMapPin from "#/entities/map/assets/save-map-pin.png";
import selectedMapPin from "#/entities/map/assets/selected-map-pin.png";

const PUBLIC_IMAGE_ASSETS = [
  { name: "favicon.svg", src: "/favicon.svg" },
  { name: "favicon.ico", src: "/favicon.ico" },
  { name: "logo192.png", src: "/logo192.png" },
  { name: "logo512.png", src: "/logo512.png" },
  { name: "tanstack-circle-logo.png", src: "/tanstack-circle-logo.png" },
  {
    name: "tanstack-word-logo-white.svg",
    src: "/tanstack-word-logo-white.svg",
  },
  { name: "favicon-16x16.png", src: "/icons/favicon-16x16.png" },
  { name: "favicon-32x32.png", src: "/icons/favicon-32x32.png" },
  {
    name: "apple-touch-icon-180x180.png",
    src: "/icons/apple-touch-icon-180x180.png",
  },
] as const;

const MAP_IMAGE_ASSETS = [
  { name: "selected-map-pin.png", src: selectedMapPin },
  { name: "save-map-pin.png", src: saveMapPin },
] as const;

const meta = {
  title: "Product/Assets/Gallery",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function AssetCell({ name, src }: { name: string; src: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "96px auto",
        gap: 8,
        padding: 12,
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        background:
          "linear-gradient(45deg, #f7f7f7 25%, transparent 25%), linear-gradient(-45deg, #f7f7f7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7f7f7 75%), linear-gradient(-45deg, transparent 75%, #f7f7f7 75%)",
        backgroundColor: "#fff",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
        backgroundSize: "16px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            display: "block",
            maxWidth: "88px",
            maxHeight: "88px",
            objectFit: "contain",
          }}
        />
      </div>
      <div
        style={{
          color: "#4b4b4b",
          fontSize: 11,
          lineHeight: 1.25,
          textAlign: "center",
          wordBreak: "break-all",
        }}
      >
        {name}
      </div>
    </div>
  );
}

function AssetSection({
  title,
  assets,
}: {
  title: string;
  assets: readonly { name: string; src: string }[];
}) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, color: "#16181c", fontSize: 16 }}>{title}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
          gap: 12,
        }}
      >
        {assets.map((asset) => (
          <AssetCell key={asset.name} name={asset.name} src={asset.src} />
        ))}
      </div>
    </section>
  );
}

export const Images: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <AssetSection title="public" assets={PUBLIC_IMAGE_ASSETS} />
      <AssetSection title="map" assets={MAP_IMAGE_ASSETS} />
    </div>
  ),
};
