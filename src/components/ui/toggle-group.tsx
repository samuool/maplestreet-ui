"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { ComponentProps } from "react";

export function ToggleGroup({ className = "", ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={`inline-flex items-center gap-1 rounded-lg border border-secondary/20 bg-primary p-1 ${className}`.trim()}
      {...props}
    />
  );
}

export function ToggleGroupItem({ className = "", ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={`rounded-md px-3 py-2 text-sm font-bold text-secondary transition-colors hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary data-[state=on]:bg-tertiary data-[state=on]:text-primary ${className}`.trim()}
      {...props}
    />
  );
}
