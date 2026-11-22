"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/brand-logo";
import { Card } from "@/components/ui/card";

const destinations = [
  { label: "market", href: "/" },
  { label: "portfolio", href: "/portfolio" },
];

// Replace the native menu primitives with shadcn/ui Navigation Menu when its
// dependencies can be installed. Keep native links for keyboard navigation.
export default function SiteNavigation() {
  const pathname = usePathname();

  return (
    <header className="mt-5 max-[30rem]:mt-3">
      <Card>
        <nav
          className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3 px-6 pt-2 pb-3 max-[30rem]:px-4"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="inline-flex shrink-0 -translate-y-[0.65rem] rounded-full no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
            aria-label="Maplestreet home"
          >
            <BrandLogo />
          </Link>
          <ul className="m-0 flex list-none items-center gap-2 p-0 max-[30rem]:w-full">
            {destinations.map(({ label, href }) => (
              <li key={href} className="max-[30rem]:flex-1">
                <Link
                  href={href}
                  className="group inline-flex min-h-11 items-center justify-center rounded-full px-5 py-[0.1rem] font-sans text-2xl font-bold text-secondary no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary max-[30rem]:w-full"
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <span className="relative after:absolute after:inset-x-0 after:-bottom-2 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-tertiary after:transition-transform after:duration-200 after:ease-out after:content-[''] group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100 group-aria-[current=page]:after:scale-x-100 motion-reduce:after:transition-none">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </header>
  );
}
