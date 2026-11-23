"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className = "", sideOffset = 8, ...props }: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={`z-50 rounded-md border border-tertiary/35 bg-primary px-3 py-2 font-sans text-xs text-secondary shadow-acrylic ${className}`.trim()}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
