import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { ReportListItem } from "#/entities/report/ui/ReportListItem";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
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

const SHARED_ARGS = {
  locationLabel: "서울 서대문구 신촌로 83",
  detailText: "무인 보관함",
  updatedLabel: "1시간 전",
  imageTitleText: "이미지 없음",
  imageHelperText: "",
} as const;

const meta = {
  title: "Product/Guides/Name Display/Report List Item",
  component: ReportListItem,
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
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "en",
    length: 26,
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
        surface="my-report-list"
        note={`lockerName · 썸네일·chevron 차감 후 좁은 text column. ${NAME_DISPLAY_SAMPLE_NOTE}`}
        rows={[
          {
            key: `${sample.locale}-${sample.length}`,
            label: sample.label,
            text: sample.text,
            length: sample.length,
            node: (
              <NameDisplaySurface surface="my-report-list" viewport={viewport}>
                <ReportListItem titleText={sample.text} {...SHARED_ARGS} />
              </NameDisplaySurface>
            ),
          },
        ]}
      />
    );
  },
};
