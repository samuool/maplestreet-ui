import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
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
                className={`flex items-center ${column.align === "right" ? "justify-end text-right" : "justify-start text-left"}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          role="rowgroup"
          tabIndex={0}
          className="block min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary"
        >
          {loading || error || data.length === 0 ? (
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
                  <p role="status">{loading ? "Loading market prices…" : "No items found."}</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
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
