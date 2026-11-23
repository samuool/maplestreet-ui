import type { ComponentProps } from "react";

// shadcn/ui Input primitive, adapted to the project's palette.
export function Input({ className = "", type, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={`flex h-9 w-full min-w-0 rounded-md border border-secondary/20 bg-primary px-3 py-1 text-sm font-normal text-secondary placeholder:text-secondary/50 focus-visible:border-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
