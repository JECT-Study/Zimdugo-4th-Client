import { getLocale, overwriteGetLocale } from "@repo/i18n";
import { vars } from "@repo/ui/vars";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef } from "react";
import type { AppLocale } from "#/shared/i18n/locales";
import { SearchFilterBottomSheet } from "./SearchFilterBottomSheet.tsx";

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * 스토리가 살아있는 동안만 런타임 로케일을 갈아끼우고 언마운트 시 되돌린다.
 * 복원하지 않으면 같은 iframe 세션의 이후 스토리까지 이 로케일로 렌더된다.
 *
 * 자식이 렌더되기 전에 로케일이 적용돼야 첫 렌더부터 문구가 맞으므로
 * 교체는 렌더 중에, 복원은 언마운트 시점에 한다.
 */
const StoryLocale = ({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) => {
  const originalGetLocaleRef = useRef<LanguageGetter | null>(null);

  if (originalGetLocaleRef.current === null) {
    originalGetLocaleRef.current = getLocale as LanguageGetter;
  }

  overwriteGetLocale(() => locale);

  useEffect(() => {
    const originalGetLocale = originalGetLocaleRef.current;

    return () => {
      if (originalGetLocale) {
        overwriteGetLocale(originalGetLocale);
      }
    };
  }, []);

  return <>{children}</>;
};

type LanguageGetter = () => AppLocale;

const DEFAULT_STORY_LOCALE: AppLocale = "en";

const meta = {
  title: "Product/Search/Filter Bottom Sheet",
  component: SearchFilterBottomSheet,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => (
      <StoryLocale
        locale={
          (context.parameters.locale as AppLocale) ?? DEFAULT_STORY_LOCALE
        }
      >
        <QueryClientProvider client={storyQueryClient}>
          <div
            style={{
              width: vars.layout.designWidth,
              margin: "0 auto",
              minHeight: "100dvh",
              background: "#f5f5f5",
              position: "relative",
            }}
          >
            <Story />
          </div>
        </QueryClientProvider>
      </StoryLocale>
    ),
  ],
} satisfies Meta<typeof SearchFilterBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
};

/**
 * 영어 스토리를 본 뒤에도 한국어로 렌더되는지 확인하는 용도.
 * 로케일 복원이 깨지면 이 스토리가 영어로 나온다.
 */
export const Korean: Story = {
  name: "korean",
  parameters: {
    locale: "ko" satisfies AppLocale,
  },
};
