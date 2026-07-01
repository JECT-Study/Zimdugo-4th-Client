import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
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
import { ReportDetailTitlePreview } from "#/shared/storybook/ReportDetailTitlePreview";

const meta = {
  title: "Product/Guides/Name Display/Report Detail Modal",
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
    length: 36,
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
        surface="report-detail-title"
        note={`20px 제목 · 언어와 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
        rows={[
          {
            key: `${sample.locale}-${sample.length}`,
            label: sample.label,
            text: sample.text,
            length: sample.length,
            node: (
              <NameDisplaySurface
                surface="report-detail-title"
                viewport={viewport}
              >
                <ReportDetailTitlePreview titleText={sample.text} />
              </NameDisplaySurface>
            ),
          },
        ]}
      />
    );
  },
};
