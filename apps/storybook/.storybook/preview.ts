import type { Preview } from "@storybook/react-vite";
import "@repo/ui/styles/global.css";
import "@repo/ui/tokens/color/color.css";
import "@repo/ui/tokens/typography/typography.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
