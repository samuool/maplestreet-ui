import { describe, expect, it } from "vitest";
import { get24HourChangePercent, parseMarketItems, type MarketItem } from "./market-items";

function itemWithHistory(current: number | string, previous: number | string): MarketItem {
  return {
    name: "Test item",
    usual: current,
    history: Array.from({ length: 30 }, (_, index) => ({ usual: index === 28 ? previous : 50 })),
  };
}

describe("24-hour price change", () => {
  it.each([
    { current: 125, previous: 100, expected: 25 },
    { current: 75, previous: 100, expected: -25 },
    { current: 100, previous: 100, expected: 0 },
    { current: 0, previous: 100, expected: -100 },
    { current: "125", previous: "100", expected: 25 },
  ])("compares $current with the 29th history price of $previous", ({ current, previous, expected }) => {
    expect(get24HourChangePercent(itemWithHistory(current, previous))).toBe(expected);
  });

  it("does not calculate a percentage against a zero or invalid price", () => {
    expect(get24HourChangePercent(itemWithHistory(100, 0))).toBeNull();
    expect(get24HourChangePercent(itemWithHistory(100, "unknown"))).toBeNull();
    expect(get24HourChangePercent(itemWithHistory("unknown", 100))).toBeNull();
  });

  it("handles absent or incomplete history", () => {
    expect(get24HourChangePercent({ name: "No history", usual: 100 })).toBeNull();
    expect(get24HourChangePercent({ name: "Short history", usual: 100, history: [{ usual: 50 }] })).toBeNull();
  });

  it("preserves history positions while removing unrelated fields", () => {
    const history = Array.from({ length: 29 }, (_, index) => index === 28
      ? { usual: 100, private: "secret" }
      : null);
    const [item] = parseMarketItems([{ name: "Test item", usual: 125, history, private: "secret" }]);

    expect(item.history).toHaveLength(29);
    expect(item.history?.[0]).toEqual({ usual: null });
    expect(item.history?.[28]).toEqual({ usual: 100 });
    expect(get24HourChangePercent(item)).toBe(25);
    expect(item).not.toHaveProperty("private");
  });
});
