import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketTable from "./market-table";

afterEach(() => vi.unstubAllGlobals());

const history = (latest: number) => Array.from({ length: 30 }, (_, index) => ({ usual: index === 29 ? latest : 100 }));

describe("market table sorting", () => {
  it.each([
    { column: "Name", ascending: ["Alpha", "Beta", "Delta", "Gamma"], descending: ["Gamma", "Delta", "Beta", "Alpha"] },
    { column: "Price", ascending: ["Beta", "Alpha", "Gamma", "Delta"], descending: ["Gamma", "Alpha", "Beta", "Delta"] },
    { column: "24h", ascending: ["Beta", "Alpha", "Gamma", "Delta"], descending: ["Gamma", "Alpha", "Beta", "Delta"] },
    { column: "Trend (7d)", ascending: ["Beta", "Gamma", "Alpha", "Delta"], descending: ["Alpha", "Gamma", "Beta", "Delta"] },
    { column: "Listings (7d)", ascending: ["Gamma", "Beta", "Alpha", "Delta"], descending: ["Alpha", "Beta", "Gamma", "Delta"] },
    { column: "Sales (7d)", ascending: ["Gamma", "Alpha", "Beta", "Delta"], descending: ["Beta", "Alpha", "Gamma", "Delta"] },
  ])("sorts $column in both directions", async ({ column, ascending, descending }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([
      { name: "Beta", usual: 2, listings: 2, sales: "10", history: history(80) },
      { name: "Alpha", usual: "10", listings: "10", sales: 2, history: history(110) },
      { name: "Gamma", usual: 100, listings: 0, sales: 0, history: history(100) },
      { name: "Delta", usual: "unknown" },
    ])));
    render(<MarketTable />);
    await screen.findByRole("cell", { name: "Alpha" });

    const rowNames = () => screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[0].textContent);
    const header = screen.getByRole("columnheader", { name: column });
    const ascendingButton = screen.getByRole("button", { name: `Sort ${column} ascending` });
    const descendingButton = screen.getByRole("button", { name: `Sort ${column} descending` });

    fireEvent.click(ascendingButton);
    expect(rowNames()).toEqual(ascending);
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(ascendingButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(descendingButton);
    expect(rowNames()).toEqual(descending);
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(descendingButton).toHaveAttribute("aria-pressed", "true");
    expect(ascendingButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Sort Name ascending" }));
    expect(rowNames()).toEqual(["Alpha", "Beta", "Delta", "Gamma"]);
    if (column !== "Name") expect(header).toHaveAttribute("aria-sort", "none");
  });
});
