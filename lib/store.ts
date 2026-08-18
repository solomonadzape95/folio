import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Store } from "./types";

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "folio.json");
const emptyStore: Store = { users: [], sessions: [], library: [] };

let writeQueue = Promise.resolve();

export async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as Store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(emptyStore);
    throw error;
  }
}

export async function updateStore<T>(mutate: (store: Store) => T | Promise<T>): Promise<T> {
  let result!: T;
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const store = await readStore();
    result = await mutate(store);
    await mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(store, null, 2), "utf8");
    await rename(temporaryFile, dataFile);
  });
  await writeQueue;
  return result;
}
