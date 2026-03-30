import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Colors.css.ts";
import { color } from "./color.css.ts";

// ──────────────────────────────────────────────
// Storybook 메타
// ──────────────────────────────────────────────

const meta = {
  title: "Foundation/Colors",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primitive: Story = {
  name: "Primitive",
  render: () => <PrimitiveColors />,
};

export const Semantic: Story = {
  name: "Semantic",
  render: () => <SemanticColors />,
};

const PRIMITIVE_FAMILIES: Array<{
  name: string;
  scale: Record<number, string>;
  steps: number[];
}> = [
  {
    name: "Gray",
    scale: color.palette.gray,
    steps: Object.keys(color.palette.gray).map(Number),
  },
  {
    name: "Blue",
    scale: color.palette.blue,
    steps: Object.keys(color.palette.blue).map(Number),
  },
  {
    name: "Red",
    scale: color.palette.red,
    steps: Object.keys(color.palette.red).map(Number),
  },
  {
    name: "Green",
    scale: color.palette.green,
    steps: Object.keys(color.palette.green).map(Number),
  },
];

function PrimitiveColors() {
  return (
    <div className={styles.primitiveWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Primitive Colors</h2>
        <p className={styles.pageSubtitle}>
          색상 시스템의 원시값으로, 역할 기반 색상(Semantic Color)의 재료입니다.
          역할 기반 색상으로 표현하기 어려운 예외적인 경우에 한해 직접 참조할 수
          있습니다.
        </p>
      </div>

      <div className={styles.familyList}>
        {PRIMITIVE_FAMILIES.map(({ name, scale, steps }) => (
          <div key={name}>
            <h3 className={styles.familyName}>{name}</h3>
            <div className={styles.swatchRow}>
              {steps.map((step) => (
                <ColorBlock key={step} step={step} hex={scale[step]} />
              ))}
            </div>
          </div>
        ))}

        {/* Opacity */}
        <div>
          <div className={styles.opacityLabelContainer}>
            <span className={styles.opacityDot} />
            Opacity
          </div>
          <div className={styles.swatchRow}>
            {([200, 400, 600, 800] as const).map((step) => (
              <OpacityBlock key={step} step={step} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Semantic — 토큰 데이터
// ──────────────────────────────────────────────

type SemanticToken = {
  name: string;
  value: string;
  primitiveToken: string;
  description?: string;
};
type SemanticGroup = { label: string; tokens: SemanticToken[] };

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
        name: "info.default",
        value: color.info.default,
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
];

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

function ColorBlock({ step, hex }: { step: number | string; hex: string }) {
  return (
    <div className={styles.colorBlockContainer}>
      {/* 색상 블록 */}
      <div
        title={`${step}: ${hex}`}
        className={styles.colorBlockSwatch}
        style={{ backgroundColor: hex }}
      />
      {/* 정보 영역 */}
      <div className={styles.blockInfo}>
        <div className={styles.blockStepLabel}>{step}</div>
        <div className={styles.blockValueLabel}>{hex}</div>
      </div>
    </div>
  );
}

function OpacityBlock({ step }: { step: 200 | 400 | 600 | 800 }) {
  const rgba = color.palette.opacity[step];
  return (
    <div className={styles.opacityBlockContainer}>
      <div
        title={`opacity.${step}: ${rgba}`}
        className={styles.opacityBlockSwatch}
      >
        <div
          className={styles.opacityOverlay}
          style={{ backgroundColor: rgba }}
        />
      </div>
      <div className={styles.blockInfo}>
        <div className={styles.blockStepLabel}>{step}</div>
        <div className={styles.blockValueLabel}>{rgba}</div>
      </div>
    </div>
  );
}
