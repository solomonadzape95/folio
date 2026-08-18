import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { CatalogueError, getCatalogueBook, validVolumeId } from "@/lib/google-books";
import { readBoundedJson, RequestBodyError } from "@/lib/http";
import { addBook, removeBook, updateBookStatus } from "@/lib/library";
import { checkRateLimit } from "@/lib/rate-limit";
import { READING_STATUSES, type ReadingStatus } from "@/lib/types";

async function userOrResponse() {
  const user = await currentUser();
  return user ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const user = await userOrResponse();
  if (user instanceof NextResponse) return user;
  try {
    checkRateLimit("catalogue-volume", user.id, { max: 30, windowMs: 60_000 });
    const body = await readBoundedJson<{ googleId?: unknown; status?: ReadingStatus }>(request, 2_048);
    if (!validVolumeId(body.googleId)) return NextResponse.json({ error: "Invalid book." }, { status: 400 });
    const status = body.status && READING_STATUSES.includes(body.status) ? body.status : "want-to-read";
    const book = await getCatalogueBook(body.googleId);
    return NextResponse.json({ book: await addBook(user.id, book, status) });
  } catch (error) {
    const known = error instanceof CatalogueError;
    const bodyError = error instanceof RequestBodyError;
    const throttled = error instanceof Error && error.message.startsWith("Too many");
    return NextResponse.json(
      { error: known || bodyError || throttled ? (error as Error).message : "That book could not be saved." },
      { status: known ? error.status : throttled ? 429 : 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await userOrResponse();
  if (user instanceof NextResponse) return user;
  try {
    const body = await readBoundedJson<{ id?: string; status?: ReadingStatus }>(request, 2_048);
    if (!body.id || body.id.length > 64 || !body.status || !READING_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    return NextResponse.json({ book: await updateBookStatus(user.id, body.id, body.status) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof RequestBodyError ? error.message : "That shelf change could not be saved." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await userOrResponse();
  if (user instanceof NextResponse) return user;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing book id." }, { status: 400 });
  await removeBook(user.id, id);
  return NextResponse.json({ ok: true });
}
