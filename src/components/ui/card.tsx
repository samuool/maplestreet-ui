import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={`rounded-card border border-tertiary/35 bg-primary/40 text-secondary shadow-acrylic backdrop-blur-[16px] ${className}`.trim()}
      {...props}
    />
  );
}
