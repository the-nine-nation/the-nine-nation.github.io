import { useMemo, useState, type ReactNode } from "react";
import {
  buildReport,
  getRoundQuestions,
  rounds,
  type AnswerRecord,
  type AssessmentReport,
  type Question,
} from "../lib/assessment";
import { ParticipantDialog, saveParticipantProfile } from "../components/ParticipantGate";
import {
  LEGACY_NICKNAME_STORAGE_KEY,
  PARTICIPANT_PROFILE_STORAGE_KEY,
  genderLabel,
  parseParticipantProfile,
  sanitizeNickname,
  type ParticipantProfile,
} from "../lib/profile";

type View = "home" | "journey" | "dashboard" | "admin";
type Phase = "intro" | "round-intro" | "questions" | "checkpoint";
type SavedReport = {
  id: string;
  createdAt: string;
  answers: AnswerRecord[];
  report: AssessmentReport;
  participant?: ParticipantProfile;
};

const STORAGE_KEY = "human-manual-wild-reports-v1";
const LEGACY_STATIC_PROFILE_KEY = "human-manual-wild-profile-v1";

function loadReports(): SavedReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedReport[];
  } catch {
    return [];
  }
}

function loadProfile() {
  const profile = parseParticipantProfile(localStorage.getItem(PARTICIPANT_PROFILE_STORAGE_KEY));
  if (profile) return profile;
  const legacyNickname = sanitizeNickname(localStorage.getItem(LEGACY_STATIC_PROFILE_KEY));
  if (legacyNickname && !localStorage.getItem(LEGACY_NICKNAME_STORAGE_KEY)) {
    localStorage.setItem(LEGACY_NICKNAME_STORAGE_KEY, legacyNickname);
  }
  return null;
}

function Header({ navigate, beginJourney }: { navigate: (view: View) => void; beginJourney: () => void }) {
  return <header className="site-header pages-header">
    <button className="brand link-button" onClick={() => navigate("home")}><span className="brand-orbit">※</span>人类说明书 <small>野生版</small></button>
    <nav className="header-nav">
      <button className="mini-button" onClick={beginJourney}>开始拆封自己</button>
    </nav>
  </header>;
}

function Home({ navigate, beginJourney }: { navigate: (view: View) => void; beginJourney: () => void }) {
  return <main className="home-page manual-home">
    <Header navigate={navigate} beginJourney={beginJourney} />
    <section className="hero-section manual-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span>人类说明书 · 野生版</span><i>PATCH 3.0</i></p>
        <h1>你不是四个字母，<br /><em>你是一整套勉强能运行的系统。</em></h1>
        <p className="hero-intro">三轮动态追问，越答越像你。第一轮看默认设置，第二轮专打模糊地带，第三轮深挖价值、关系、边界和那些你嘴上说“没事”但身体很诚实的部分。</p>
        <div className="hero-actions"><button className="primary-button" onClick={beginJourney}>参加“我到底哪根筋” <span>↗</span></button><a href="#how" className="text-link">先看这局怎么玩 ↓</a></div>
        <div className="hero-meta"><div><b>45</b><span>累计情境题</span></div><div><b>3</b><span>轮渐进探索</span></div><div><b>8+</b><span>组内在维度</span></div></div>
      </div>
      <div className="hero-visual diagnostic-board" aria-label="人类操作系统诊断卡片">
        <div className="diagnostic-title"><span>HUMAN_OS / LIVE CHECK</span><b>不保证修好，但保证看清一点</b></div>
        <div className="diagnostic-card card-main"><small>当前状态</small><strong>复杂，但能用</strong><p>人格不是故障码，报告也不是判决书。</p></div>
        <div className="diagnostic-card card-mbti"><small>偏好接口</small><strong>MBTI</strong><i>保留，但不独占首页</i></div>
        <div className="diagnostic-card card-values"><small>后台驱动</small><strong>价值 / 关系 / 防御</strong><i>越往后，越接近真正的你</i></div>
        <div className="diagnostic-sticker">※ 本测试拒绝把人<br />压缩成四个字母</div>
      </div>
    </section>
    <section className="ticker" aria-hidden="true"><div>MBTI 偏好 <span>※</span> BIG FIVE <span>※</span> 核心价值 <span>※</span> 关系模式 <span>※</span> 情绪调节 <span>※</span> 边界与恢复 <span>※</span> 不是诊断，是探索 <span>※</span></div></section>
    <section className="journey-section" id="how">
      <div className="section-heading"><p className="eyebrow">THREE ROUNDS, NO INTERROGATION</p><h2>一次吃不下的自己，<br />分三轮慢慢看。</h2><p>每轮结束先给你一份当前报告。继续之后，系统会根据前面的结果改变下一轮的题目侧重。</p></div>
      <div className="round-grid">{[["01","10 题","快速扫描","先建立默认设置：能量、信息、决策、关系与恢复。"],["02","15 题","盲区校准","优先追问摇摆或证据不足的维度，别人未必和你同题。"],["03","20 题","深水区","把核心价值、防御、边界与优势之间的冲突请上桌。"]].map(([number,count,title,note]) => <article className="round-card" key={number}><span>{number}</span><i>{count}</i><h3>{title}</h3><p>{note}</p><b>进入下一层 ↗</b></article>)}</div>
    </section>
    <section className="pages-note"><b>GitHub Pages 浏览器版</b><p>测评与阶段报告可完整运行；档案只保存在当前浏览器，不会上传到服务器。完整账号、数据库和管理员服务仍保留在主项目版本中。</p></section>
  </main>;
}

function Report({ report, actions, participantName }: { report: AssessmentReport; actions?: ReactNode; participantName?: string }) {
  const completedRound = report.completedRound ?? 3;
  const confidence = report.confidence ?? 65;
  return <div className="report-shell">
    <section className="report-hero">
      <div className="report-kicker"><span>{participantName ? `${participantName} · ` : ""}第 {completedRound} 轮阶段报告{report.participant && report.participant.gender !== "undisclosed" ? <i className="participant-gender">{genderLabel(report.participant.gender)}</i> : null}</span><span>{report.answeredCount} 道情境 · 可信度 {confidence}%</span></div>
      <div className="type-badge">{report.mbti}</div><p className="eyebrow">MBTI 只是封面，不是整本说明书</p><h1>{report.archetype}</h1><p className="report-tagline">{report.tagline}</p>
      <div className="report-depth"><span>当前深度</span><b>{report.depthLabel}</b><i><em style={{ width: `${confidence}%` }} /></i><small>{completedRound < 3 ? "继续探索会校准盲区，而不是简单重复加题。" : "已完成全部三轮；报告适合当作假设，而不是判决书。"}</small></div>
      <div className="report-actions no-print">{actions}</div>
    </section>
    <section className="report-grid">
      <article className="report-card axes-card"><div className="card-heading"><span>01</span><div><h2>MBTI 偏好坐标</h2><p>好用，但人比四个字母麻烦。</p></div></div><div className="axes-list">{report.axes.map(axis => <div className="axis-row" key={axis.code}><div className="axis-label"><span>{axis.left}</span><b>{axis.code}</b><span>{axis.right}</span></div><div className="axis-track"><i style={{ left: `${axis.value}%` }} /></div></div>)}</div></article>
      <article className="report-card bigfive-card"><div className="card-heading"><span>02</span><div><h2>Big Five 特质光谱</h2><p>五种稳定倾向，观察你如何与世界互动。</p></div></div><div className="trait-list">{report.bigFive.map(trait => <div className="trait-row" key={trait.label}><div><b>{trait.label}</b><small>{trait.note}</small></div><span>{trait.value}</span><div className="trait-meter"><i style={{ width: `${trait.value}%` }} /></div></div>)}</div></article>
      <article className="report-card attachment-card"><div className="card-heading"><span>03</span><div><h2>关系模式天气</h2><p>压力下更常出现的保护策略。</p></div></div><div className="weather-orb"><span>{report.attachment.value}%</span></div><h3>{report.attachment.label}</h3><p>{report.attachment.note}</p></article>
      {report.attraction ? <article className="report-card attraction-card"><div className="card-heading"><span>04</span><div><h2>恋爱引力场</h2><p>不是配对玄学：看你容易被谁点亮，也看你向外释放什么信号。</p></div></div><div className="attraction-status"><b>{report.attraction.evidenceLevel === "preview" ? "初步预览" : report.attraction.evidenceLevel === "calibrated" ? "已校准" : "深入画像"}</b><span>当前可信度 {report.attraction.confidence}%</span></div><div className="magnet-grid"><section><small>你容易被谁点亮</small><h3>{report.attraction.drawnTo.headline}</h3><p>{report.attraction.drawnTo.summary}</p><div>{report.attraction.drawnTo.signals.map(signal => <span key={signal.key}><b>{signal.label}</b><i>{signal.note}</i></span>)}</div></section><section><small>谁更容易被你吸引</small><h3>{report.attraction.drawsIn.headline}</h3><p>{report.attraction.drawsIn.summary}</p><div>{report.attraction.drawsIn.signals.map(signal => <span key={signal.key}><b>{signal.label}</b><i>{signal.note}</i></span>)}</div></section></div><div className="chemistry-grid"><div><span>心动</span><p>{report.attraction.spark}</p></div><div><span>久处</span><p>{report.attraction.lasting}</p></div></div><div className="attraction-watchout"><b>关系提醒</b><p>{report.attraction.watchout}</p></div><small className="attraction-evidence">{report.attraction.evidenceNote}</small></article> : null}
      {report.values?.length ? <article className="report-card values-card"><div className="card-heading"><span>05</span><div><h2>价值驱动器</h2><p>你真正愿意为之付出注意力的东西。</p></div></div><div className="value-stack">{report.values.map((value,index) => <div key={value.label} className={index < 2 ? "is-top" : ""}><span>0{index+1}</span><b>{value.label}</b><i><em style={{width:`${value.value}%`}} /></i><small>{value.note}</small></div>)}</div></article> : null}
      {report.regulation?.length ? <article className="report-card regulation-card"><div className="card-heading"><span>06</span><div><h2>压力下的自动程序</h2><p>你更常调用哪些恢复策略。</p></div></div><div className="regulation-grid">{report.regulation.map(item => <div key={item.label}><b>{item.label}</b><strong>{item.value}</strong><p>{item.note}</p></div>)}</div></article> : null}
      {report.resilience && report.boundaries ? <article className="report-card dual-card"><div><span>恢复弹性</span><b>{report.resilience.value}</b><h3>{report.resilience.label}</h3><p>{report.resilience.note}</p></div><div><span>边界清晰度</span><b>{report.boundaries.value}</b><h3>{report.boundaries.label}</h3><p>{report.boundaries.note}</p></div></article> : null}
      {report.tensions?.length ? <article className="report-card tensions-card"><div className="card-heading"><span>07</span><div><h2>你的“左右互搏”现场</h2><p>真正值得看的，是优势怎样彼此打架。</p></div></div><div className="tension-list">{report.tensions.map((item,index) => <div key={item}><b>矛盾 {index+1}</b><p>{item}</p></div>)}</div></article> : null}
      <article className="report-card strengths-card"><div className="card-heading"><span>08</span><div><h2>目前最稳的三条信号</h2><p>值得验证的假设，不是判决书。</p></div></div><ol>{report.strengths.map(item => <li key={item}>{item}</li>)}</ol></article>
      <article className="report-card experiment-card"><div className="experiment-copy"><span className="eyebrow">未来 7 天 · 微型实验</span><h2>别急着成为更好的人，先多了解自己一点。</h2></div><div className="experiment-list">{report.experiments.map((item,index) => <div key={item}><span>0{index+1}</span><p>{item}</p></div>)}</div></article>
    </section>
    <p className="report-disclaimer">本报告用于自我探索与交流，不构成医学诊断、心理治疗或专业咨询意见。</p>
  </div>;
}

function Journey({ finish, profile }: { finish: (saved: SavedReport) => void; profile: ParticipantProfile }) {
  const [phase,setPhase] = useState<Phase>("intro");
  const [currentRound,setCurrentRound] = useState<1|2|3>(1);
  const [questions,setQuestions] = useState<Question[]>([]);
  const [index,setIndex] = useState(0);
  const [answers,setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedChoices,setSelectedChoices] = useState<number[]>([]);
  const report = useMemo(() => buildReport(answers,currentRound,profile),[answers,currentRound,profile]);
  const question = questions[index];
  const meta = rounds[currentRound-1];

  function prepare(round: 1|2|3) { setCurrentRound(round); setQuestions(getRoundQuestions(round,answers)); setIndex(0); setSelectedChoices([]); setPhase("round-intro"); scrollTo(0,0); }
  function choose(choice: number) { setSelectedChoices(current=>current.includes(choice)?current.filter(item=>item!==choice):current.length<2?[...current,choice]:[current[0],choice]); }
  function confirmChoice() { if(!question||!selectedChoices.length)return;const answer:AnswerRecord={questionId:question.id,choice:selectedChoices[0],...(selectedChoices[1]===undefined?{}:{secondaryChoice:selectedChoices[1]})};const next=[...answers,answer];setAnswers(next);setSelectedChoices([]);if(index<questions.length-1){setIndex(index+1);scrollTo(0,0);}else{setPhase("checkpoint");scrollTo(0,0);} }
  function goBack() { if(index===0)return;const previous=answers.at(-1);if(!previous)return;setAnswers(answers.slice(0,-1));setIndex(index-1);setSelectedChoices([previous.choice,...(previous.secondaryChoice===undefined?[]:[previous.secondaryChoice])]);scrollTo(0,0); }
  function save() { const saved={id:crypto.randomUUID(),createdAt:new Date().toISOString(),answers,report,participant:profile}; const all=[saved,...loadReports()]; localStorage.setItem(STORAGE_KEY,JSON.stringify(all)); finish(saved); }

  if(phase === "intro") return <main className="journey-intro progressive-intro"><a href="#/" className="journey-logo">人类说明书 <small>野生版</small></a><div className="intro-stamp">非官方<br/>不装懂<br/>但认真</div><p className="eyebrow">HUMAN MANUAL · PATCH 3.0</p><h1>{profile.nickname}，欢迎参加<br/><em>“我到底哪根筋”</em>。</h1><p>不是 45 道题一口闷。每轮先出阶段报告，再由上一轮结果决定下一轮问什么。</p><button className="primary-button" onClick={() => prepare(1)}>开始扫描人类故障 <span>↗</span></button><div className="round-roadmap">{rounds.map(round => <div key={round.number}><b>0{round.number}</b><span>{round.title}<small>{round.count} 题 · {round.duration}</small></span></div>)}</div></main>;
  if(phase === "round-intro") return <main className={`round-intro-page round-${currentRound}`}><a href="#/" className="journey-logo">人类说明书 <small>野生版</small></a><div className="round-number">0{currentRound}</div><p className="eyebrow">ROUND {currentRound} / 3 · {meta.duration}</p><h1>{meta.title}</h1><p className="round-subtitle">{meta.subtitle}</p><div className="adaptive-note"><span>{currentRound > 1 ? "私人订制，但不加钱" : "先建立基线"}</span><p>{currentRound > 1 ? `这一轮的 ${meta.count} 题已根据上一轮信号重新排过。` : "第一轮只抓系统默认值，凭第一反应作答更有用。"}</p></div><button className="primary-button" onClick={() => setPhase("questions")}>进入本轮 {meta.count} 题 <span>↗</span></button></main>;
  if(phase === "checkpoint") return <main className="report-page checkpoint-page"><Report report={report} participantName={profile.nickname} actions={<>{currentRound < 3 ? <button className="primary-button" onClick={() => prepare((currentRound+1) as 2|3)}>继续第 {currentRound+1} 轮 <span>↗</span></button> : null}<button className="ghost-button" onClick={save}>保存当前报告</button><button className="ghost-button" onClick={() => print()}>打印 / 保存 PDF</button></>} /></main>;
  return <main className="question-page"><header className="question-header progressive-header"><a href="#/" className="journey-logo">人类说明书</a><div className="progress-wrap"><div className="progress-copy"><span>第 {currentRound} 轮 · {meta.title}</span><b>总探索 {Math.round(answers.length/45*100)}%</b></div><div className="progress-track"><i style={{width:`${Math.round((index+1)/questions.length*100)}%`}} /></div><span>{index+1} / {questions.length}</span></div><button disabled={index===0} onClick={goBack}>←</button></header><section className={`question-stage mode-${question?.mode.length%3}`}><div className="scene-panel"><span className="chapter-label">{question?.chapter}</span><div className="mode-ticket"><small>本题玩法</small><b>{question?.mode}</b></div><div className={`scene-art scene-${((index+currentRound)%4)+1}`}><span>{question?.choices[0].emoji}</span><i/><b>※</b></div></div><div className="question-panel"><div className="question-context"><span>先看情境</span><p>{question?.scene}</p></div><p className="eyebrow">先选最像你的；纠结时可以再选一个</p><h1>{question?.prompt}</h1><p className="question-hint">{question?.hint}</p><div className="choice-list">{question?.choices.map((choice,choiceIndex) => <button aria-pressed={selectedChoices.includes(choiceIndex)} className={`choice-card${selectedChoices[0]===choiceIndex?" is-primary":selectedChoices[1]===choiceIndex?" is-secondary":""}`} key={choice.title} onClick={() => choose(choiceIndex)}><span className="choice-key">{choiceIndex+1}</span><i>{choice.emoji}</i><span><b>{choice.title}</b><small>{choice.note}</small></span><em>{selectedChoices[0]===choiceIndex?"主选":selectedChoices[1]===choiceIndex?"次选":""}</em></button>)}</div><div className={`choice-confirm${selectedChoices.length?" is-ready":""}`} aria-live="polite"><p>{selectedChoices.length===0?"先选一个最常发生的反应":selectedChoices.length===1?"还纠结？可以再点一个作为次选":"已记录：主选更像你，次选也会参与校准"}</p><button type="button" disabled={!selectedChoices.length} onClick={confirmChoice}>确认，下一题 <span>↗</span></button></div></div></section></main>;
}

function Dashboard({ navigate, beginJourney, editProfile, profile, reports, open }: { navigate:(v:View)=>void; beginJourney:()=>void; editProfile:()=>void; profile:ParticipantProfile; reports:SavedReport[]; open:(r:SavedReport)=>void }) {
  return <main className="app-page dashboard-page"><Header navigate={navigate} beginJourney={beginJourney}/><section className="dashboard-hero"><div><p className="eyebrow">MY HUMAN MANUALS</p><h1>{profile.nickname}，你的历代版本都在这里。</h1><p>人会更新，说明书也应该允许打补丁。</p></div><button className="primary-button" onClick={beginJourney}>重新检查哪根筋 <span>↗</span></button></section><section className="pages-dashboard"><aside className="profile-card"><div className="profile-avatar">{profile.nickname.slice(0,1)}</div><p>本机人类样本</p><h2>{profile.nickname}</h2><span>{genderLabel(profile.gender)} · 数据仅保存在当前浏览器</span><button className="ghost-button" onClick={editProfile}>更新人物卡</button></aside><div className="history-panel"><div className="panel-title"><div><p className="eyebrow">VERSION HISTORY</p><h2>我的说明书版本</h2></div><span>{reports.length} 份报告</span></div>{reports.length ? <div className="history-list">{reports.map((saved,index) => <button className="history-card" key={saved.id} onClick={() => open(saved)}><span className="history-index">{String(reports.length-index).padStart(2,"0")}</span><div className="history-type">{saved.report.mbti}</div><div><h3>{saved.report.archetype}</h3><p>第 {saved.report.completedRound} 轮 · {saved.report.answeredCount} 题</p></div><time>{new Date(saved.createdAt).toLocaleDateString("zh-CN")}</time><b>↗</b></button>)}</div> : <div className="empty-state"><span>※</span><h3>还没有任何使用记录</h3><p>先完成第一轮 10 题，就能拿到初步说明书。</p><button className="primary-button" onClick={beginJourney}>开始扫描</button></div>}</div></section></main>;
}

function Admin({ navigate, beginJourney, reports }: { navigate:(v:View)=>void; beginJourney:()=>void; reports:SavedReport[] }) {
  const types=reports.reduce<Record<string,number>>((all,item)=>({...all,[item.report.mbti]:(all[item.report.mbti]??0)+1}),{});
  return <main className="app-page admin-page"><Header navigate={navigate} beginJourney={beginJourney}/><section className="admin-heading"><div><p className="eyebrow">LOCAL OBSERVATION ROOM</p><h1>本机人类观察室</h1><p>GitHub Pages 版只汇总当前浏览器里的匿名探索记录。</p></div><span className="admin-badge">静态演示模式</span></section><section className="metric-grid"><article><span>本机档案</span><b>1</b><i>PEOPLE</i></article><article><span>生成报告</span><b>{reports.length}</b><i>REPORTS</i></article><article><span>完成三轮</span><b>{reports.filter(item=>item.report.completedRound===3).length}</b><i>DONE</i></article><article><span>类型信号</span><b>{Object.keys(types).length}</b><i>TYPES</i></article></section><section className="admin-grid"><article className="admin-panel"><div className="panel-title"><div><p className="eyebrow">RECENT REPORTS</p><h2>最近生成</h2></div></div><div className="admin-table">{reports.map(item => <div className="admin-static-row" key={item.id}><span className="tiny-type">{item.report.mbti}</span><div><b>{item.report.archetype} · 第 {item.report.completedRound} 轮</b><small>{item.report.answeredCount} 题 · {new Date(item.createdAt).toLocaleString("zh-CN")}</small></div></div>)}</div></article><aside className="admin-panel"><div className="panel-title"><div><p className="eyebrow">TYPE SIGNALS</p><h2>类型分布</h2></div></div><div className="type-cloud">{Object.entries(types).map(([type,total]) => <span key={type}><b>{type}</b><small>{total}</small></span>)}</div></aside></section></main>;
}

export function PagesApp() {
  const [view,setView]=useState<View>(() => {
    const route=location.hash.replace(/^#\//,"") as View;
    return ["journey","dashboard","admin"].includes(route) ? route : "home";
  });
  const [profile,setProfileState]=useState<ParticipantProfile|null>(loadProfile);
  const [reports,setReports]=useState<SavedReport[]>(loadReports);
  const [selected,setSelected]=useState<SavedReport|null>(null);
  const [profileAction,setProfileAction]=useState<"journey"|"profile"|null>(null);
  const navigate=(next:View) => { setSelected(null); setView(next); location.hash=next==="home"?"/":`/${next}`; scrollTo(0,0); };
  const beginJourney=()=>setProfileAction("journey");
  const displayName=profile?.nickname || "这位复杂生物";
  const completeProfile=(next:ParticipantProfile) => {saveParticipantProfile(next);setProfileState(next);const action=profileAction;setProfileAction(null);if(action==="journey" || view==="journey") navigate("journey");};
  const prompt=profileAction ? <ParticipantDialog onClose={()=>setProfileAction(null)} onComplete={completeProfile}/> : null;
  const requiredPrompt=view==="journey" && !profile ? <ParticipantDialog required onComplete={completeProfile}/> : null;
  if(selected) { const snapshot=selected.participant ?? selected.report.participant; return <><main className="report-page"><Report report={selected.report} participantName={snapshot?.nickname ?? displayName} actions={<><button className="primary-button" onClick={() => setSelected(null)}>返回我的档案</button><button className="ghost-button" onClick={() => print()}>打印 / 保存 PDF</button></>} /></main>{prompt}</>; }
  if(view==="journey" && !profile) return <><main className="journey-loading"><div className="loading-orbit"><span>※</span></div><h1>先登记这位人类</h1><p>直接访问测评页也不能跳过人物卡。</p></main>{requiredPrompt}</>;
  if(view==="journey" && profile) return <><Journey profile={profile} finish={saved => {setReports(loadReports());setSelected(saved);}}/>{prompt}</>;
  if(view==="dashboard" && profile) return <><Dashboard navigate={navigate} beginJourney={beginJourney} editProfile={()=>setProfileAction("profile")} profile={profile} reports={reports} open={setSelected}/>{prompt}</>;
  if(view==="dashboard" && !profile) return <><Home navigate={navigate} beginJourney={beginJourney}/><ParticipantDialog required onComplete={completeProfile}/></>;
  if(view==="admin") return <><Admin navigate={navigate} beginJourney={beginJourney} reports={reports}/>{prompt}</>;
  return <><Home navigate={navigate} beginJourney={beginJourney}/>{prompt}</>;
}
