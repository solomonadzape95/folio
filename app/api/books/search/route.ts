import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { CatalogueError, cleanQuery, searchCatalogue } from "@/lib/google-books";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    checkRateLimit("catalogue-search", user.id, { max: 60, windowMs: 60_000 });
    const query = cleanQuery(new URL(request.url).searchParams.get("q"));
    if (!query) return NextResponse.json({ books: [] });
    return NextResponse.json({ books: await searchCatalogue(query) });
  } catch (error) {
    const known = error instanceof CatalogueError;
    const throttled = error instanceof Error && error.message.startsWith("Too many");
    return NextResponse.json(
      { error: known || throttled ? (error as Error).message : "The catalogue is temporarily unavailable." },
      { status: known ? error.status : throttled ? 429 : 502 },
    );
  }
}
