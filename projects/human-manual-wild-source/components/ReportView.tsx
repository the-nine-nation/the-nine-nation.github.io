import Link from "next/link";
import type { ReactNode } from "react";
import type { AssessmentReport } from "../lib/assessment";
import { genderLabel } from "../lib/profile";
import { PrintButton } from "./PrintButton";

export function ReportView({ report, saved = false, checkpoint = false, actions, participantName }: { report: AssessmentReport; saved?: boolean; checkpoint?: boolean; actions?: ReactNode; participantName?: string }) {
  const completedRound = report.completedRound ?? 3;
  const answeredCount = report.answeredCount ?? 12;
  const confidence = report.confidence ?? 65;
  return (
    <div className="report-shell">
      <section className="report-hero">
        <div className="report-kicker"><span>{participantName ? `${participantName} · ` : ""}{checkpoint ? `第 ${completedRound} 轮阶段报告` : "已保存探索报告"}{report.participant && report.participant.gender !== "undisclosed" ? <i className="participant-gender">{genderLabel(report.participant.gender)}</i> : null}</span><span>{answeredCount} 道情境 · 可信度 {confidence}%</span></div>
        <div className="type-badge" aria-label={`MBTI 倾向 ${report.mbti}`}>{report.mbti}</div>
        <p className="eyebrow">MBTI 只是封面，不是整本说明书</p>
        <h1>{report.archetype}</h1>
        <p className="report-tagline">{report.tagline}</p>
        <div className="report-depth"><span>当前深度</span><b>{report.depthLabel ?? "综合探索"}</b><i><em style={{ width: `${confidence}%` }} /></i><small>{completedRound < 3 ? `继续探索会校准盲区，而不是简单重复加题。` : "已完成全部三轮；报告适合当作假设，而不是判决书。"}</small></div>
        <div className="report-actions no-print">
          {actions ?? <><Link href="/journey" className="primary-button">重新开一局</Link>{saved ? <PrintButton /> : <Link href="/dashboard" className="ghost-button">登录后保存报告</Link>}</>}
        </div>
      </section>

      <section className="report-grid">
        <article className="report-card axes-card">
          <div className="card-heading"><span>01</span><div><h2>MBTI 偏好坐标</h2><p>保留它，因为好用；限制它，因为人比四个字母麻烦。</p></div></div>
          <div className="axes-list">
            {report.axes.map((axis) => (
              <div className="axis-row" key={axis.code}>
                <div className="axis-label"><span>{axis.left}</span><b>{axis.code}</b><span>{axis.right}</span></div>
                <div className="axis-track"><i style={{ left: `${axis.value}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="report-card bigfive-card">
          <div className="card-heading"><span>02</span><div><h2>Big Five 特质光谱</h2><p>五种稳定倾向，观察你如何与世界互动。</p></div></div>
          <div className="trait-list">
            {report.bigFive.map((trait) => (
              <div className="trait-row" key={trait.label}>
                <div><b>{trait.label}</b><small>{trait.note}</small></div>
                <span>{trait.value}</span>
                <div className="trait-meter"><i style={{ width: `${trait.value}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="report-card attachment-card">
          <div className="card-heading"><span>03</span><div><h2>关系模式天气</h2><p>这不是定论，而是压力下更常出现的保护策略。</p></div></div>
          <div className="weather-orb"><span>{report.attachment.value}%</span></div>
          <h3>{report.attachment.label}</h3>
          <p>{report.attachment.note}</p>
        </article>

        {report.attraction ? (
          <article className="report-card attraction-card">
            <div className="card-heading"><span>04</span><div><h2>恋爱引力场</h2><p>不是配对玄学：看你容易被谁点亮，也看你向外释放什么信号。</p></div></div>
            <div className="attraction-status"><b>{report.attraction.evidenceLevel === "preview" ? "初步预览" : report.attraction.evidenceLevel === "calibrated" ? "已校准" : "深入画像"}</b><span>当前可信度 {report.attraction.confidence}%</span></div>
            <div className="magnet-grid">
              <section><small>你容易被谁点亮</small><h3>{report.attraction.drawnTo.headline}</h3><p>{report.attraction.drawnTo.summary}</p><div>{report.attraction.drawnTo.signals.map((signal) => <span key={signal.key}><b>{signal.label}</b><i>{signal.note}</i></span>)}</div></section>
              <section><small>谁更容易被你吸引</small><h3>{report.attraction.drawsIn.headline}</h3><p>{report.attraction.drawsIn.summary}</p><div>{report.attraction.drawsIn.signals.map((signal) => <span key={signal.key}><b>{signal.label}</b><i>{signal.note}</i></span>)}</div></section>
            </div>
            <div className="chemistry-grid"><div><span>心动</span><p>{report.attraction.spark}</p></div><div><span>久处</span><p>{report.attraction.lasting}</p></div></div>
            <div className="attraction-watchout"><b>关系提醒</b><p>{report.attraction.watchout}</p></div>
            <small className="attraction-evidence">{report.attraction.evidenceNote}</small>
          </article>
        ) : null}

        {report.values?.length ? (
          <article className="report-card values-card">
            <div className="card-heading"><span>05</span><div><h2>价值驱动器</h2><p>你真正愿意为之付出时间、风险与注意力的东西。</p></div></div>
            <div className="value-stack">
              {report.values.map((value, index) => (
                <div key={value.label} className={index < 2 ? "is-top" : ""}>
                  <span>{String(index + 1).padStart(2, "0")}</span><b>{value.label}</b><i><em style={{ width: `${value.value}%` }} /></i><small>{value.note}</small>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {report.regulation?.length ? (
          <article className="report-card regulation-card">
            <div className="card-heading"><span>06</span><div><h2>压力下的自动程序</h2><p>你不是“情绪稳定或不稳定”，你只是更常调用某些恢复策略。</p></div></div>
            <div className="regulation-grid">
              {report.regulation.map((item) => <div key={item.label}><b>{item.label}</b><strong>{item.value}</strong><p>{item.note}</p></div>)}
            </div>
          </article>
        ) : null}

        {report.resilience && report.boundaries ? (
          <article className="report-card dual-card">
            <div><span>恢复弹性</span><b>{report.resilience.value}</b><h3>{report.resilience.label}</h3><p>{report.resilience.note}</p></div>
            <div><span>边界清晰度</span><b>{report.boundaries.value}</b><h3>{report.boundaries.label}</h3><p>{report.boundaries.note}</p></div>
          </article>
        ) : null}

        {report.tensions?.length ? (
          <article className="report-card tensions-card">
            <div className="card-heading"><span>07</span><div><h2>你的“左右互搏”现场</h2><p>全面探索最有价值的地方，不是找最高分，而是看优势怎样彼此打架。</p></div></div>
            <div className="tension-list">{report.tensions.map((tension, index) => <div key={tension}><b>矛盾 {index + 1}</b><p>{tension}</p></div>)}</div>
          </article>
        ) : null}

        <article className="report-card strengths-card">
          <div className="card-heading"><span>08</span><div><h2>目前最稳的三条信号</h2><p>它们是值得验证的假设，不是刻在身份证背面的结论。</p></div></div>
          <ol>{report.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ol>
        </article>

        <article className="report-card experiment-card">
          <div className="experiment-copy">
            <span className="eyebrow">未来 7 天 · 微型实验</span>
            <h2>别急着“成为更好的人”<br />先多了解自己一点。</h2>
          </div>
          <div className="experiment-list">
            {report.experiments.map((experiment, index) => (
              <div key={experiment}><span>0{index + 1}</span><p>{experiment}</p></div>
            ))}
          </div>
        </article>

        {checkpoint && report.nextFocus?.length ? (
          <article className="report-card next-focus-card no-print">
            <div><p className="eyebrow">下一轮会怎么变</p><h2>{completedRound < 3 ? "不是继续审问，\n是换个角度校准。" : "题答完了，\n观察才刚开始。"}</h2></div>
            <ul>{report.nextFocus.map((focus) => <li key={focus}>{focus}</li>)}</ul>
          </article>
        ) : null}
      </section>

      <p className="report-disclaimer">本报告用于自我探索与交流，不构成医学诊断、心理治疗或专业咨询意见。它综合多种心理学框架做情境化推断，人的状态会随关系、环境与成长而变化。</p>
    </div>
  );
}
