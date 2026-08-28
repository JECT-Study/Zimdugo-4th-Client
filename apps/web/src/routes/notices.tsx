import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { NoticeListPage } from "#/features/settings/legal/ui/NoticePages";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";

export const Route = createFileRoute("/notices")({
  component: NoticesPage,
});

function NoticesPage() {
  const navigate = useNavigate();
  const isNoticesRoot = useRouterState({
    select: (state) =>
      stripLocalePathPrefix(state.location.pathname) === "/notices",
  });

  const handleSelect = (doc: ClientDocumentResponse) => {
    void navigate({
      to: "/notices/$noticeId",
      params: { noticeId: String(doc.id) },
    });
  };

  // 상세는 이 라우트의 자식이라 목록 대신 Outlet 을 내보내야 마운트된다.
  if (!isNoticesRoot) {
    return <Outlet />;
  }

  return <NoticeListPage onSelect={handleSelect} />;
}
