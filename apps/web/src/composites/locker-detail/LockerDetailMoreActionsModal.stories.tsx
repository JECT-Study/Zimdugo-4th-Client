import { IconCircleboxMore32 } from "@repo/ui/assets/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { LockerDetailMoreActionsModal } from "./LockerDetailMoreActionsModal";

function LockerDetailMoreActionsModalStory({
  isFavorite,
  canFavorite,
}: {
  isFavorite: boolean;
  canFavorite: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenMoreActions = () => {
    setIsOpen(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "375px",
        height: "812px",
        padding: "160px 16px 0",
        boxSizing: "border-box",
        background: "#f5f5f5",
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="더보기 메뉴 열기"
        onClick={handleOpenMoreActions}
        style={{ width: 32, height: 32, padding: 0, border: 0 }}
      >
        <IconCircleboxMore32 />
      </button>
      <LockerDetailMoreActionsModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        anchorRef={triggerRef}
        isFavorite={isFavorite}
        canFavorite={canFavorite}
        onShare={() => undefined}
        onFavoriteChange={() => undefined}
        onReport={() => undefined}
      />
    </div>
  );
}

const meta = {
  title: "Product/Locker Detail/More Actions Modal",
  component: LockerDetailMoreActionsModalStory,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isFavorite: false,
    canFavorite: true,
  },
} satisfies Meta<typeof LockerDetailMoreActionsModalStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {};

export const Favorited: Story = {
  args: {
    isFavorite: true,
  },
};

export const LoggedOut: Story = {
  args: {
    canFavorite: false,
  },
};
