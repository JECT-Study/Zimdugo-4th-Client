import type { StoryObj } from "@storybook/react";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import {
  NameDisplayLockerDetailSummaryPreview,
  NameDisplaySurface,
} from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_BOUNDARY_RADIUS,
  NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: W / 힣 / 囍 / 曜 반복";
const ENGLISH_FONT_SIZE_VARIATIONS = [14, 15, 16, 17, 18, 20] as const;

const meta = {
  title: "Product/Guides/Name Display/Locker Detail Bottom Sheet",
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
      options: ["en", "ko", "zh", "ja", "all"],
      description: "title(보관함명) 언어 — en / ko / zh / ja / 전체",
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

export const SummaryTitle: Story = {
  render: ({ viewport, locale, radius }) => {
    const rows = buildNameDisplayBoundaryRows({
      slot: "locker-detail-title",
      locale,
      viewport,
      radius,
    }).map((row) => ({
      key: `${row.locale}-${row.length}`,
      label: row.label,
      text: row.text,
      length: row.length,
      node: (
        <NameDisplaySurface
          surface="locker-detail-bottom-sheet"
          viewport={viewport}
        >
          <NameDisplayLockerDetailSummaryPreview title={row.text} />
        </NameDisplaySurface>
      ),
    }));

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="locker-detail-bottom-sheet"
        note={`lockerName · LockerDetailBottomSheet summary title · 2줄 표시 경계 ±${radius}자. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};

export const EnglishFontSizeVariation: Story = {
  args: {
    locale: "en",
  },
  render: ({ viewport, radius }) => {
    const rows = ENGLISH_FONT_SIZE_VARIATIONS.flatMap((fontSize) =>
      buildNameDisplayBoundaryRows({
        slot: "locker-detail-title",
        locale: "en",
        viewport,
        radius,
        labelExtra: `${fontSize}px`,
      }).map((row) => ({
        key: `en-${fontSize}-${row.length}`,
        label: row.label,
        text: row.text,
        length: row.length,
        node: (
          <NameDisplaySurface
            surface="locker-detail-bottom-sheet"
            viewport={viewport}
          >
            <NameDisplayLockerDetailSummaryPreview
              title={row.text}
              titleFontSize={fontSize}
            />
          </NameDisplaySurface>
        ),
      })),
    );

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="locker-detail-bottom-sheet"
        note={`lockerName · English only · font-size ${ENGLISH_FONT_SIZE_VARIATIONS.join(
          "/",
        )}px · boundary ±${radius} chars. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
