"use client";

import { useEffect, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { get24HourChangePercent, parseMarketItems, type MarketItem } from "@/lib/market-items";

const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 });
const changeFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const columns: DataTableColumn<MarketItem>[] = [
  { id: "name", header: "Name", cell: (item) => item.name },
  {
    id: "usual",
    header: "Price",
    align: "right",
    cell: (item) => typeof item.usual === "number" ? priceFormat.format(item.usual) : item.usual,
  },
  {
    id: "24h",
    header: "24h",
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
      className="h-[45rem] max-h-[80svh] [&_tbody]:font-bold"
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
