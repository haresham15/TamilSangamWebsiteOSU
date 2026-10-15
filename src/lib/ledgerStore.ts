import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

/** SQLite serializes ledger updates across Next.js workers; legacy JSON stays untouched. */
export class LedgerStore {
  private readonly database: DatabaseSync;
  private readonly select;
  private readonly write;

  constructor(private readonly directory: string) {
    mkdirSync(directory, { recursive: true });
    this.database = new DatabaseSync(join(directory, "sangam-ledgers.sqlite"));
    this.database.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
    this.database.exec("CREATE TABLE IF NOT EXISTS ledgers (name TEXT PRIMARY KEY, payload TEXT NOT NULL)");
    this.select = this.database.prepare("SELECT payload FROM ledgers WHERE name = ?");
    this.write = this.database.prepare("INSERT INTO ledgers (name, payload) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET payload = excluded.payload");
  }

  private load<T>(name: string, initial: () => T): T {
    const row = this.select.get(name) as { payload: string } | undefined;
    if (row) return JSON.parse(row.payload) as T;
    try {
      return JSON.parse(readFileSync(join(this.directory, name), "utf8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return initial();
    }
  }

  read<T>(name: string, initial: () => T): T {
    return this.load(name, initial);
  }

  update<T, R>(name: string, initial: () => T, mutate: (value: T) => R): R {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      const value = this.load(name, initial);
      const result = mutate(value);
      this.write.run(name, JSON.stringify(value));
      this.database.exec("COMMIT");
      return result;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  close() {
    this.database.close();
  }
}

let store: LedgerStore | undefined;
let storeDirectory = "";

export function getLedgerStore() {
  const directory = resolve(process.env.SANGAM_DATA_DIR || join(process.cwd(), "data"));
  if (!store || directory !== storeDirectory) {
    const nextStore = new LedgerStore(directory);
    store?.close();
    store = nextStore;
    storeDirectory = directory;
  }
  return store;
}
