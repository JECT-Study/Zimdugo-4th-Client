import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Colors.css.ts";
import { color } from "./color.css.ts";

const meta = {
  title: "Foundation/Colors",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {
  name: "Semantic",
  render: () => <SemanticColors />,
};

/** 시맨틱 토큰 단일 항목 */
type SemanticToken = {
  name: string;
  value: string;
  primitiveToken: string;
  description?: string;
};
/** 시맨틱 토큰 그룹 */
type SemanticGroup = { label: string; tokens: SemanticToken[] };

/** 렌더링할 시맨틱 토큰 그룹 목록 */
const SEMANTIC_GROUPS: SemanticGroup[] = [
  {
    label: "Brand",
    tokens: [
      {
        name: "brand.primary",
        value: color.brand.primary,
        primitiveToken: "color.green.500",
        description: "브랜드 주 색상",
      },
      {
        name: "brand.symbol",
        value: color.brand.symbol,
        primitiveToken: "color.red.300",
        description: "브랜드 심볼 색상",
      },
    ],
  },
  {
    label: "Info",
    tokens: [
      {
        name: "default.info",
        value: color.default.info,
        primitiveToken: "color.blue.300",
        description: "정보성 기본 색상",
      },
    ],
  },
  {
    label: "Danger",
    tokens: [
      {
        name: "danger.default",
        value: color.danger.default,
        primitiveToken: "color.red.300",
        description: "위험 기본 색상",
      },
      {
        name: "danger.lighten",
        value: color.danger.lighten,
        primitiveToken: "color.red.200",
        description: "위험 연한 색상",
      },
      {
        name: "danger.darken",
        value: color.danger.darken,
        primitiveToken: "color.red.400",
        description: "위험 짙은 색상",
      },
      {
        name: "danger.disabled",
        value: color.danger.disabled,
        primitiveToken: "color.red.100",
        description: "위험 비활성 색상",
      },
    ],
  },
  {
    label: "Text",
    tokens: [
      {
        name: "text.title",
        value: color.text.title,
        primitiveToken: "color.gray.800",
        description: "제목 텍스트 색상",
      },
      {
        name: "text.content",
        value: color.text.content,
        primitiveToken: "color.gray.700",
        description: "본문 텍스트 색상",
      },
      {
        name: "text.surface",
        value: color.text.surface,
        primitiveToken: "color.gray.600",
        description: "서피스 텍스트 색상",
      },
      {
        name: "text.brand",
        value: color.text.brand,
        primitiveToken: "color.green.500",
        description: "브랜드 텍스트 색상",
      },
      {
        name: "text.white",
        value: color.text.white,
        primitiveToken: "color.gray.100",
        description: "흰색 텍스트 색상",
      },
      {
        name: "text.error",
        value: color.text.error,
        primitiveToken: "color.red.300",
        description: "오류 텍스트 색상",
      },
      {
        name: "text.assistant",
        value: color.text.assistant,
        primitiveToken: "color.blue.300",
        description: "어시스턴트 텍스트 색상",
      },
      {
        name: "text.disable",
        value: color.text.disable,
        primitiveToken: "color.gray.500",
        description: "비활성 텍스트 색상",
      },
    ],
  },
  {
    label: "Focus",
    tokens: [
      {
        name: "focus",
        value: color.focus,
        primitiveToken: "color.green.500",
        description: "포커스 색상",
      },
    ],
  },
  {
    label: "Icon",
    tokens: [
      {
        name: "icon.primary",
        value: color.icon.primary,
        primitiveToken: "color.green.500",
        description: "주요 아이콘 색상",
      },
      {
        name: "icon.lighten",
        value: color.icon.lighten,
        primitiveToken: "color.gray.500",
        description: "연한 아이콘 색상",
      },
      {
        name: "icon.default",
        value: color.icon.default,
        primitiveToken: "color.gray.600",
        description: "기본 아이콘 색상",
      },
      {
        name: "icon.black",
        value: color.icon.black,
        primitiveToken: "color.gray.800",
        description: "검정 아이콘 색상",
      },
      {
        name: "icon.bg",
        value: color.icon.bg,
        primitiveToken: "color.gray.200",
        description: "아이콘 배경 색상",
      },
      {
        name: "icon.white",
        value: color.icon.white,
        primitiveToken: "color.gray.100",
        description: "흰색 아이콘 색상",
      },
      {
        name: "icon.error",
        value: color.icon.error,
        primitiveToken: "color.red.300",
        description: "오류 아이콘 색상",
      },
    ],
  },
  {
    label: "Border",
    tokens: [
      {
        name: "border.default",
        value: color.border.default,
        primitiveToken: "color.gray.300",
        description: "기본 보더 색상",
      },
      {
        name: "border.hover",
        value: color.border.hover,
        primitiveToken: "color.gray.500",
        description: "호버 보더 색상",
      },
      {
        name: "border.error",
        value: color.border.error,
        primitiveToken: "color.red.300",
        description: "오류 보더 색상",
      },
      {
        name: "border.focus",
        value: color.border.focus,
        primitiveToken: "color.green.500",
        description: "포커스 보더 색상",
      },
      {
        name: "border.action",
        value: color.border.action,
        primitiveToken: "color.gray.700",
        description: "액션 보더 색상",
      },
    ],
  },
  {
    label: "Background",
    tokens: [
      {
        name: "bg.default",
        value: color.bg.default,
        primitiveToken: "color.gray.100",
        description: "기본 배경 색상",
      },
      {
        name: "bg.surface",
        value: color.bg.surface,
        primitiveToken: "color.gray.200",
        description: "서피스 배경 색상",
      },
      {
        name: "bg.subtle",
        value: color.bg.subtle,
        primitiveToken: "color.gray.300",
        description: "은은한 배경 색상",
      },
      {
        name: "bg.active",
        value: color.bg.active,
        primitiveToken: "color.gray.700",
        description: "활성 배경 색상",
      },
      {
        name: "bg.disable",
        value: color.bg.disable,
        primitiveToken: "color.gray.500",
        description: "비활성 배경 색상",
      },
      {
        name: "bg.brand.default",
        value: color.bg.brand.default,
        primitiveToken: "color.green.500",
        description: "브랜드 기본 배경 색상",
      },
      {
        name: "bg.brand.disable",
        value: color.bg.brand.disable,
        primitiveToken: "color.green.100",
        description: "브랜드 비활성 배경 색상",
      },
      {
        name: "bg.brand.active",
        value: color.bg.brand.active,
        primitiveToken: "color.green.700",
        description: "브랜드 활성 배경 색상",
      },
    ],
  },
];

/** 역할 기반 시맨틱 컬러 토큰을 그룹별로 표시합니다 */
function SemanticColors() {
  return (
    <div className={styles.semanticWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Semantic Colors</h2>
        <p className={styles.pageSubtitle}>
          색상에 "어디에 쓰이는 색인지" 역할과 의미를 부여한 토큰입니다.
          가능하면 이 토큰을 우선 참조하는 것을 권장합니다.
        </p>
      </div>

      <div className={styles.groupList}>
        {SEMANTIC_GROUPS.map((group) => (
          <div key={group.label}>
            {/* 그룹 헤더 */}
            <div className={styles.groupHeader}>
              <span className={styles.groupLabel}>{group.label}</span>
              <span className={styles.groupCount}>
                {group.tokens.length} tokens
              </span>
            </div>

            {/* 컬럼 헤더 */}
            <div className={styles.columnHeader}>
              <div className={styles.columnHeaderSpacer} />
              <div className={styles.columnHeaderToken}>Token</div>
              <div className={styles.columnHeaderPrimitive}>Primitive</div>
            </div>

            {/* 토큰 행 */}
            {group.tokens.map((token) => (
              <SemanticTokenRow key={token.name} token={token} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 단일 시맨틱 토큰을 스워치, 토큰명, 원시 토큰 경로와 함께 표시합니다 */
function SemanticTokenRow({ token }: { token: SemanticToken }) {
  return (
    <div className={styles.tokenRow}>
      <div
        title={token.primitiveToken}
        className={styles.tokenSwatch}
        style={{ backgroundColor: token.value }}
      />
      {/* 토큰명 + 설명 */}
      <div className={styles.tokenInfo}>
        <div className={styles.tokenName}>{`color.${token.name}`}</div>
        {token.description && (
          <div className={styles.tokenDescription}>{token.description}</div>
        )}
      </div>
      {/* Primitive 토큰 경로 */}
      <div className={styles.primitiveTokenBadge}>{token.primitiveToken}</div>
    </div>
  );
}
