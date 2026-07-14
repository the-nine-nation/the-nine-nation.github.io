import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureUser, getUserReport } from "../../../lib/data";
import type { AssessmentReport } from "../../../lib/assessment";
import { ReportView } from "../../../components/ReportView";

export const dynamic = "force-dynamic";

export default async function SavedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireChatGPTUser(`/report/${id}`);
  const profile = await ensureUser(user.email, user.displayName);
  const saved = await getUserReport(id, user.email, profile.role === "admin");
  if (!saved) notFound();
  const report = JSON.parse(saved.reportJson) as AssessmentReport;
  return <main className="report-page"><ReportView report={report} saved /></main>;
}
