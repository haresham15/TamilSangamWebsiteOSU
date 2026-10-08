import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { DailyFaqCount } from "./contracts";

export interface RecordFaqEngagementInput {
  faqId: string;
  visitorHash: string;
  day: string;
  minuteBucket: string;
  nowMs: number;
}

export type RecordFaqEngagementResult = "recorded" | "duplicate" | "rate_limited";

/** Local-only SQLite store. The database path is gitignored and replaceable at the repository boundary. */
export class LocalFaqEngagementStore {
  private readonly database: DatabaseSync;

  constructor(databasePath = resolve(process.cwd(), "data", "faq-engagement.sqlite")) {
    mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS faq_daily_counts (
        faq_id TEXT NOT NULL,
        day TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
        PRIMARY KEY (faq_id, day)
      );
      CREATE TABLE IF NOT EXISTS faq_dedupe (
        visitor_hash TEXT NOT NULL,
        faq_id TEXT NOT NULL,
        day TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (visitor_hash, faq_id, day)
      );
      CREATE TABLE IF NOT EXISTS faq_rate_limit (
        visitor_hash TEXT NOT NULL,
        minute_bucket TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
        PRIMARY KEY (visitor_hash, minute_bucket)
      );
    `);
  }

  record(input: RecordFaqEngagementInput): RecordFaqEngagementResult {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      this.database.prepare("DELETE FROM faq_dedupe WHERE expires_at <= ?").run(input.nowMs);
      this.database.prepare("DELETE FROM faq_rate_limit WHERE minute_bucket < ?").run(input.minuteBucket);

      const duplicate = this.database
        .prepare("SELECT 1 AS present FROM faq_dedupe WHERE visitor_hash = ? AND faq_id = ? AND day = ?")
        .get(input.visitorHash, input.faqId, input.day) as { present?: number } | undefined;
      if (duplicate?.present) {
        this.database.exec("COMMIT");
        return "duplicate";
      }

      const rate = this.database
        .prepare("SELECT count FROM faq_rate_limit WHERE visitor_hash = ? AND minute_bucket = ?")
        .get(input.visitorHash, input.minuteBucket) as { count?: number } | undefined;
      if ((rate?.count ?? 0) >= 30) {
        this.database.exec("COMMIT");
        return "rate_limited";
      }

      this.database
        .prepare("INSERT INTO faq_rate_limit (visitor_hash, minute_bucket, count) VALUES (?, ?, 1) ON CONFLICT(visitor_hash, minute_bucket) DO UPDATE SET count = count + 1")
        .run(input.visitorHash, input.minuteBucket);
      this.database
        .prepare("INSERT INTO faq_dedupe (visitor_hash, faq_id, day, expires_at) VALUES (?, ?, ?, ?)")
        .run(input.visitorHash, input.faqId, input.day, input.nowMs + 86_400_000);
      this.database
        .prepare("INSERT INTO faq_daily_counts (faq_id, day, count) VALUES (?, ?, 1) ON CONFLICT(faq_id, day) DO UPDATE SET count = count + 1")
        .run(input.faqId, input.day);
      this.database.exec("COMMIT");
      return "recorded";
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  listDailyCounts(sinceDay: string): DailyFaqCount[] {
    return this.database
      .prepare("SELECT faq_id AS faqId, day, count FROM faq_daily_counts WHERE day >= ? ORDER BY day ASC")
      .all(sinceDay) as DailyFaqCount[];
  }

  close() {
    this.database.close();
  }
}

let store: LocalFaqEngagementStore | undefined;

export function getFaqEngagementStore() {
  store ??= new LocalFaqEngagementStore();
  return store;
}
