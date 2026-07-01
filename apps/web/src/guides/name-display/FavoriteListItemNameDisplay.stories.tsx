import type { StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { FavoriteListItem } from "#/entities/favorite/ui/FavoriteListItem";
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

const SHARED_META = {
  distanceLabel: "1.3km",
  updatedLabel: "1시간 전",
  isFavorite: true,
} as const;

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
      ...NAME_DISPLAY_LOCALE_ARG_TYPE,
      description: "title 언어 — en / ko / zh / ja",
    },
    length: NAME_DISPLAY_LENGTH_ARG_TYPE,
  },
  args: {
    viewport: NAME_DISPLAY_DEFAULT_VIEWPORT,
    locale: "en",
    length: 34,
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
        surface="my-favorite-list"
        note={`lockerName(title) · 언어와 글자수를 controls에서 직접 조절. ${NAME_DISPLAY_SAMPLE_NOTE}`}
        rows={[
          {
            key: `${sample.locale}-${sample.length}`,
            label: sample.label,
            text: sample.text,
            length: sample.length,
            node: (
              <NameDisplaySurface
                surface="my-favorite-list"
                viewport={viewport}
              >
                <FavoriteListItem titleText={sample.text} {...SHARED_META} />
              </NameDisplaySurface>
            ),
          },
        ]}
      />
    );
  },
};
