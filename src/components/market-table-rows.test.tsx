import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketTable from "./market-table";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("market row actions", () => {
  it("replaces the table with item information and returns using the back arrow", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([
      { id: "shield-id", game_id: 1092000, name: "Maple shield", usual: 20, listings: 0, sales: 1200 },
      { id: 42, name: "Potion", usual: 10 },
    ]));
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketTable />);

    const name = await screen.findByRole("cell", { name: "Maple shield" });
    fireEvent.click(name.closest("tr")!);
    const card = screen.getByRole("region", { name: "Item information" });
    expect(screen.queryByRole("table", { name: "Market prices" })).not.toBeInTheDocument();
    expect(within(card).getByRole("heading", { name: "Maple shield" })).toBeInTheDocument();
    const icon = within(card).getByRole("img", { name: "Maple shield" }) as HTMLImageElement;
    expect(new URL(icon.src, window.location.origin).pathname).toBe("/api/items/1092000/icon");
    expect(icon).toHaveAttribute("width", "128");
    const details = within(card).getByRole("table", { name: "Item details" });
    expect(within(details).getByRole("cell", { name: "shield-id" })).toBeInTheDocument();
    expect(within(details).getByRole("cell", { name: "20" })).toBeInTheDocument();
    expect(within(details).getByRole("cell", { name: "0" })).toBeInTheDocument();
    expect(within(details).getByRole("cell", { name: "1,200" })).toBeInTheDocument();
    expect(within(card).getAllByRole("button")).toHaveLength(1);
    const back = within(card).getByRole("button", { name: "Back to market table" });
    expect(back).toHaveFocus();
    fireEvent.click(back);
    expect(screen.queryByRole("region", { name: "Item information" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Market prices" })).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Potion" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    const potionCard = screen.getByRole("region", { name: "Item information" });
    expect(within(potionCard).getByRole("heading", { name: "Potion" })).toBeInTheDocument();
    expect(within(potionCard).queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Market prices" })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retains sorting and search when returning without opening a card from header actions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([
      { id: "shield-id", name: "Maple shield", usual: 20 },
      { id: "sword-id", name: "Maple sword", usual: 10 },
    ])));
    render(<MarketTable />);
    await screen.findByRole("cell", { name: "Maple shield" });

    fireEvent.click(screen.getByRole("button", { name: "Sort Price ascending" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search item names" }), { target: { value: "sword" } });
    expect(screen.queryByRole("region", { name: "Item information" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("cell", { name: "10" }));
    expect(screen.getByRole("region", { name: "Item information" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to market table" }));
    expect(screen.getByRole("searchbox", { name: "Search item names" })).toHaveValue("sword");
    expect(screen.getByRole("columnheader", { name: "Price" })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("cell", { name: "Maple sword" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Maple shield" })).not.toBeInTheDocument();
  });
});
