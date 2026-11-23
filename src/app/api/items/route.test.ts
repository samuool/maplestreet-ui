import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/items", () => {
  it("uses the configured API and returns market fields without private data", async () => {
    vi.stubEnv("MAPLESTREET_ITEMS_API", "localhost:4321/items?key=private");
    const history = Array.from({ length: 29 }, () => ({ usual: 1000, internal: "private" }));
    const fetchMock = vi.fn().mockResolvedValue(Response.json([
      { name: "Maple shield", usual: 1200, game_id: "1092000", history, internal: "private" },
      { id: "potion-id", name: "Potion", usual: 0, listings: 0, sales: "1500" },
    ]));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:4321/items?key=private"),
      expect.objectContaining({ cache: "no-store", headers: { Accept: "application/json" } }),
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual([
      { name: "Maple shield", usual: 1200, game_id: "1092000", history: history.map(({ usual }) => ({ usual })) },
      { id: "potion-id", name: "Potion", usual: 0, listings: 0, sales: "1500" },
    ]);
  });

  it("reports missing configuration without making a request", async () => {
    vi.stubEnv("MAPLESTREET_ITEMS_API", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect((await GET()).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { payload: { items: [] } },
    { payload: [{ name: "Missing price" }] },
    { payload: [{ name: "Wrong price", usual: {} }] },
  ])("rejects malformed API data", async ({ payload }) => {
    vi.stubEnv("MAPLESTREET_ITEMS_API", "https://example.com/items?key=private");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(payload)));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private");
  });

  it("does not expose upstream errors or connection details", async () => {
    vi.stubEnv("MAPLESTREET_ITEMS_API", "https://example.com/items?key=private");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private endpoint failed")));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Unable to load market prices. Please try again.",
    });
  });
});
