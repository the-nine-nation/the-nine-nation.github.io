import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    assessmentKey: text("assessment_key").notNull(),
    mbti: text("mbti").notNull(),
    archetype: text("archetype").notNull(),
    completedRound: integer("completed_round").notNull().default(1),
    answeredCount: integer("answered_count").notNull().default(10),
    answersJson: text("answers_json").notNull(),
    reportJson: text("report_json").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("reports_user_email_idx").on(table.userEmail),
    index("reports_created_at_idx").on(table.createdAt),
  ],
);
