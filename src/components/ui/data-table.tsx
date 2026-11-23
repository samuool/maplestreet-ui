"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<TData> = {
  id: string;
  header: string;
  cell: (row: TData) => ReactNode;
  align?: "left" | "right";
  sortValue?: (row: TData) => string | number | null | undefined;
  filterValue?: (row: TData) => string;
  filterLabel?: string;
};

type DataTableProps<TData> = {
  className?: string;
  label: string;
  columns: DataTableColumn<TData>[];
  data: TData[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};

export function DataTable<TData>({
  className = "",
  label,
  columns,
  data,
  loading = false,
  error,
  onRetry,
}: DataTableProps<TData>) {
  const [sort, setSort] = useState<{ column: string; direction: "ascending" | "descending" } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const rows = useMemo(() => {
    const column = columns.find((column) => column.id === sort?.column);
    const activeFilters = columns.filter((column) => column.filterValue && filters[column.id]?.trim());
    const sorted = data.map((row, index) => ({ row, index }))
      .filter(({ row }) => activeFilters.every((column) =>
        column.filterValue!(row).toLowerCase().includes(filters[column.id].trim().toLowerCase()),
      ))
      .map(({ row, index }) => ({ row, index, value: column?.sortValue?.(row) }));
    if (!sort || !column?.sortValue) return sorted;

    return sorted.sort((a, b) => {
      const left = a.value;
      const right = b.value;
      const leftMissing = left == null || (typeof left === "number" && !Number.isFinite(left));
      const rightMissing = right == null || (typeof right === "number" && !Number.isFinite(right));
      // Missing values stay at the bottom in either direction.
      if (leftMissing || rightMissing) return leftMissing === rightMissing ? a.index - b.index : leftMissing ? 1 : -1;
      const order = typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), "en", { numeric: true, sensitivity: "base" });
      return (sort.direction === "ascending" ? order : -order) || a.index - b.index;
    });
  }, [columns, data, sort, filters]);

  return (
    <Card className={`flex flex-col overflow-hidden py-2 ${className}`} aria-busy={loading}>
      <Table
        aria-label={label}
        role="table"
        className="flex h-full min-w-96 flex-col"
        containerClassName="min-h-0 flex-1"
      >
        <TableHeader
          role="rowgroup"
          className="block shrink-0 overflow-hidden [scrollbar-gutter:stable] [&_tr]:border-secondary"
        >
          <TableRow role="row" className="grid auto-cols-fr grid-flow-col hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                role="columnheader"
                scope="col"
                aria-label={column.header}
                aria-sort={column.sortValue ? sort?.column === column.id ? sort.direction : "none" : undefined}
                className={`flex h-auto min-h-12 flex-wrap content-start items-center py-3 ${column.align === "right" ? "justify-end text-right" : "justify-start text-left"}`}
              >
                <span>{column.header}</span>
                {column.sortValue && (
                  <span className="ml-2 inline-flex shrink-0 gap-0.5">
                    {(["ascending", "descending"] as const).map((direction) => (
                      <button
                        key={direction}
                        type="button"
                        aria-label={`Sort ${column.header} ${direction}`}
                        aria-pressed={sort?.column === column.id && sort.direction === direction}
                        onClick={() => setSort({ column: column.id, direction })}
                        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-secondary/60 transition-colors hover:bg-secondary/10 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary aria-pressed:bg-tertiary/15 aria-pressed:text-tertiary"
                      >
                        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d={direction === "ascending" ? "M4 10 8 6l4 4" : "m4 6 4 4 4-4"} />
                        </svg>
                      </button>
                    ))}
                  </span>
                )}
                {column.filterValue && (
                  <Input
                    type="search"
                    aria-label={column.filterLabel ?? `Search ${column.header.toLowerCase()}`}
                    placeholder="Search items…"
                    value={filters[column.id] ?? ""}
                    onChange={(event) => setFilters((current) => ({ ...current, [column.id]: event.target.value }))}
                    className="mt-2 basis-full"
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          role="rowgroup"
          tabIndex={0}
          className="block min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary"
        >
          {loading || error || rows.length === 0 ? (
            <TableRow role="row" className="grid auto-cols-fr grid-flow-col">
              <TableCell role="cell" colSpan={columns.length} className="flex min-h-32 items-center justify-center text-center">
                {error ? (
                  <div role="alert" className="space-y-4">
                    <p>{error}</p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="cursor-pointer rounded-full border border-tertiary px-5 py-2 font-bold text-tertiary transition-colors hover:bg-tertiary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                ) : (
                  <p role="status">{loading ? "Loading market prices…" : data.length === 0 ? "No items found." : "No matching items."}</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map(({ row, index }) => (
              <TableRow key={index} role="row" className="grid auto-cols-fr grid-flow-col">
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    role="cell"
                    className={`min-w-0 wrap-anywhere ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
