import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const pendingIcons = new Map<string, Promise<Buffer>>();
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function getItemIcon(
  gameId: string,
  directory = path.join(process.cwd(), "assets", "items"),
): Promise<Buffer> {
  if (!/^\d+$/.test(gameId)) return Promise.reject(new Error("Invalid item ID."));

  const filename = path.join(directory, `${gameId}.png`);
  const pending = pendingIcons.get(filename);
  if (pending) return pending;

  const request = loadIcon(gameId, directory, filename).finally(() => {
    pendingIcons.delete(filename);
  });
  pendingIcons.set(filename, request);
  return request;
}

async function loadIcon(gameId: string, directory: string, filename: string): Promise<Buffer> {
  try {
    return await readFile(filename);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const response = await fetch(`https://maplestory.io/api/MCW/1/item/${gameId}/icon`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error("Unable to retireve item icon")
  }

  const icon = Buffer.from(await response.arrayBuffer());
  if (!icon.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error("Invalid item icon.");
  }

  await mkdir(directory, { recursive: true });
  // Publish the complete file atomically so other requests never read a partial icon.
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, icon);
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
  return icon;
}
