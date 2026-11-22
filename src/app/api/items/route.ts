import { parseMarketItems } from "@/lib/market-items";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = process.env.MAPLESTREET_ITEMS_API?.trim();

  if (!configured) {
    return Response.json({ error: "Market data is not configured." }, { status: 503 });
  }

  try {
    // The configured local API address omits its HTTP scheme.
    const endpoint = new URL(
      /^https?:\/\//i.test(configured) ? configured : `http://${configured}`,
    );
    if (endpoint.protocol !== "http:" && endpoint.protocol !== "https:") {
      throw new Error("Unsupported API protocol.");
    }

    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error("Market API request failed.");

    const items = parseMarketItems(await response.json());
    return Response.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Do not expose the configured URL or upstream response to the browser.
    return Response.json(
      { error: "Unable to load market prices. Please try again." },
      { status: 502 },
    );
  }
}
