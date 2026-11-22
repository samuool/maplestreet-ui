import type { ComponentProps } from "react";

// shadcn/ui Table primitives, adapted to the project's palette and Card surface.
type TableProps = ComponentProps<"table"> & {
  containerClassName?: string;
};

export function Table({ className = "", containerClassName = "", ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={props["aria-label"] ? `${props["aria-label"]} scroll area` : "Scrollable table"}
      tabIndex={0}
      className={`relative w-full overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary ${containerClassName}`}
    >
      <table data-slot="table" className={`w-full caption-bottom text-sm ${className}`} {...props} />
    </div>
  );
}

export function TableHeader({ className = "", ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={`[&_tr]:border-b ${className}`} {...props} />;
}

export function TableBody({ className = "", ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
}

export function TableRow({ className = "", ...props }: ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={`border-b border-secondary/10 transition-colors hover:bg-secondary/5 ${className}`} {...props} />;
}

export function TableHead({ className = "", ...props }: ComponentProps<"th">) {
  return <th data-slot="table-head" className={`h-12 px-6 align-middle font-bold whitespace-nowrap text-tertiary ${className}`} {...props} />;
}

export function TableCell({ className = "", ...props }: ComponentProps<"td">) {
  return <td data-slot="table-cell" className={`px-6 py-4 align-middle ${className}`} {...props} />;
}
