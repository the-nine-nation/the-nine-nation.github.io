import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { SiteHeader } from "../../components/SiteHeader";
import { ensureUser, listUserReports } from "../../lib/data";

export const dynamic = "force-dynamic";

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  const profile = await ensureUser(user.email, user.displayName);
  const reports = await listUserReports(user.email);

  return (
    <main className="app-page dashboard-page">
      <SiteHeader user={user} role={profile.role} />
      <section className="dashboard-hero">
        <div><p className="eyebrow">MY HUMAN MANUALS</p><h1>{user.displayName.split(" ")[0]}，你的历代版本都在这里。</h1><p>人会更新，说明书也应该允许打补丁。</p></div>
        <Link href="/journey" className="primary-button">重新检查哪根筋 <span>↗</span></Link>
      </section>

      <section className="dashboard-layout">
        <aside className="profile-card">
          <div className="profile-avatar">{user.displayName.slice(0, 1).toUpperCase()}</div>
          <p>人类样本档案</p><h2>{user.displayName}</h2><span>{user.email}</span>
          <div className="profile-stats"><div><b>{reports.length}</b><small>说明书版本</small></div><div><b>{profile.role === "admin" ? "观察员" : "活人"}</b><small>当前身份</small></div></div>
          {profile.role === "admin" ? <Link href="/admin" className="ghost-button">进入人类观察室</Link> : null}
        </aside>

        <div className="history-panel">
          <div className="panel-title"><div><p className="eyebrow">VERSION HISTORY</p><h2>我的说明书版本</h2></div><span>{reports.length} 份报告</span></div>
          {reports.length ? (
            <div className="history-list">
              {reports.map((report, index) => (
                <Link href={`/report/${report.id}`} className="history-card" key={report.id}>
                  <span className="history-index">{String(reports.length - index).padStart(2, "0")}</span>
                  <div className="history-type">{report.mbti}</div>
                  <div><h3>{report.archetype}</h3><p>第 {report.completedRound} 轮 · {report.answeredCount} 题 · MBTI / Big Five / 价值 / 关系</p></div>
                  <time>{prettyDate(report.createdAt)}</time><b>↗</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state"><span>※</span><h3>还没有任何使用记录</h3><p>先完成第一轮 10 题，就能拿到一份初步说明书；不必一次答完全部 45 题。</p><Link href="/journey" className="primary-button">开始扫描</Link></div>
          )}
        </div>
      </section>
    </main>
  );
}
