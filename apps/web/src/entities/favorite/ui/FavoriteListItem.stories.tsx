import type { Meta, StoryObj } from "@storybook/react";
import { FavoriteListItem } from "./FavoriteListItem.tsx";

const meta = {
  title: "Entities/Favorite/FavoriteListItem",
  component: FavoriteListItem,
  parameters: {
    layout: "centered",
  },
  args: {
    titleText: "?좎큿??5踰덉텧援?,
    englishCaption: "Exit 5 of Sinchon Station",
    distanceLabel: "1.3km",
    updatedLabel: "1hr ago",
    isFavorite: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 335 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavoriteListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutEnglishCaption: Story = {
  args: {
    englishCaption: undefined,
  },
};

export const NotFavorite: Story = {
  args: {
    isFavorite: false,
  },
};
