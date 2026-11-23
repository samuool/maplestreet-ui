"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Sparkline } from "@/components/ui/sparkline";
import { get24HourChangePercent, getSevenDayTrend, parseMarketItems, type MarketItem } from "@/lib/market-items";

const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 });
const changeFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const columns: DataTableColumn<MarketItem>[] = [
  {
    id: "name",
    header: "Name",
    sortValue: (item) => item.name,
    filterValue: (item) => item.name,
    filterLabel: "Search item names",
    cell: (item) => (
      <span className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center">
          {item.game_id !== undefined && (
            <Image
              src={`/api/items/${item.game_id}/icon`}
              alt=""
              width={32}
              height={32}
              unoptimized
              loading="lazy"
              className="size-8 object-contain"
              onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
            />
          )}
        </span>
        <span>{item.name}</span>
      </span>
    ),
  },
  {
    id: "usual",
    header: "Price",
    sortValue: (item) => Number(item.usual),
    align: "right",
    cell: (item) => typeof item.usual === "number" ? priceFormat.format(item.usual) : item.usual,
  },
  {
    id: "24h",
    header: "24h",
    sortValue: get24HourChangePercent,
    align: "right",
    cell: (item) => {
      const change = get24HourChangePercent(item);
      if (change === null) {
        return <span className="text-secondary/60" aria-label="24-hour change unavailable">—</span>;
      }

      return (
        <span className={change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-secondary/70"}>
          {changeFormat.format(change)}%
        </span>
      );
    },
  },
  {
    id: "7d",
    header: "Trend (7d)",
    sortValue: (item) => getSevenDayTrend(item).change,
    align: "right",
    cell: (item) => {
      const { prices, change } = getSevenDayTrend(item);
      return (
        <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <Sparkline
            values={prices}
            label={`${item.name}: price history over the latest seven days, oldest to newest`}
            className={change !== null && change > 0 ? "text-green-400" : change !== null && change < 0 ? "text-red-400" : "text-tertiary"}
          />
          {change === null ? (
            <span className="text-secondary/60" aria-label="7-day change unavailable">—</span>
          ) : (
            <span className={`whitespace-nowrap ${change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-secondary"}`} aria-label={`7-day change ${changeFormat.format(change)}%`}>
              {changeFormat.format(change)}%
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: "listings",
    header: "Listings (7d)",
    sortValue: (item) => item.listings == null ? null : Number(item.listings),
    align: "right",
    cell: (item) => item.listings ?? "—",
  },
  {
    id: "sales",
    header: "Sales (7d)",
    sortValue: (item) => item.sales == null ? null : Number(item.sales),
    align: "right",
    cell: (item) =>  item.sales ?? "—",
  },
];

type MarketState =
  | { status: "loading" }
  | { status: "success"; items: MarketItem[] }
  | { status: "error" };

export default function MarketTable() {
  const [state, setState] = useState<MarketState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      try {
        const response = await fetch("/api/items", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Request failed.");
        const items = parseMarketItems(await response.json());
        if (!controller.signal.aborted) setState({ status: "success", items });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }

    void loadItems();
    return () => controller.abort();
  }, [attempt]);

  return (
    <DataTable
      className="h-[50rem] max-h-[80svh] [&_table]:min-w-[84rem] [&_tbody]:font-bold"
      label="Market prices"
      columns={columns}
      data={state.status === "success" ? state.items : []}
      loading={state.status === "loading"}
      error={state.status === "error" ? "Unable to load market prices. Please try again." : undefined}
      onRetry={() => {
        setState({ status: "loading" });
        setAttempt((value) => value + 1);
      }}
    />
  );
}
