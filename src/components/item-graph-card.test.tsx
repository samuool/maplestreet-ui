import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ItemGraphCard from "./item-graph-card";

describe("ItemGraphCard", () => {
  it("selects exactly one time window and plots only the latest days", () => {
    render(<ItemGraphCard item={{
      name: "Potion", usual: 140, low_7d: 100, high_7d: 140,
      history: Array.from({ length: 40 }, (_, index) => ({ usual: 101 + index })),
    }} />);
    const graph = screen.getByRole("img", { name: "Potion price history" });
    const all = screen.getByRole("radio", { name: "all" });
    const thirtyDays = screen.getByRole("radio", { name: "30d" });
    const sevenDays = screen.getByRole("radio", { name: "7d" });
    expect(all).toHaveAttribute("aria-checked", "true");
    expect(graph.querySelectorAll("circle")).toHaveLength(40);

    fireEvent.click(thirtyDays);
    expect(thirtyDays).toHaveAttribute("aria-checked", "true");
    expect(all).toHaveAttribute("aria-checked", "false");
    expect(graph.querySelectorAll("circle")).toHaveLength(30);
    expect(graph.querySelector("circle")).toHaveAttribute("aria-label", expect.stringContaining(": 111"));
    expect(screen.getByText("29 days ago")).toBeInTheDocument();

    fireEvent.click(sevenDays);
    expect(sevenDays).toHaveAttribute("aria-checked", "true");
    expect(thirtyDays).toHaveAttribute("aria-checked", "false");
    expect(graph.querySelectorAll("circle")).toHaveLength(7);
    expect(screen.getByText("6 days ago")).toBeInTheDocument();
    expect(graph.querySelector("circle")).toHaveAttribute("cx", "72");
    expect(graph.querySelectorAll("circle")[6]).toHaveAttribute("cx", "620");

    fireEvent.click(sevenDays);
    expect(sevenDays).toHaveAttribute("aria-checked", "true");
    fireEvent.click(all);
    expect(all).toHaveAttribute("aria-checked", "true");
    expect(graph.querySelectorAll("circle")).toHaveLength(40);
  });

  it("preserves missing days in a selected window and handles insufficient recent history", () => {
    render(<ItemGraphCard item={{
      name: "Potion", usual: 100, low_7d: 100, high_7d: 100,
      history: Array.from({ length: 10 }, (_, index) => ({ usual: index < 4 ? 100 : null })),
    }} />);
    fireEvent.click(screen.getByRole("radio", { name: "30d" }));
    expect(screen.getByText("9 days ago")).toBeInTheDocument();
    expect(screen.getByRole("img").querySelectorAll("circle")).toHaveLength(4);
    fireEvent.click(screen.getByRole("radio", { name: "7d" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not enough price history");
    fireEvent.click(screen.getByRole("radio", { name: "all" }));
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows the point's calendar date and full value on keyboard focus", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12));
    try {
      render(<ItemGraphCard item={{
        name: "Potion", usual: 1234567, low_7d: 100, high_7d: 1234567,
        history: [{ usual: 100 }, { usual: null }, { usual: 1234567 }],
      }} />);
      const firstPoint = screen.getByLabelText("Dec 30, 2025: 100");
      fireEvent.focus(firstPoint);
      expect(screen.getByRole("tooltip")).toHaveTextContent("Dec 30, 2025");
      expect(screen.getByRole("tooltip")).toHaveTextContent("Value: 100");
      fireEvent.blur(firstPoint);
      const lastPoint = screen.getByLabelText("Jan 1, 2026: 1,234,567");
      fireEvent.focus(lastPoint);
      expect(screen.getByRole("tooltip")).toHaveTextContent("Value: 1,234,567");
      fireEvent.keyDown(lastPoint, { key: "Escape" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("plots the full history in chronological order and leaves gaps for missing days", () => {
    render(<ItemGraphCard item={{
      name: "Maple shield",
      usual: 999, low_7d: 100, high_7d: 130,
      history: [100, 110, null, "130", 125].map((usual) => ({ usual })),
    }} />);

    const graph = screen.getByRole("img", { name: "Maple shield price history" });
    expect(graph.querySelectorAll("path.fill-none")).toHaveLength(2);
    expect(graph.querySelectorAll("circle")).toHaveLength(4);
    expect(graph.querySelector("circle")).toHaveAttribute("cx", "72");
    expect(graph.querySelectorAll("circle")[3]).toHaveAttribute("cx", "620");
    expect(screen.getByText("4 days ago")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("renders flat prices without invalid coordinates", () => {
    render(<ItemGraphCard item={{ name: "Potion", usual: 100, low_7d: 100, high_7d: 100, history: [{ usual: 100 }, { usual: 100 }] }} />);
    const graph = screen.getByRole("img", { name: "Potion price history" });
    expect(graph.innerHTML).not.toMatch(/NaN|Infinity/);
    const points = graph.querySelectorAll("circle");
    expect(points[0].getAttribute("cy")).toBe(points[1].getAttribute("cy"));
  });

  it("shows an empty state when fewer than two valid prices are available", () => {
    render(<ItemGraphCard item={{ name: "Potion", usual: 100, low_7d: 100, high_7d: 100, history: [{ usual: "unknown" }, { usual: 100 }] }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Not enough price history");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
