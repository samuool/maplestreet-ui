import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketTable from "./market-table";

afterEach(() => vi.unstubAllGlobals());

describe("MarketTable", () => {
  it("maps API names and usual prices into the table", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([
      { name: "Maple shield", usual: 12500, game_id: 1092000 },
      { name: "Potion", usual: 0 },
    ]));
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketTable />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading market prices");
    const nameCell = await screen.findByRole("cell", { name: "Maple shield" });
    expect(nameCell).toBeInTheDocument();
    const icon = nameCell.querySelector("img");
    expect(new URL(icon!.src, window.location.origin).pathname).toBe("/api/items/1092000/icon");
    expect(icon).toHaveAttribute("alt", "");
    fireEvent.error(icon!);
    expect(icon).toHaveStyle({ visibility: "hidden" });
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

  it("shows listing and sales counts, including zero and missing values", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([
      { name: "Listed item", usual: 100, listings: 1234, sales: "5678" },
      { name: "No sales", usual: 100, listings: 0, sales: 0 },
      { name: "Missing counts", usual: 100 },
    ])));
    render(<MarketTable />);

    const listed = (await screen.findByRole("cell", { name: "Listed item" })).closest("tr")!;
    expect(screen.getByRole("columnheader", { name: "Listings" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Sales" })).toBeInTheDocument();
    expect(within(listed).getAllByRole("cell").slice(-2).map((cell) => cell.textContent)).toEqual(["1,234", "5678"]);
    const zero = screen.getByRole("cell", { name: "No sales" }).closest("tr")!;
    expect(within(zero).getAllByRole("cell").slice(-2).map((cell) => cell.textContent)).toEqual(["0", "0"]);
    const missing = screen.getByRole("cell", { name: "Missing counts" }).closest("tr")!;
    expect(within(missing).getAllByRole("cell").slice(-2).map((cell) => cell.textContent)).toEqual(["—", "—"]);
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
    const unchangedRow = screen.getByRole("cell", { name: "Unchanged" }).closest("tr")!;
    expect(within(unchangedRow).getAllByText("0.00%").some((node) => node.classList.contains("text-secondary/70"))).toBe(true);
    expect(screen.getByRole("columnheader", { name: "24h" })).toBeInTheDocument();
    expect(screen.getByLabelText("24-hour change unavailable")).toHaveTextContent("—");
  });

  it("shows a seven-day area chart and history-based percentage, with unavailable short history", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([
      { name: "Trending", usual: 999, history: [500, 100, 110, 105, 120, 115, 130, 125].map((usual) => ({ usual })) },
      { name: "Short", usual: 100, history: [{ usual: 50 }] },
    ])));
    render(<MarketTable />);

    expect(await screen.findByLabelText("7-day change +25.00%")).toHaveTextContent("+25.00%");
    expect(screen.getByRole("columnheader", { name: "Trend (7d)" })).toBeInTheDocument();
    const chart = screen.getByRole("img", { name: /Trending: price history/ });
    expect(chart.querySelector("path.fill-current")).toHaveAttribute("d", expect.stringContaining("Z"));
    expect(chart.querySelector("path.stroke-current")).toBeInTheDocument();
    const shortRow = screen.getByRole("cell", { name: "Short" }).closest("tr")!;
    expect(within(shortRow).getByLabelText("7-day change unavailable")).toHaveTextContent("—");
    expect(within(shortRow).queryByRole("img")).not.toBeInTheDocument();
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
