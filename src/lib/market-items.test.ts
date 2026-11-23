import { describe, expect, it } from "vitest";
import { get24HourChangePercent, getSevenDayTrend, parseMarketItems, type MarketItem } from "./market-items";

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

describe("seven-day trend", () => {
  function trend(prices: (number | string | null)[]) {
    return getSevenDayTrend({ name: "Test", usual: 999, history: prices.map((usual) => ({ usual })) });
  }

  it("uses only the final seven entries with the most recent price last", () => {
    expect(trend([900, 800, "100", 110, 105, 120, 115, 130, "125"])).toEqual({
      prices: [100, 110, 105, 120, 115, 130, 125],
      change: 25,
    });
  });

  it.each([
    { prices: [100, 90, 80, 90, 85, 80, 75], expected: -25 },
    { prices: [100, 100, 100, 100, 100, 100, 100], expected: 0 },
    { prices: [100, 90, 80, 70, 60, 50, 0], expected: -100 },
  ])("calculates a signed change of $expected", ({ prices, expected }) => {
    expect(trend(prices).change).toBe(expected);
  });

  it("keeps missing or invalid days as gaps without shifting the time window", () => {
    expect(trend([100, null, "unknown", -1, "", 110, 125])).toEqual({
      prices: [100, null, null, null, null, 110, 125],
      change: 25,
    });
  });

  it("leaves unavailable changes undefined for short history or unusable endpoints", () => {
    expect(getSevenDayTrend({ name: "Test", usual: 100 })).toEqual({ prices: [], change: null });
    expect(trend([100, 125]).change).toBeNull();
    expect(trend([0, 100, 100, 100, 100, 100, 125]).change).toBeNull();
    expect(trend([100, 100, 100, 100, 100, 100, null]).change).toBeNull();
  });
});
