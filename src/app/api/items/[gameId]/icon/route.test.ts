import { beforeEach, describe, expect, it, vi } from "vitest";
import { getItemIcon } from "@/lib/item-icons";
import { GET } from "./route";

vi.mock("@/lib/item-icons", () => ({ getItemIcon: vi.fn() }));

beforeEach(() => vi.resetAllMocks());

function request(gameId: string) {
  return GET(new Request("http://localhost/api/items/1092000/icon"), {
    params: Promise.resolve({ gameId }),
  });
}

describe("GET item icon", () => {
  it("serves icon bytes with PNG and browser cache headers", async () => {
    const icon = Buffer.from([137, 80, 78, 71]);
    vi.mocked(getItemIcon).mockResolvedValue(icon);

    const response = await request("1092000");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    expect(Buffer.from(await response.arrayBuffer())).toEqual(icon);
    expect(getItemIcon).toHaveBeenCalledWith("1092000");
  });

  it("rejects invalid IDs before loading icons", async () => {
    expect((await request("../secret")).status).toBe(400);
    expect(getItemIcon).not.toHaveBeenCalled();
  });

  it("returns uncached errors without internal details", async () => {
    vi.mocked(getItemIcon).mockRejectedValue(new Error("Private filesystem details"));

    const response = await request("1092000");

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Unable to load item icon." });
  });
});
