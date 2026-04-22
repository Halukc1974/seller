import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_EVENTS = [
  "VIEW",
  "SEARCH",
  "PURCHASE",
  "WISHLIST_ADD",
  "WISHLIST_REMOVE",
] as const;

type EventType = (typeof VALID_EVENTS)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, productId, searchQuery, metadata } = body as {
      event: EventType;
      productId?: string;
      searchQuery?: string;
      metadata?: Record<string, unknown>;
    };

    if (!event || !VALID_EVENTS.includes(event)) {
      return Response.json(
        { error: `event must be one of: ${VALID_EVENTS.join(", ")}` },
        { status: 400 }
      );
    }

    // Optional auth — track anonymous views too (userId nullable)
    const session = await auth();
    const userId = session?.user?.id ?? null;

    await db.userEvent.create({
      data: {
        userId,
        productId: productId ?? null,
        event,
        searchQuery: searchQuery ?? null,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[events] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
