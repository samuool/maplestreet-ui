import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketTable from "./market-table";

afterEach(() => vi.unstubAllGlobals());

describe("MarketTable", () => {
  it("maps API names and usual prices into the table", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([
      { name: "Maple shield", usual: 12500 },
      { name: "Potion", usual: 0 },
    ]));
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketTable />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading market prices");
    expect(await screen.findByRole("cell", { name: "Maple shield" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Market prices" });
    expect(within(table).getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Price" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "12,500" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "0" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/items", expect.objectContaining({ cache: "no-store" }));
  });

  it("shows an empty state for a successful empty list", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    render(<MarketTable />);

    expect(await screen.findByText("No items found.")).toBeInTheDocument();
  });

  it("shows signed 24h percentages with gain, loss, and neutral colors", async () => {
    const history = Array.from({ length: 30 }, (_, index) => ({ usual: index === 28 ? 100 : 50 }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([
      { name: "Gaining", usual: 125, history },
      { name: "Losing", usual: 75, history },
      { name: "Unchanged", usual: 100, history },
      { name: "No history", usual: 125 },
    ])));
    render(<MarketTable />);

    expect(await screen.findByText("+25.00%")).toHaveClass("text-green-400");
    expect(screen.getByText("-25.00%")).toHaveClass("text-red-400");
    expect(screen.getByText("0.00%")).toHaveClass("text-secondary/70");
    expect(screen.getByRole("columnheader", { name: "24h" })).toBeInTheDocument();
    expect(screen.getByLabelText("24-hour change unavailable")).toHaveTextContent("—");
  });

  it("lets users retry a failed request", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(Response.json([{ name: "Recovered item", usual: "250" }]));
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketTable />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load market prices");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("cell", { name: "Recovered item" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "250" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
