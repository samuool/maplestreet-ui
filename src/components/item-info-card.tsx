"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import ItemGraphCard from "@/components/item-graph-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { get24HourChangePercent, getSevenDayTrend, type MarketItem } from "@/lib/market-items";

type ItemInfoCardProps = {
  item: MarketItem;
  onBack: () => void;
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 });
const percentFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

function formatValue(value: number | string | undefined) {
  return typeof value === "number" ? numberFormat.format(value) : value ?? "—";
}

function changeColor(value: number | null) {
  if (value === null) return "text-secondary/60";
  return value < 0 ? "text-red-400" : value > 0 ? "text-green-400" : "text-tertiary";
}

export default function ItemInfoCard({ item, onBack }: ItemInfoCardProps) {
  const backButton = useRef<HTMLButtonElement>(null);
  const dailyChange = get24HourChangePercent(item);
  const weeklyChange = getSevenDayTrend(item).change;
  const details = [
    ["Price", formatValue(item.usual)],
    ["24h change", dailyChange === null ? "—" : `${percentFormat.format(dailyChange)}%`, changeColor(dailyChange)],
    ["Trend (7d)", weeklyChange === null ? "—" : `${percentFormat.format(weeklyChange)}%`, changeColor(weeklyChange)],
    ["Listings (7d)", formatValue(item.listings)],
    ["Sales (7d)", formatValue(item.sales)],
    ["High (7d)", formatValue(item.high_7d)],
    ["Low (7d)", formatValue(item.low_7d)]
  ];

  useEffect(() => {
    backButton.current?.focus();
  }, []);

  return (
    <Card role="region" aria-label="Item information" className="h-full max-h-full min-h-0 w-full min-w-0 max-w-full flex p-6 gap-10">
      <div className="basis-1/3">
      <button
        ref={backButton}
        type="button"
        onClick={onBack}
        aria-label="Back to market table"
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10 hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 5-7 7 7 7M5 12h14" />
        </svg>
      </button>
      <div className="flex flex-col">
          <h2 className="text-left text-2xl font-bold wrap-anywhere sm:text-3xl">{item.name}</h2>
          {item.game_id !== undefined && (
            <div className="mt-8 flex justify-center">
              <Image
                key={item.game_id}
                src={`/api/items/${item.game_id}/icon`}
                alt={item.name}
                width={128}
                height={128}
                unoptimized
                className="size-32 object-contain [image-rendering:pixelated]"
                onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
              />
            </div>
          )}
          <Button className="mt-3 self-center">Trade</Button>
          <Table aria-label="Item details" className="mt-8">
            <TableBody>
              {details.map(([label, value, color = ""]) => (
                <TableRow key={label}>
                  <TableHead scope="row" className="px-3 text-left">{label}</TableHead>
                  <TableCell className={`px-3 text-right font-bold wrap-anywhere tabular-nums ${color}`}>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
      </div>
      <div className="grow">
      <ItemGraphCard item={item} />
      </div>
    </Card>
  );
}
