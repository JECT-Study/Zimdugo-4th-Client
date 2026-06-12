import { m } from "@repo/i18n";

interface ResolveMyPageNicknameOptions {
  profileNickname?: string;
  email?: string | null;
}

export const resolveMyPageNickname = ({
  profileNickname,
  email,
}: ResolveMyPageNicknameOptions) => {
  const nickname = profileNickname?.trim();
  if (nickname) {
    return nickname;
  }

  const emailName = email?.split("@")[0]?.trim();
  if (emailName) {
    return emailName;
  }

  return m.my_default_nickname();
};
