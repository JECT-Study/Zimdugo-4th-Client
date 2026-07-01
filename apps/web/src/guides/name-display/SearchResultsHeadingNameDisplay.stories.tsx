import { m } from "@repo/i18n";
import type { StoryObj } from "@storybook/react";
import type { ComponentType, ReactNode } from "react";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { NameDisplayMatrix } from "#/shared/storybook/NameDisplayMatrix";
import { NameDisplaySurface } from "#/shared/storybook/NameDisplaySurface";
import {
  type BoundaryTextKind,
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
  title: "Product/Guides/Name Display/Results Heading",
  component: SearchResultsHeading,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "inline-radio",
      options: NAME_DISPLAY_VIEWPORTS,
    },
    scope: {
      control: "inline-radio",
      options: ["place", "query"],
    },
    locale: {
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "placeName/검색어 언어 — en / ko / zh / ja",
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    scope: "place",
    locale: "en",
    length: 20,
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
  scope: "place" | "query";
  locale: NameDisplayLocale;
  length: number;
}

type Story = StoryObj<NameDisplayStoryArgs>;

interface HeadingScopeConfig {
  note: string;
  textKind: BoundaryTextKind;
  renderHeading: (text: string) => ReactNode;
}

function buildHeadingRows(
  viewport: NameDisplayViewport,
  locale: NameDisplayLocale,
  length: number,
  renderHeading: (text: string) => ReactNode,
  textKind?: BoundaryTextKind,
) {
  const sample = buildNameDisplayControlSample({
    locale,
    textKind: textKind ?? "place",
    length,
  });

  return [
    {
      key: `${sample.locale}-${textKind ?? "place"}-${sample.length}`,
      label: `${sample.label} · ${textKind ?? "place"}`,
      text: sample.text,
      length: sample.length,
      node: (
        <NameDisplaySurface
          surface="search-results-heading"
          viewport={viewport}
        >
          {renderHeading(sample.text)}
        </NameDisplaySurface>
      ),
    },
  ];
}

export const Interactive: Story = {
  render: ({ viewport, scope, locale, length }) => {
    const heading: HeadingScopeConfig =
      scope === "place"
        ? {
            note: `placeName이 문장에 삽입됨. 언어와 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`,
            textKind: "place",
            renderHeading: (place: string) => (
              <SearchResultsHeading
                queryText="강남"
                titleText={m.search_place_lockers_title({ place })}
              />
            ),
          }
        : {
            note: `검색어(keyword) · 언어와 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`,
            textKind: "keyword",
            renderHeading: (query: string) => (
              <SearchResultsHeading
                queryText={query}
                subtitleText="강남구 삼성동"
              />
            ),
          };

    return (
      <NameDisplayMatrix
        width={viewport}
        surface="search-results-heading"
        note={heading.note}
        rows={buildHeadingRows(
          viewport,
          locale,
          length,
          heading.renderHeading,
          heading.textKind,
        )}
      />
    );
  },
};
