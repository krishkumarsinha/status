import { describe, it, expect } from "vitest";

export const COLOR_HUNT_PALETTE = {
  softMint: "#E8F5E9",
  pastelSage: "#A5D6A7",
  vibrantLeaf: "#66BB6A",
  deepForest: "#1B5E20",
};

describe("Color Hunt Palette Integration TDD Tests", () => {
  it("should contain all 4 palette hex colors from Color Hunt #e8f5e9a5d6a766bb6a1b5e20", () => {
    expect(COLOR_HUNT_PALETTE.softMint.toUpperCase()).toBe("#E8F5E9");
    expect(COLOR_HUNT_PALETTE.pastelSage.toUpperCase()).toBe("#A5D6A7");
    expect(COLOR_HUNT_PALETTE.vibrantLeaf.toUpperCase()).toBe("#66BB6A");
    expect(COLOR_HUNT_PALETTE.deepForest.toUpperCase()).toBe("#1B5E20");
  });
});
