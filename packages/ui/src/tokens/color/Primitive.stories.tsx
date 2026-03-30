import type { Meta, StoryObj } from "@storybook/react";
import * as styles from "./Colors.css.ts";
import { color } from "./color.css.ts";

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
            {(
              Object.keys(
                color.palette.opacity,
              ) as unknown as (keyof typeof color.palette.opacity)[]
            ).map((step) => (
              <OpacityBlock key={step} step={step} />
            ))}
          </div>
        </div>
      </div>

      <PrimitiveTokenTable />
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

function PrimitiveTokenTable() {
  return (
    <div className={styles.tokenTableSection}>
      <div className={styles.tokenTableTitle}>Color Tokens</div>
      <table className={styles.tokenTable}>
        <thead>
          <tr>
            <th className={styles.tokenTableHeadCell}>Token</th>
            <th className={styles.tokenTableHeadCell}>Value</th>
          </tr>
        </thead>
        <tbody>
          {PRIMITIVE_FAMILIES.flatMap(({ name, scale, steps }) =>
            steps.map((step) => (
              <tr key={`${name}-${step}`} className={styles.tokenTableRow}>
                <td className={styles.tokenTableCellName}>
                  {`color.${name.toLowerCase()}.${step}`}
                </td>
                <td className={styles.tokenTableCellValue}>
                  <span
                    className={styles.tokenTableSwatch}
                    style={{ backgroundColor: scale[step] }}
                  />
                  {scale[step]}
                </td>
              </tr>
            )),
          )}
          {([200, 400, 600, 800] as const).map((step) => (
            <tr key={`opacity-${step}`} className={styles.tokenTableRow}>
              <td className={styles.tokenTableCellName}>
                {`color.opacity.${step}`}
              </td>
              <td className={styles.tokenTableCellValue}>
                <span
                  className={styles.tokenTableSwatch}
                  style={{ backgroundColor: color.palette.opacity[step] }}
                />
                {color.palette.opacity[step]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
