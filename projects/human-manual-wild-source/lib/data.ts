import { env } from "cloudflare:workers";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { reports, users } from "../db/schema";

export async function ensureSchema() {
  const d1 = env.DB;
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      assessment_key TEXT NOT NULL,
      mbti TEXT NOT NULL,
      archetype TEXT NOT NULL,
      completed_round INTEGER NOT NULL DEFAULT 1,
      answered_count INTEGER NOT NULL DEFAULT 10,
      answers_json TEXT NOT NULL,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS reports_user_email_idx ON reports (user_email)"),
    d1.prepare("CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at)"),
  ]);
  const columns = await d1.prepare("PRAGMA table_info(reports)").all<{ name: string }>();
  const names = new Set(columns.results.map((column: { name: string }) => column.name));
  if (!names.has("completed_round")) await d1.prepare("ALTER TABLE reports ADD COLUMN completed_round INTEGER NOT NULL DEFAULT 1").run();
  if (!names.has("answered_count")) await d1.prepare("ALTER TABLE reports ADD COLUMN answered_count INTEGER NOT NULL DEFAULT 10").run();
}

export async function ensureUser(email: string, displayName: string) {
  await ensureSchema();
  const db = getDb();
  const configured = ((env as unknown as { ADMIN_EMAILS?: string }).ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    const role = configured.includes(email.toLowerCase()) ? "admin" : existing.role;
    await db.update(users).set({ displayName, role, lastSeenAt: new Date().toISOString() }).where(eq(users.email, email));
    return { ...existing, displayName, role };
  }

  const [total] = await db.select({ value: count() }).from(users);
  const role = total.value === 0 || configured.includes(email.toLowerCase()) ? "admin" : "user";
  const [created] = await db.insert(users).values({ email, displayName, role }).returning();
  return created;
}

export async function listUserReports(email: string) {
  await ensureSchema();
  return getDb().select().from(reports).where(eq(reports.userEmail, email)).orderBy(desc(reports.createdAt)).limit(24);
}

export async function getUserReport(id: string, email: string, isAdmin = false) {
  await ensureSchema();
  const condition = isAdmin ? eq(reports.id, id) : and(eq(reports.id, id), eq(reports.userEmail, email));
  const [report] = await getDb().select().from(reports).where(condition).limit(1);
  return report ?? null;
}

export async function getAdminOverview() {
  await ensureSchema();
  const db = getDb();
  const [userTotal] = await db.select({ value: count() }).from(users);
  const [reportTotal] = await db.select({ value: count() }).from(reports);
  const recent = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(20);
  const people = await db.select().from(users).orderBy(desc(users.lastSeenAt)).limit(20);
  return { userTotal: userTotal.value, reportTotal: reportTotal.value, recent, people };
}
