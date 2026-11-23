import type { ComponentProps } from "react";

// shadcn/ui Button primitive, adapted to the project's palette.
export function Button({ className = "", type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      data-slot="button"
      type={type}
      className={`inline-flex h-10 shrink-0 px-8 border-double border-5 cursor-pointer items-center justify-center rounded-full border-primary bg-tertiary px-5 text-sm font-bold text-primary shadow-acrylic transition-colors hover:border-secondary hover:bg-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-50 ${className}`.trim()}
      {...props}
    />
  );
}
