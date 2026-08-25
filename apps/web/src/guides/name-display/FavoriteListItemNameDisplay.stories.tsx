import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { FavoriteListItem } from "#/entities/favorite/ui/FavoriteListItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  buildEllipsisBoundaryRows,
  type EllipsisLocaleSelection,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

const SHARED_META = {
  distanceLabel: "1.3km",
  updatedLabel: "1시간 전",
  isFavorite: true,
} as const;

const PLACE_EXAMPLE_NOTE =
  "예: 강남역 교보타워 5층 안내데스크 맞은편 · Gangnam Station Kyobo Tower 5F Info Desk";

/**
 * 스토리 전용 args.
 *
 * viewport·locale 은 컨트롤로만 쓰는 값이라 컴포넌트 props 에 없다. 타입을 주지
 * 않으면 Storybook 이 component 에서 args 를 추론해 이 둘을 모르는 것으로 본다.
 */
type NameDisplayStoryArgs = ComponentProps<typeof FavoriteListItem> & {
  viewport: NameDisplayViewport;
  locale: EllipsisLocaleSelection;
};

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
      options: ["ko", "en", "all"],
      description: "title(보관함명) 언어 — ko / en / 둘 다",
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<NameDisplayStoryArgs>;

export default meta;

type Story = StoryObj<NameDisplayStoryArgs>;

export const TitleOnly: Story = {
  render: ({ viewport, locale }) => {
    const rows = buildEllipsisBoundaryRows({
      slot: "favorite-title",
      locale,
      viewport,
    }).map((row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
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
        note={`lockerName(title) · 한글/영문 title 각각 말줄임 경계 ±5자. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
