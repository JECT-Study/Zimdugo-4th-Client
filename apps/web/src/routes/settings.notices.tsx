import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import {
  NoticeDetailPage,
  NoticeListPage,
} from "#/features/settings/legal/ui/NoticePages";

type NoticesSearch = {
  id?: number;
};

const parseNoticesSearch = (search: Record<string, unknown>): NoticesSearch => {
  const id =
    typeof search.id === "number" && Number.isInteger(search.id)
      ? search.id
      : typeof search.id === "string" && /^\d+$/.test(search.id)
        ? Number(search.id)
        : undefined;
  return id !== undefined ? { id } : {};
};

export const Route = createFileRoute("/settings/notices")({
  validateSearch: parseNoticesSearch,
  component: SettingsNoticesPage,
});

function SettingsNoticesPage() {
  const navigate = useNavigate();
  const { id } = useSearch({ from: "/settings/notices" }) as NoticesSearch;

  const handleSelect = (doc: ClientDocumentResponse) => {
    void navigate({
      to: "/settings/notices",
      search: { id: doc.id },
    });
  };

  const handleBack = () => {
    void navigate({ to: "/settings/notices", search: {} });
  };

  if (id !== undefined) {
    return (
      <SettingsNoticeDetailPage
        noticeId={id}
        onBack={handleBack}
      />
    );
  }

  return <NoticeListPage onSelect={handleSelect} />;
}

// 상세 페이지 — 캐시에서 문서를 찾아 렌더링
import { useDocuments } from "#/features/settings/legal/model/useDocuments";
import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import {
  content,
  header,
  page,
} from "#/features/settings/legal/ui/legal-document.css.ts";

function SettingsNoticeDetailPage({
  noticeId,
  onBack,
}: {
  noticeId: number;
  onBack: () => void;
}) {
  const { data } = useDocuments("NOTICE");
  const doc = data?.find((d) => d.id === noticeId);

  if (!doc) {
    return (
      <div className={page}>
        <Header
          className={header}
          leading="back"
          titleType="text"
          title={m.settings_notice()}
          onBack={onBack}
        />
        <main className={content} />
      </div>
    );
  }

  return <NoticeDetailPage doc={doc} onBack={onBack} />;
}
