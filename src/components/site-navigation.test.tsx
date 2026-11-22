import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import SiteNavigation from "./site-navigation";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(cleanup);

describe("SiteNavigation", () => {
  it.each([
    ["/", "market", "portfolio"],
    ["/portfolio", "portfolio", "market"],
  ])("marks the current destination for %s", (pathname, current, other) => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    render(<SiteNavigation />);

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maplestreet home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "market" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "portfolio" })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("link", { name: current })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: other })).not.toHaveAttribute("aria-current");
  });
});
