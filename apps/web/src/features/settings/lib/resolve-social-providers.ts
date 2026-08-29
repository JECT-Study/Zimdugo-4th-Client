import type { SocialProvider } from "@repo/ui/assets/icons";

const SUPPORTED_SOCIAL_PROVIDERS = new Set<string>([
  "google",
  "naver",
  "kakao",
]);

const isSocialProvider = (provider: string): provider is SocialProvider =>
  SUPPORTED_SOCIAL_PROVIDERS.has(provider);

export const resolveSocialProviders = (
  providers: string[] | undefined,
): SocialProvider[] => {
  const resolvedProviders =
    providers
      ?.map((provider) => provider.toLowerCase())
      .filter(isSocialProvider) ?? [];

  return [...new Set(resolvedProviders)];
};
