import { getItemIcon } from "@/lib/item-icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;
  if (!/^\d+$/.test(gameId)) {
    return Response.json({ error: "Invalid item ID." }, { status: 400 });
  }

  try {
    const icon = await getItemIcon(gameId);
    return new Response(new Uint8Array(icon), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to load item icon." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
