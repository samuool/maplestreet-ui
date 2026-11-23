import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketTable from "./market-table";

afterEach(() => vi.unstubAllGlobals());

async function renderMarket() {
  const fetchMock = vi.fn().mockResolvedValue(Response.json([
    { name: "Maple shield", usual: 20 },
    { name: "Potion", usual: 30 },
    { name: "Maple sword", usual: 10 },
  ]));
  vi.stubGlobal("fetch", fetchMock);
  render(<MarketTable />);
  await screen.findByRole("cell", { name: "Maple shield" });
  return fetchMock;
}

const rowNames = () => screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("market name search", () => {
  it("filters partial names ignoring case and surrounding spaces, and clears without refetching", async () => {
    const fetchMock = await renderMarket();
    const search = within(screen.getByRole("columnheader", { name: "Name" })).getByRole("searchbox", { name: "Search item names" });

    fireEvent.change(search, { target: { value: "  MAPLE  " } });
    expect(rowNames()).toEqual(["Maple shield", "Maple sword"]);
    fireEvent.change(search, { target: { value: "sword" } });
    expect(rowNames()).toEqual(["Maple sword"]);
    fireEvent.change(search, { target: { value: "" } });
    expect(rowNames()).toEqual(["Maple shield", "Potion", "Maple sword"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the active sort while filtering and restoring rows", async () => {
    await renderMarket();
    fireEvent.click(screen.getByRole("button", { name: "Sort Price ascending" }));
    const search = screen.getByRole("searchbox", { name: "Search item names" });

    fireEvent.change(search, { target: { value: "maple" } });
    expect(rowNames()).toEqual(["Maple sword", "Maple shield"]);
    fireEvent.click(screen.getByRole("button", { name: "Sort Price descending" }));
    expect(rowNames()).toEqual(["Maple shield", "Maple sword"]);
    fireEvent.change(search, { target: { value: "" } });
    expect(rowNames()).toEqual(["Potion", "Maple shield", "Maple sword"]);
  });

  it("shows a recoverable empty result and treats search text literally", async () => {
    await renderMarket();
    const search = screen.getByRole("searchbox", { name: "Search item names" });

    fireEvent.change(search, { target: { value: ".*" } });
    expect(screen.getByRole("status")).toHaveTextContent("No matching items.");
    expect(screen.queryByRole("cell", { name: "Maple shield" })).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "   " } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(rowNames()).toHaveLength(3);
  });
});
