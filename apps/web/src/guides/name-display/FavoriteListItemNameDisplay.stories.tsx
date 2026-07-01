import type { StoryObj } from "@storybook/react";
import { FavoriteListItem } from "#/entities/favorite/ui/FavoriteListItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_BOUNDARY_RADIUS,
  NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
} from "#/shared/storybook/name-display-matrix";

const SHARED_META = {
  distanceLabel: "1.3km",
  updatedLabel: "1시간 전",
  isFavorite: true,
} as const;

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: 힣 / 囍 / 曜 / W 반복";

const meta = {
  title: "Product/Guides/Name Display/Favorite List Item",
  component: FavoriteListItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    locale: {
      control: "inline-radio",
      options: ["ko", "zh", "ja", "en", "all"],
      description: "title(보관함명) 언어 — ko / zh / ja / en / 전체",
    },
    radius: NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
    radius: NAME_DISPLAY_BOUNDARY_RADIUS,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  render: ({ viewport, locale, radius }) => {
    const rows = buildNameDisplayBoundaryRows({
      slot: "favorite-title",
      locale,
      viewport,
      radius,
    }).map((row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
      text: row.text,
      length: row.length,
      node: (
        <NameDisplaySurface surface="my-favorite-list" viewport={viewport}>
          <FavoriteListItem titleText={row.text} {...SHARED_META} />
        </NameDisplaySurface>
      ),
    }));

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="my-favorite-list"
        note={`lockerName(title) · 한중일영 title 각각 2줄 표시 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
