# Report History 이미지 Placeholder 문구 수정 계획

Created: 2026-06-12

## 문제와 목표

`LockerImageReportFrame`은 search 상세 화면을 위해 기본 문구
`아직 이미지가 없어요 / 제보하기를 통해 등록할 수 있어요!`를 제공한다.
report history의 목록 카드와 상세 모달도 이 컴포넌트를 재사용하면서 문구를
지정하지 않아, 이미 제보를 완료한 내역에서도 추가 제보를 유도하는 문구가 노출된다.

목표는 공용 이미지 프레임의 시각적 형태는 유지하되 report history에서는
이미지가 없다는 사실만 `이미지 없음`으로 간결하게 표시하는 것이다.

## 범위

### 포함

- report history 목록 카드의 이미지 없음 문구
- report history 상세 모달의 이미지 없음 문구
- 한국어, 영어, 일본어, 중국어 번역 메시지
- 두 history 노출면의 컴포넌트 테스트와 Storybook 확인

### 제외

- search 상세 화면의 기존 이미지 없음 문구와 동작
- `LockerImageReportFrame`의 레이아웃, 크기 variant, 아이콘, 스타일 변경
- 실제 이미지 URL 표시 로직 변경
- report history 페이지의 카드 구조나 상세 정보 레이아웃 개편

## 현재 구조

- `apps/web/src/entities/locker/ui/image-report-frame/LockerImageReportFrame.tsx`
  - `titleText`와 `helperText`가 없으면 search용 기본 메시지를 사용한다.
  - `helperText`에 빈 문자열을 전달하면 보조 문구를 렌더링하지 않는다.
- `apps/web/src/entities/report/ui/ReportListItem.tsx`
  - 공용 프레임을 `compact` 크기로 사용하며 선택적 문구 props를 그대로 전달한다.
  - `apps/web/src/routes/my.reports.tsx`에서는 문구 props를 전달하지 않는다.
- `apps/web/src/entities/report/ui/ReportDetailViewerModal.tsx`
  - 이미지가 없을 때 공용 프레임을 `half` 크기로 사용하지만 문구를 지정하지 않는다.

## 핵심 결정

1. 공용 프레임의 기본값은 변경하지 않는다.
   - 기본값을 바꾸면 search 문맥의 안내 문구까지 달라질 수 있다.
2. report history 전용 번역 키를 추가한다.
   - 화면 문맥이 다른 문구를 search 키에 결합하지 않고 의미 단위로 분리한다.
3. history 소비 지점에서 `titleText`는 전용 번역값, `helperText`는 빈 문자열을 전달한다.
   - 새 variant나 조건부 스타일 없이 기존 컴포넌트 API로 한 줄 문구를 구현한다.
4. 목록과 상세 모달에 동일한 정책을 적용한다.
   - 같은 report history 흐름 안에서 placeholder 표현이 달라지는 문제를 피한다.

## 구현 단위

### U1. Report history 전용 다국어 문구 추가

파일:

- `packages/i18n/messages/ko.json`
- `packages/i18n/messages/en.json`
- `packages/i18n/messages/ja.json`
- `packages/i18n/messages/zh.json`

변경:

- report history의 이미지 부재 상태를 나타내는 전용 메시지 키를 추가한다.
- 한국어는 `이미지 없음`으로 정의하고 나머지 언어도 같은 의미의 짧은 명사형으로 맞춘다.

검증 시나리오:

1. 모든 지원 언어 파일에 동일한 키가 존재한다.
2. 번역 생성 또는 타입 검사에서 누락 키 오류가 발생하지 않는다.

### U2. 목록 카드에서 history 문구를 명시

파일:

- `apps/web/src/routes/my.reports.tsx`
- `apps/web/src/entities/report/ui/ReportListItem.test.tsx`
- `apps/web/src/entities/report/ui/ReportListItem.stories.tsx`

변경:

- `ReportListItem`에 history 전용 `imageTitleText`와 빈 `imageHelperText`를 전달한다.
- Storybook 기본 예시가 실제 history 사용 상태를 보여주도록 args를 보완한다.

검증 시나리오:

1. 이미지 영역에 `이미지 없음`이 표시된다.
2. search용 보조 문구 `제보하기를 통해 등록할 수 있어요!`는 표시되지 않는다.
3. 카드 제목, 주소, 상세 메타, 이동 버튼 접근성 이름은 기존과 동일하다.

### U3. 상세 모달에서 history 문구를 명시

파일:

- `apps/web/src/entities/report/ui/ReportDetailViewerModal.tsx`
- `apps/web/src/entities/report/ui/ReportDetailViewerModal.test.tsx`
- `apps/web/src/entities/report/ui/ReportDetailViewerModal.stories.tsx`

변경:

- `detail.imageUrl`이 없을 때 공용 프레임에 history 전용 제목과 빈 보조 문구를 전달한다.
- 이미지 없음 Story와 실제 이미지 Story를 모두 유지해 두 상태를 비교할 수 있게 한다.

검증 시나리오:

1. `imageUrl`이 `null`이면 `이미지 없음`만 표시된다.
2. search용 제목과 보조 문구는 표시되지 않는다.
3. 유효한 `imageUrl`이 있으면 placeholder 대신 이미지와 대체 텍스트가 렌더링된다.
4. loading, error 상태에서는 이미지 placeholder가 렌더링되지 않는다.

## 검증

1. 관련 Vitest 실행
   - `ReportListItem.test.tsx`
   - `ReportDetailViewerModal.test.tsx`
2. 웹 앱 TypeScript 검사
3. Biome으로 변경 파일 검사
4. Storybook에서 다음 상태를 렌더링 확인
   - report history 목록 카드의 compact placeholder
   - 상세 모달의 이미지 없음 상태
   - 상세 모달의 실제 이미지 상태
5. search 상세 화면에서 기존 두 줄 안내 문구가 유지되는지 회귀 확인

## 위험과 대응

- 번역 키를 일부 언어에만 추가하면 i18n 생성 또는 타입 검사에 실패할 수 있다.
  - 네 언어 메시지 파일을 한 변경 단위로 수정한다.
- 공용 컴포넌트 기본값을 직접 바꾸면 search 화면이 회귀할 수 있다.
  - 기본값은 유지하고 report history 소비 지점에서만 명시적으로 덮어쓴다.
- 목록만 수정하면 상세 모달에 부적절한 문구가 남는다.
  - 목록과 상세를 같은 완료 조건으로 검증한다.
