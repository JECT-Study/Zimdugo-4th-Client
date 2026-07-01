import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import {
  NameDisplayLockerDetailSummaryPreview,
  NameDisplaySurface,
} from "#/shared/storybook/NameDisplaySurface";
import {
  buildNameDisplayControlSample,
  NAME_DISPLAY_DEFAULT_VIEWPORT,
  NAME_DISPLAY_LENGTH_ARG_TYPE,
  NAME_DISPLAY_LOCALE_ARG_TYPE,
  NAME_DISPLAY_SAMPLE_NOTE,
  NAME_DISPLAY_VIEWPORTS,
  type NameDisplayLocale,
  type NameDisplayViewport,
} from "#/shared/storybook/name-display-matrix";

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
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "title 언어 — en / ko / zh / ja",
    },
    fontSize: {
      control: { type: "range", min: 10, max: 28, step: 1 },
      description: "FontSizeVariation에서 title font-size를 직접 조절",
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "en",
    fontSize: 16,
    length: 30,
  },
  decorators: [
    (Story: ComponentType) => (
      <div style={{ padding: "16px 0", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

interface NameDisplayStoryArgs {
  viewport: NameDisplayViewport;
  locale: NameDisplayLocale;
  length: number;
  fontSize: number;
}

type Story = StoryObj<NameDisplayStoryArgs>;

export const Interactive: Story = {
  render: ({ viewport, locale, length }) => {
    const sample = buildNameDisplayControlSample({
      locale,
      length,
    });

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="locker-detail-bottom-sheet"
        note={`lockerName · LockerDetailBottomSheet summary title · 언어와 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
        rows={[
          {
            key: `${sample.locale}-${sample.length}`,
            label: sample.label,
            text: sample.text,
            length: sample.length,
            node: (
              <NameDisplaySurface
                surface="locker-detail-bottom-sheet"
                viewport={viewport}
              >
                <NameDisplayLockerDetailSummaryPreview title={sample.text} />
              </NameDisplaySurface>
            ),
          },
        ]}
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
    const sample = buildNameDisplayControlSample({
      locale,
      length,
    });
    const rows = [
      {
        key: `${sample.locale}-${fontSize}-${sample.length}`,
        label: `${sample.label} · ${fontSize}px`,
        text: sample.text,
        length: sample.length,
        node: (
          <NameDisplaySurface
            surface="locker-detail-bottom-sheet"
            viewport={viewport}
          >
            <NameDisplayLockerDetailSummaryPreview
              title={sample.text}
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
        note={`lockerName · 언어, font-size, 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
        rows={rows}
      />
    );
  },
};
