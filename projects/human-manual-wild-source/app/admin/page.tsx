import Link from "next/link";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { SiteHeader } from "../../components/SiteHeader";
import { ensureUser, getAdminOverview } from "../../lib/data";

export const dynamic = "force-dynamic";

function shortDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const profile = await ensureUser(user.email, user.displayName);
  if (profile.role !== "admin") redirect("/dashboard");
  const data = await getAdminOverview();
  const distribution = data.recent.reduce<Record<string, number>>((acc, report) => {
    acc[report.mbti] = (acc[report.mbti] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="app-page admin-page">
      <SiteHeader user={user} role={profile.role} />
      <section className="admin-heading"><div><p className="eyebrow">HUMAN OBSERVATION ROOM</p><h1>人类观察室</h1><p>查看参与者、探索深度、报告完成情况与近期类型分布。</p></div><span className="admin-badge">仅管理员可见</span></section>
      <section className="metric-grid">
        <article><span>活人样本</span><b>{data.userTotal}</b><i>PEOPLE</i></article>
        <article><span>生成报告</span><b>{data.reportTotal}</b><i>REPORTS</i></article>
        <article><span>人均说明书</span><b>{data.userTotal ? (data.reportTotal / data.userTotal).toFixed(1) : "0"}</b><i>AVG.</i></article>
        <article><span>近期类型</span><b>{Object.keys(distribution).length}</b><i>TYPES</i></article>
      </section>
      <section className="admin-grid">
        <article className="admin-panel">
          <div className="panel-title"><div><p className="eyebrow">RECENT REPORTS</p><h2>最近生成</h2></div><span>{data.recent.length} 条</span></div>
          <div className="admin-table">
            {data.recent.map((report) => (
              <Link href={`/report/${report.id}`} key={report.id}><span className="tiny-type">{report.mbti}</span><div><b>{report.archetype} · 第 {report.completedRound} 轮</b><small>{report.userEmail} · {report.answeredCount} 题</small></div><time>{shortDate(report.createdAt)}</time><em>↗</em></Link>
            ))}
            {!data.recent.length ? <p className="table-empty">还没有报告，等待第一位探索者起航。</p> : null}
          </div>
        </article>
        <aside className="admin-side">
          <article className="admin-panel distribution-panel"><div className="panel-title"><div><p className="eyebrow">TYPE SIGNALS</p><h2>近期类型信号</h2></div></div><div className="type-cloud">{Object.entries(distribution).sort((a,b)=>b[1]-a[1]).map(([type,total])=><span key={type}><b>{type}</b><small>{total}</small></span>)}{!Object.keys(distribution).length ? <p>暂无数据</p> : null}</div></article>
          <article className="admin-panel people-panel"><div className="panel-title"><div><p className="eyebrow">CREW</p><h2>最近活跃</h2></div></div>{data.people.slice(0,6).map((person)=><div className="person-row" key={person.email}><span>{person.displayName.slice(0,1)}</span><div><b>{person.displayName}</b><small>{person.role === "admin" ? "管理员" : "探索者"}</small></div><time>{shortDate(person.lastSeenAt)}</time></div>)}</article>
        </aside>
      </section>
    </main>
  );
}
