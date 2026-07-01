import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import type { SearchListRecentKind } from "#/entities/search/ui/SearchListRecent";
import { SearchListRecent } from "#/entities/search/ui/SearchListRecent";
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

const meta = {
  title: "Product/Guides/Name Display/Recent Search",
  component: SearchListRecent,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    historyKind: {
      control: "inline-radio",
      options: ["keyword", "place", "locker"],
    },
    locale: {
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "title 언어 — en / ko / zh / ja",
    },
    dateLabel: {
      control: "inline-radio",
      options: ["방금", "2일 전"],
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    historyKind: "place",
    locale: "en",
    dateLabel: "2일 전",
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
  historyKind: SearchListRecentKind;
  locale: NameDisplayLocale;
  dateLabel: string;
  length: number;
}

type Story = StoryObj<NameDisplayStoryArgs>;

function renderRecentMatrix(
  viewport: NameDisplayViewport,
  historyKind: SearchListRecentKind,
  locale: NameDisplayLocale,
  dateLabel: string,
  length: number,
) {
  const sample = buildNameDisplayControlSample({
    locale,
    length,
  });

  return (
    <NameDisplayMatrix
      width={viewport}
      surface="search-overlay-item"
      rows={[
        {
          key: `${sample.locale}-${historyKind}-${dateLabel}-${sample.length}`,
          label: `${sample.label} · ${historyKind} · ${dateLabel}`,
          text: sample.text,
          length: sample.length,
          node: (
            <NameDisplaySurface
              surface="search-overlay-item"
              viewport={viewport}
            >
              <SearchListRecent
                historyKind={historyKind}
                dateLabel={dateLabel}
                onPress={() => undefined}
                onRemove={() => undefined}
              >
                {sample.text}
              </SearchListRecent>
            </NameDisplaySurface>
          ),
        },
      ]}
      note={`최근검색(${historyKind}) · historyKind/dateLabel/언어/글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
    />
  );
}

export const Interactive: Story = {
  render: ({ viewport, historyKind, locale, dateLabel, length }) =>
    renderRecentMatrix(viewport, historyKind, locale, dateLabel, length),
};
