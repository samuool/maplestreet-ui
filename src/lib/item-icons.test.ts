import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getItemIcon } from "./item-icons";

const icon = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "maplestreet-icons-"));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await rm(directory, { recursive: true, force: true });
});

describe("item icon cache", () => {
  it("downloads into assets and serves subsequent requests from disk", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(icon));
    vi.stubGlobal("fetch", fetchMock);
    const cache = path.join(directory, "assets", "items");

    expect(await getItemIcon("1092000", cache)).toEqual(icon);
    expect(await readFile(path.join(cache, "1092000.png"))).toEqual(icon);
    expect(await getItemIcon("1092000", cache)).toEqual(icon);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://maplestory.io/api/MCW/CBT2/item/1092000/icon",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("uses an existing file without contacting the upstream server", async () => {
    await writeFile(path.join(directory, "1092000.png"), icon);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getItemIcon("1092000", directory)).toEqual(icon);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shares a download between simultaneous requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(icon));
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all([
      getItemIcon("1092000", directory),
      getItemIcon("1092000", directory),
    ]);

    expect(results).toEqual([icon, icon]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    () => new Response("Not found", { status: 404 }),
    () => new Response("Invalid image", { headers: { "Content-Type": "image/png" } }),
  ])("does not cache failed or invalid downloads and allows a retry", async (failure) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(failure())
      .mockResolvedValueOnce(new Response(icon));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getItemIcon("1092000", directory)).rejects.toThrow();
    await expect(readFile(path.join(directory, "1092000.png"))).rejects.toMatchObject({ code: "ENOENT" });
    expect(await getItemIcon("1092000", directory)).toEqual(icon);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects IDs containing path traversal", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getItemIcon("../secret", directory)).rejects.toThrow("Invalid item ID.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
