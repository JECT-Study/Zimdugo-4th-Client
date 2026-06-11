# 설정 공지사항 및 정책 문서 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설정 공지사항을 기존 문서 UI로 제공하고 약관 및 개인정보처리방침의 운영 정보를 보강한다.

**Architecture:** 문서 콘텐츠는 `legal-documents.ts`의 정적 모델로 관리하고, 세 화면 모두 `LegalDocumentPage`를 공유한다. 임시 빨간 안내 전용 데이터와 UI는 제거해 문서 본문만 렌더링한다.

**Tech Stack:** TypeScript, React 19, TanStack Router, vanilla-extract, Vitest

---

### Task 1: 문서 모델 요구사항 고정

**Files:**
- Create: `apps/web/src/features/settings/legal/model/legal-documents.test.ts`
- Modify: `apps/web/src/features/settings/legal/model/legal-documents.ts`

- [ ] 공지 본문과 EXIF 처리 고지를 검증하는 실패 테스트를 작성한다.
- [ ] `pnpm --filter web test -- legal-documents.test.ts`를 실행해 누락된 `noticeDocument`로 실패하는지 확인한다.
- [ ] 공지 문서를 추가하고 약관 및 개인정보처리방침 내용을 보강한다.
- [ ] 문서 모델의 `notice` 속성을 제거한다.
- [ ] 같은 테스트를 다시 실행해 통과하는지 확인한다.

### Task 2: 공통 문서 UI와 공지 라우트 연결

**Files:**
- Modify: `apps/web/src/features/settings/legal/ui/LegalDocumentPage.tsx`
- Modify: `apps/web/src/features/settings/legal/ui/legal-document.css.ts`
- Modify: `apps/web/src/routes/settings.notices.tsx`

- [ ] `LegalDocumentPage`에서 빨간 임시 안내 렌더링을 제거한다.
- [ ] 사용하지 않는 빨간 안내 스타일을 제거한다.
- [ ] `/settings/notices`가 `noticeDocument`를 렌더링하도록 변경한다.
- [ ] 문서 모델 테스트를 다시 실행한다.

### Task 3: 정적 검사와 렌더링 검증

**Files:**
- Verify: `apps/web/src/routeTree.gen.ts`

- [ ] `pnpm exec tsc -p apps/web/tsconfig.json --noEmit --pretty false`를 실행한다.
- [ ] 변경 파일에 Biome 검사를 실행한다.
- [ ] 개발 서버에서 설정의 세 문서 화면을 열어 레이아웃, 본문, 뒤로가기를 확인한다.
- [ ] 변경 범위를 검토하고 사용자 변경 파일이 포함되지 않았는지 확인한다.

