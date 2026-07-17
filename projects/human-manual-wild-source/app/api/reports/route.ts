import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { buildReport, validateProgress, type AnswerRecord } from "../../../lib/assessment";
import { ensureSchema, ensureUser } from "../../../lib/data";
import { getDb } from "../../../db";
import { reports } from "../../../db/schema";
import { isParticipantGender, sanitizeNickname, type ParticipantProfile } from "../../../lib/profile";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录后保存报告" }, { status: 401 });

  let payload: { answers?: unknown; completedRound?: unknown; sessionId?: unknown; participant?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "请求内容不是有效的 JSON" }, { status: 400 });
  }
  const completedRound = Number(payload.completedRound) as 1 | 2 | 3;
  if (![1, 2, 3].includes(completedRound) || !Array.isArray(payload.answers)) {
    return Response.json({ error: "探索进度格式有误" }, { status: 400 });
  }
  const answers = payload.answers.map((item) => {
    const answer = item as Partial<AnswerRecord>;
    return {
      questionId: String(answer.questionId ?? ""),
      choice: Number(answer.choice),
      ...(answer.secondaryChoice === undefined ? {} : { secondaryChoice: Number(answer.secondaryChoice) }),
    };
  });
  if (!validateProgress(answers, completedRound)) {
    return Response.json({ error: "本轮答案不完整或题目序列无效" }, { status: 400 });
  }
  const sessionId = String(payload.sessionId ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    return Response.json({ error: "探索编号无效" }, { status: 400 });
  }
  let participant: ParticipantProfile;
  if (payload.participant && typeof payload.participant === "object") {
    const value = payload.participant as { nickname?: unknown; gender?: unknown };
    const nickname = sanitizeNickname(value.nickname);
    const gender = value.gender === undefined ? "undisclosed" : value.gender;
    if (!nickname || !isParticipantGender(gender)) {
      return Response.json({ error: "人物资料格式有误" }, { status: 400 });
    }
    participant = { nickname, gender };
  } else {
    participant = { nickname: sanitizeNickname(user.displayName) || "这位复杂生物", gender: "undisclosed" };
  }

  await ensureSchema();
  await ensureUser(user.email, user.displayName);
  const db = getDb();
  const [existing] = await db.select({ userEmail: reports.userEmail }).from(reports).where(eq(reports.id, sessionId)).limit(1);
  if (existing && existing.userEmail !== user.email) {
    return Response.json({ error: "无权更新此探索记录" }, { status: 403 });
  }

  const report = buildReport(answers, completedRound, participant);
  await db.insert(reports).values({
    id: sessionId,
    userEmail: user.email,
    assessmentKey: "human-manual-v3",
    mbti: report.mbti,
    archetype: report.archetype,
    completedRound,
    answeredCount: answers.length,
    answersJson: JSON.stringify(answers),
    reportJson: JSON.stringify(report),
  }).onConflictDoUpdate({
    target: reports.id,
    set: {
      assessmentKey: "human-manual-v3",
      mbti: report.mbti,
      archetype: report.archetype,
      completedRound,
      answeredCount: answers.length,
      answersJson: JSON.stringify(answers),
      reportJson: JSON.stringify(report),
      createdAt: new Date().toISOString(),
    },
  });
  return Response.json({ id: sessionId, completedRound }, { status: existing ? 200 : 201 });
}
