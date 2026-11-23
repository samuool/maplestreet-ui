"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MarketItem } from "@/lib/market-items";

const priceFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const valueFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

type TimeWindow = "all" | "30d" | "7d";

function TimeWindowToggle({ value, onChange }: { value: TimeWindow; onChange: (value: TimeWindow) => void }) {
  return (
    <ToggleGroup
      type="single"
      aria-label="Price history time window"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === "all" || nextValue === "30d" || nextValue === "7d") onChange(nextValue);
      }}
    >
      <ToggleGroupItem value="all">all</ToggleGroupItem>
      <ToggleGroupItem value="30d">30d</ToggleGroupItem>
      <ToggleGroupItem value="7d">7d</ToggleGroupItem>
    </ToggleGroup>
  );
}

export default function ItemGraphCard({ item }: { item: MarketItem }) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const today = new Date();
  const history = item.history ?? [];
  const visibleHistory = timeWindow === "all" ? history : history.slice(timeWindow === "30d" ? -30 : -7);
  const prices = visibleHistory.map(({ usual }) => {
    if (usual === null || (typeof usual === "string" && !usual.trim())) return null;
    const price = Number(usual);
    return Number.isFinite(price) && price >= 0 ? price : null;
  });
  const valid = prices.filter((price): price is number => price !== null);
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 0;
  const padding = Math.max((max - min) * 0.1, max * 0.05, 1);
  const lower = Math.max(0, min - padding);
  const upper = max + padding;
  const segments: { line: string; startX: number; endX: number }[] = [];
  let line = "";
  let startX = 72;
  let endX = 72;
  prices.forEach((price, index) => {
    if (price === null) {
      if (line) segments.push({ line, startX, endX });
      line = "";
      return;
    }
    const x = 72 + (index / Math.max(prices.length - 1, 1)) * 548;
    const y = 264 - ((price - lower) / (upper - lower)) * 240;
    if (!line) startX = x;
    endX = x;
    line += `${line ? " L" : "M"}${x},${y}`;
  });
  if (line) segments.push({ line, startX, endX });

  return (
    <Card role="region" aria-label="Item price graph" className="flex h-full min-w-0 flex-col p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <div>
          <h3 className="text-lg font-bold">Price history</h3>
          <p className="mt-1 text-sm text-secondary/60">Daily prices, oldest to newest</p>
        </div>
        <div className="justify-self-center">
          <TimeWindowToggle value={timeWindow} onChange={setTimeWindow} />
        </div>
      </div>
      {valid.length < 2 ? (
        <div className="flex min-h-64 flex-1 items-center justify-center text-center text-sm text-secondary/60">
          <p role="status">Not enough price history to display a graph.</p>
        </div>
      ) : (
        <TooltipProvider delayDuration={100}>
          <svg role="img" aria-label={`${item.name} price history`} viewBox="0 0 640 320" className="mt-6 min-h-64 w-full flex-1">
            <desc>Daily prices from {prices.length - 1} days ago to today. Missing prices appear as gaps.</desc>
            <g aria-hidden="true" className="pointer-events-none fill-tertiary/15">
              {segments.map((segment, index) => (
                <path key={index} d={`${segment.line} L${segment.endX},264 L${segment.startX},264 Z`} />
              ))}
            </g>
            {[upper, (upper + lower) / 2, lower].map((price, index) => {
              const y = 24 + index * 120;
              return (
                <g key={index}>
                  <line x1={72} x2={620} y1={y} y2={y} className="stroke-secondary/15" />
                  <text x={60} y={y + 4} textAnchor="end" className="fill-secondary/60 text-xs">{priceFormat.format(price)}</text>
                </g>
              );
            })}
            {segments.map((segment, index) => (
              <path key={index} d={segment.line} className="fill-none stroke-tertiary" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            ))}
            {prices.map((price, index) => {
              if (price === null) return null;
              const date = new Date(today);
              date.setDate(date.getDate() - (prices.length - 1 - index));
              const dateLabel = dateFormat.format(date);
              const valueLabel = valueFormat.format(price);
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <circle
                      cx={72 + (index / (prices.length - 1)) * 548}
                      cy={264 - ((price - lower) / (upper - lower)) * 240}
                      r={4}
                      tabIndex={0}
                      aria-label={`${dateLabel}: ${valueLabel}`}
                      className="fill-tertiary stroke-transparent stroke-[12] outline-none hover:fill-secondary"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dateLabel}</p>
                    <p className="mt-1 font-bold">Value: {valueLabel}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <text x={72} y={296} className="fill-secondary/60 text-xs">{prices.length - 1} days ago</text>
            <text x={620} y={296} textAnchor="end" className="fill-secondary/60 text-xs">Today</text>
          </svg>
        </TooltipProvider>
      )}
    </Card>
  );
}
