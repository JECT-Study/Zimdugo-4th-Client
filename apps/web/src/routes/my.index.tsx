import { createFileRoute, redirect } from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";

/**
 * `/my` 는 설정으로 보내는 호환용 리디렉션이다.
 *
 * 마이 진입점을 없애면서 `/my` 부모 라우트를 지웠는데, 그 라우트가 이 리디렉션도
 * 함께 갖고 있었다. 저장된 북마크와 외부 딥링크가 not-found 로 떨어지므로 경로만
 * 되살린다. 자식 라우트를 다시 감싸지 않도록 `/my` 만 정확히 매칭하는 index
 * 라우트로 두었다. 인증 가드는 my.reports/my.favorites 가 `requireAuthenticatedRoute` 로 건다.
 */
export const Route = createFileRoute("/my/")({
  head: createNoIndexNoFollowHead,
  beforeLoad: () => {
    throw redirect({ to: "/settings", replace: true });
  },
});
