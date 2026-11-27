import { describe, expect, it } from "vitest";
import { parseLockerDetailInfo } from "./parse-locker-detail-info";

/** 서버가 실제로 주는 문구(2026-11-28 기준, 보관함 164·500). */
const SAMPLES = {
  ko: "- 상세위치: 표 내는 곳 주변\n- 보관함 개수: 소형 36개 / 중형 8개 / 대형 8개\n- 이용요금: 대형 4,400원 / 중형 3,300원 / 소형 2,200원 (평일 기본 4시간 기준)",
  en: "- Detailed location: near ticket gate\n- Number of lockers: Small 36 / Medium 8 / Large 8\n- Fee: Large KRW 4,400 / Medium KRW 3,300 / Small KRW 2,200 (weekday base 4 hours basis)",
  ja: "- 詳細位置: 改札口 周辺\n- ロッカー数: 小型 36個 / 中型 8個 / 大型 8個\n- 利用料金: 大型 4,400ウォン / 中型 3,300ウォン / 小型 2,200ウォン (平日 基本 4時間 基準)",
  zh: "- 详细位置：售票处周围\n- 寄存柜数量：小型 36个 / 中型 8个 / 大型 8个\n- 使用费用：大型 4,400韩元 / 中型 3,300韩元 / 小型 2,200韩元（工作日4小时基准）",
  "zh-TW":
    "- 詳細位置：售票處周圍\n- 寄存櫃數量：小型 36個 / 中型 8個 / 大型 8個\n- 使用費用：大型 4,400韓元 / 中型 3,300韓元 / 小型 2,200韓元（工作日4小時基準）",
} as const;

const EXPECTED_SIZES = [
  { size: "SMALL", count: 36, price: 2200 },
  { size: "MEDIUM", count: 8, price: 3300 },
  { size: "LARGE", count: 8, price: 4400 },
];

describe("parseLockerDetailInfo", () => {
  it.each(Object.entries(SAMPLES))(
    "%s 문구에서 크기별 개수·요금을 소형부터 읽는다",
    (_, text) => {
      const info = parseLockerDetailInfo(text);

      expect(info?.sizes).toEqual(EXPECTED_SIZES);
      expect(info?.unparsedLines).toEqual([]);
    },
  );

  it("상세위치와 요금 기준은 번역된 문장 그대로 둔다", () => {
    expect(parseLockerDetailInfo(SAMPLES.ko)).toMatchObject({
      location: "표 내는 곳 주변",
      priceBasis: "평일 기본 4시간 기준",
    });
    expect(parseLockerDetailInfo(SAMPLES.zh)).toMatchObject({
      location: "售票处周围",
      priceBasis: "工作日4小时基准",
    });
  });

  it("숫자가 앞에 오고 크기 이름이 줄어든 중국어 번역도 읽는다", () => {
    const info = parseLockerDetailInfo(
      "- 详细位置：E / S #3,4 底部\n- 寄存柜数量：0 大型 / 8 中型 / 32 小\n- 使用费用：小型 3,000韩元 / 中型 4,500韩元（每4小时）",
    );

    expect(info).toEqual({
      location: "E / S #3,4 底部",
      sizes: [
        { size: "SMALL", count: 32, price: 3000 },
        { size: "MEDIUM", count: 8, price: 4500 },
        { size: "LARGE", count: 0, price: undefined },
      ],
      priceBasis: "每4小时",
      unparsedLines: [],
    });
  });

  it("상세위치가 없고 크기가 둘뿐인 문구도 있는 만큼 읽는다", () => {
    const info = parseLockerDetailInfo(
      "- 보관함 개수: 중형 9개 / 소형 36개\n- 이용요금: 중형 3,000원 / 소형 2,000원 (4시간 당)",
    );

    expect(info).toEqual({
      location: undefined,
      sizes: [
        { size: "SMALL", count: 36, price: 2000 },
        { size: "MEDIUM", count: 9, price: 3000 },
      ],
      priceBasis: "4시간 당",
      unparsedLines: [],
    });
  });

  it("모르는 줄이나 크기를 읽지 못한 줄은 원문으로 남긴다", () => {
    const info = parseLockerDetailInfo(
      "- 상세위치: 대합실\n- 보관함 개수: 소형 36개 / 특대형 2개\n- 비고: 주말엔 조기 마감",
    );

    expect(info).toEqual({
      location: "대합실",
      sizes: [],
      priceBasis: undefined,
      unparsedLines: [
        "보관함 개수: 소형 36개 / 특대형 2개",
        "비고: 주말엔 조기 마감",
      ],
    });
  });

  it("읽을 것이 하나도 없으면 null 을 돌려 원문을 그대로 쓰게 한다", () => {
    expect(parseLockerDetailInfo(undefined)).toBeNull();
    expect(parseLockerDetailInfo("  ")).toBeNull();
    expect(
      parseLockerDetailInfo("11번 출구 쪽 개찰구 밖, 화장실 맞은편에 있어요."),
    ).toBeNull();
  });
});
