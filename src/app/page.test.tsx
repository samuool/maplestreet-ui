import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

afterEach(() => vi.unstubAllGlobals());

describe("Home", () => {
  it("renders the market page and its table", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Market prices" })).toBeInTheDocument();
    expect(await screen.findByText("No items found.")).toBeInTheDocument();
  });
});
