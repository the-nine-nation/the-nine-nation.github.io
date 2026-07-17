import { SiteHeader } from "../components/SiteHeader";
import { ParticipantGate } from "../components/ParticipantGate";

export default function Home() {
  return (
    <main className="home-page manual-home">
      <SiteHeader publicMode />
      <section className="hero-section manual-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span>人类说明书 · 野生版</span><i>PATCH 3.0</i></p>
          <h1>你不是四个字母，<br /><em>你是一整套勉强能运行的系统。</em></h1>
          <p className="hero-intro">三轮动态追问，越答越像你。第 1 轮看默认设置，第 2 轮专打模糊地带，第 3 轮深挖价值、关系、边界和那些你嘴上说“没事”但身体很诚实的部分。</p>
          <div className="hero-actions">
            <ParticipantGate className="primary-button">参加“我到底哪根筋” <span>↗</span></ParticipantGate>
            <a href="#how" className="text-link">先看这局怎么玩 ↓</a>
          </div>
          <div className="hero-meta">
            <div><b>45</b><span>累计情境题</span></div>
            <div><b>3</b><span>轮渐进探索</span></div>
            <div><b>8+</b><span>组内在维度</span></div>
          </div>
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
        <div className="section-heading">
          <p className="eyebrow">THREE ROUNDS, NO INTERROGATION</p>
          <h2>一次吃不下的自己，<br />分三轮慢慢看。</h2>
          <p>每轮结束先给你一份当前报告。你可以停在这里，也可以继续；继续之后，系统会根据前面的结果改变下一轮的题目侧重。</p>
        </div>
        <div className="round-grid">
          {[
            ["01", "10 题", "快速扫描", "先建立默认设置：能量、信息、决策、关系与恢复。", "不急着定型"],
            ["02", "15 题", "盲区校准", "优先追问摇摆或证据不足的维度，别人未必和你同题。", "开始个性化"],
            ["03", "20 题", "深水区", "把核心价值、防御、边界与优势之间的冲突请上桌。", "完整多维报告"],
          ].map(([number, count, title, note, tag]) => (
            <article className="round-card" key={number}><span>{number}</span><i>{count}</i><h3>{title}</h3><p>{note}</p><b>{tag} ↗</b></article>
          ))}
        </div>
      </section>

      <section className="dimensions-section">
        <div className="dimension-intro"><p className="eyebrow">A PERSON IS AN ENSEMBLE CAST</p><h2>一个类型，装不下一个活人。</h2><p>所以这份说明书同时看偏好、连续特质、价值、关系、调节方式与生活中的内在张力。分数越高不代表越好，关键是它在什么情境帮你，又在什么情境收你电费。</p></div>
        <div className="dimension-cards">
          <article className="dimension-card coral"><span>01 / 偏好接口</span><h3>MBTI</h3><p>四组信息加工偏好；好用，但只是封面。</p><b>16 种有梗原型 ↗</b></article>
          <article className="dimension-card purple"><span>02 / 稳定光谱</span><h3>Big Five</h3><p>开放、尽责、外向、宜人和情绪敏感。</p><b>5 条连续坐标 ↗</b></article>
          <article className="dimension-card yellow"><span>03 / 后台驱动</span><h3>核心价值</h3><p>自主、连接、成长、安稳与成就如何排序。</p><b>选择为何有动力 ↗</b></article>
          <article className="dimension-card mint"><span>04 / 关系程序</span><h3>依恋与边界</h3><p>靠近、确认、撤退，以及你说“不”的成本。</p><b>关系天气与领土 ↗</b></article>
          <article className="dimension-card coral"><span>05 / 压力后台</span><h3>情绪调节</h3><p>行动、重评、反刍与回避，谁最常接管你。</p><b>自动程序体检 ↗</b></article>
          <article className="dimension-card purple"><span>06 / 内在张力</span><h3>优势互搏</h3><p>比如温柔与边界、野心与自我认可怎样打架。</p><b>真正值得看的部分 ↗</b></article>
        </div>
      </section>

      <section className="report-preview-section">
        <div className="preview-paper manual-preview"><div className="preview-label">阶段 02 / 多维校准</div><div className="preview-type">INFP</div><p>暂定人类原型</p><h3>意义收藏癖</h3><div className="preview-tags"><span>成长 82</span><span>连接 76</span><span>反刍 68</span></div><div className="preview-bars"><i style={{width:"82%"}}/><i style={{width:"67%"}}/><i style={{width:"75%"}}/><i style={{width:"58%"}}/></div></div>
        <div className="preview-copy"><p className="eyebrow">REPORT AFTER EVERY ROUND</p><h2>每一轮都有答案，<br />但下一轮会推翻一点。</h2><p>阶段报告会明确告诉你当前可信度、哪些结论还很初步，以及下一轮准备校准什么。最终报告不止 MBTI，还会给出价值排序、压力程序、边界、恋爱引力场、恢复弹性、内在矛盾与 7 天微实验。</p><ParticipantGate className="primary-button">生成我的野生说明书 <span>↗</span></ParticipantGate></div>
      </section>

      <footer className="site-footer"><div><span className="brand-orbit">※</span><b>人类说明书</b></div><p>认识自己，不必先坐端正。</p><span>© 2026 HUMAN MANUAL · 野生版 / 非诊断</span></footer>
    </main>
  );
}
