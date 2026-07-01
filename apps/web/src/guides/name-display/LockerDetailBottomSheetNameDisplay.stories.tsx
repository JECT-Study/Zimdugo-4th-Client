import type { StoryObj } from "@storybook/react";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import {
  NameDisplayLockerDetailSummaryPreview,
  NameDisplaySurface,
} from "#/shared/storybook/NameDisplaySurface";
import {
  buildBoundaryText,
  buildNameDisplayBoundaryRows,
  NAME_DISPLAY_BOUNDARY_RADIUS,
  NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocale,
} from "#/shared/storybook/name-display-matrix";

const PLACE_EXAMPLE_NOTE = "worst-case 샘플: W / 힣 / 囍 / 曜 반복";

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
    fontSize: {
      control: { type: "range", min: 10, max: 28, step: 1 },
      description: "FontSizeVariation에서 title font-size를 직접 조절",
    },
    length: {
      control: { type: "range", min: 1, max: 80, step: 1 },
      description: "FontSizeVariation에서 선택 언어의 최대폭 문자 반복 글자수",
    },
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "all",
    radius: NAME_DISPLAY_BOUNDARY_RADIUS,
    fontSize: 16,
    length: 30,
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

export const FontSizeVariation: Story = {
  argTypes: {
    locale: {
      control: "inline-radio",
      options: ["en", "ko", "zh", "ja"],
      description: "title 언어 — en / ko / zh / ja",
    },
  },
  args: {
    fontSize: 16,
    length: 30,
    locale: "en",
  },
  render: ({ viewport, fontSize, length, locale }) => {
    const selectedLocale = (
      locale === "all" ? "en" : locale
    ) as NameDisplayLocale;
    const text = buildBoundaryText(selectedLocale, length);
    const rows = [
      {
        key: `${selectedLocale}-${fontSize}-${length}`,
        label: `${selectedLocale} ${length}자 · ${fontSize}px`,
        text,
        length,
        node: (
          <NameDisplaySurface
            surface="locker-detail-bottom-sheet"
            viewport={viewport}
          >
            <NameDisplayLockerDetailSummaryPreview
              title={text}
              titleFontSize={fontSize}
            />
          </NameDisplaySurface>
        ),
      },
    ];

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="locker-detail-bottom-sheet"
        note={`lockerName · 언어, font-size, 글자수를 controls에서 직접 조절. ${PLACE_EXAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
