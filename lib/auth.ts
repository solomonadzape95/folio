import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { readStore, updateStore } from "./store";
import type { User } from "./types";

const scrypt = promisify(scryptCallback);
const cookieName = "folio_session";
const sessionLength = 1000 * 60 * 60 * 24 * 30;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function passwordMatches(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function register(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254) throw new Error("Email address is too long.");
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (password.length > 128) throw new Error("Password must be 128 characters or fewer.");

  const passwordHash = await hashPassword(password);
  return updateStore((store) => {
    if (store.users.some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with that email already exists.");
    }
    const user: User = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
  });
}

export async function authenticate(email: string, password: string) {
  if (email.length > 254 || password.length > 128) return null;
  const store = await readStore();
  const user = store.users.find((candidate) => candidate.email === email.trim().toLowerCase());
  if (!user || !(await passwordMatches(password, user.passwordHash))) return null;
  return user;
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLength);
  await updateStore((store) => {
    store.sessions = store.sessions.filter((session) => Date.parse(session.expiresAt) > Date.now());
    store.sessions.push({ userId, tokenHash: tokenHash(token), expiresAt: expiresAt.toISOString() });
  });
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const store = await readStore();
  const session = store.sessions.find(
    (candidate) => candidate.tokenHash === tokenHash(token) && Date.parse(candidate.expiresAt) > Date.now(),
  );
  if (!session) return null;
  return store.users.find((user) => user.id === session.userId) ?? null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) {
    await updateStore((store) => {
      store.sessions = store.sessions.filter((session) => session.tokenHash !== tokenHash(token));
    });
  }
  jar.delete(cookieName);
}
