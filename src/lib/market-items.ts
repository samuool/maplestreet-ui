export type MarketItem = {
  name: string;
  usual: number | string;
  history?: { usual: number | string | null }[];
};

export function parseMarketItems(value: unknown): MarketItem[] {
  if (!Array.isArray(value)) throw new Error("Expected an item list.");

  return value.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Invalid item.");
    }

    const { name, usual, history } = item as Record<string, unknown>;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !(
        (typeof usual === "number" && Number.isFinite(usual)) ||
        (typeof usual === "string" && usual.trim())
      )
    ) {
      throw new Error("Invalid item fields.");
    }

    if (!Array.isArray(history)) return { name, usual };

    // Preserve each entry's position, even when a historical price is missing.
    const prices = history.map((entry: unknown) => {
      const price = typeof entry === "object" && entry !== null
        ? (entry as Record<string, unknown>).usual
        : null;
      return {
        usual: (typeof price === "number" && Number.isFinite(price)) ||
          (typeof price === "string" && price.trim()) ? price : null,
      };
    });

    return { name, usual, history: prices };
  });
}

export function get24HourChangePercent(item: MarketItem): number | null {
  const historical = item.history?.[28]?.usual;
  if (historical == null) return null;

  const current = Number(item.usual);
  const previous = Number(historical);
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0 || current < 0) {
    return null;
  }

  const change = ((current - previous) / previous) * 100;
  return Number.isFinite(change) ? change : null;
}
