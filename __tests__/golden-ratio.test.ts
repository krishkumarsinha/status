import { describe, it, expect } from "vitest";

const GOLDEN_RATIO = 1.61803398875;

export function getGoldenScale(base: number, step: number): number {
  return Number((base * Math.pow(GOLDEN_RATIO, step)).toFixed(3));
}

export function getGoldenGridSplit(totalWidthPercent: number = 100): { main: number; secondary: number } {
  // Main section = Total / Golden Ratio = 61.8%
  // Secondary section = Total - Main = 38.2%
  const main = Number((totalWidthPercent / GOLDEN_RATIO).toFixed(1));
  const secondary = Number((totalWidthPercent - main).toFixed(1));
  return { main, secondary };
}

describe("Golden Ratio Composition TDD Tests", () => {
  it("should calculate exact Golden Ratio typography scale steps", () => {
    const baseRem = 1.0;
    const step1 = getGoldenScale(baseRem, 1); // 1.618rem
    const step2 = getGoldenScale(baseRem, 2); // 2.618rem
    const step3 = getGoldenScale(baseRem, 3); // 4.236rem

    expect(step1).toBe(1.618);
    expect(step2).toBe(2.618);
    expect(step3).toBe(4.236);
  });

  it("should calculate 61.8% / 38.2% Golden Ratio page layout split", () => {
    const split = getGoldenGridSplit(100);
    expect(split.main).toBe(61.8);
    expect(split.secondary).toBe(38.2);
    expect(split.main + split.secondary).toBe(100);
  });
});
