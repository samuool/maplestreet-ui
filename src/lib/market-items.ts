export type MarketItem = {
  name: string;
  game_id?: number | string;
  usual: number | string;
  listings?: number | string;
  sales?: number | string;
  history?: { usual: number | string | null }[];
};

export function parseMarketItems(value: unknown): MarketItem[] {
  if (!Array.isArray(value)) throw new Error("Expected an item list.");

  return value.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Invalid item.");
    }

    const { name, usual, history, game_id } = item as Record<string, unknown>;
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

    const parsedItem: MarketItem = { name, usual };
    for (const field of ["listings", "sales"] as const) {
      const count = (item as Record<string, unknown>)[field];
      if (
        (typeof count === "number" && Number.isFinite(count) && count >= 0) ||
        (typeof count === "string" && count.trim() && Number.isFinite(Number(count)) && Number(count) >= 0)
      ) {
        parsedItem[field] = count;
      }
    }
    if (
      (typeof game_id === "number" && Number.isSafeInteger(game_id) && game_id >= 0) ||
      (typeof game_id === "string" && /^\d+$/.test(game_id))
    ) {
      parsedItem.game_id = game_id;
    }

    if (!Array.isArray(history)) return parsedItem;

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

    return { ...parsedItem, history: prices };
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

export function getSevenDayTrend(item: MarketItem): {
  prices: (number | null)[];
  change: number | null;
} {
  // The last history entry is today; keep missing days in their original positions.
  const prices = (item.history ?? []).slice(-7).map(({ usual }) => {
    if (usual === null || (typeof usual === "string" && !usual.trim())) return null;
    const price = Number(usual);
    return Number.isFinite(price) && price >= 0 ? price : null;
  });


  // Avoid null values for both first and last prices
  let first = prices[0];
  if(first === null){
    for(let i=0; i < 7; i++){
      first = prices[i]
      if(first != null){
        break
      }
    }
  }

  let last = prices[6];
  if(last === null){
    for(let i=6; i > -1; i--){
      last = prices[i]
      if(last != null){
        break
      }
    }
  }

  const change = prices.length === 7 && first != null && first > 0 && last != null
    ? ((last - first) / first) * 100
    : null;

  return { prices, change: change !== null && Number.isFinite(change) ? change : null };
}
