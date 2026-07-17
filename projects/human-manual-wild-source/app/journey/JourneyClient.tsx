"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildReport, getRoundQuestions, rounds, type AnswerRecord, type Question } from "../../lib/assessment";
import { ReportView } from "../../components/ReportView";
import { ParticipantDialog } from "../../components/ParticipantGate";
import { PARTICIPANT_PROFILE_STORAGE_KEY, parseParticipantProfile, type ParticipantProfile } from "../../lib/profile";
import { PrintButton } from "../../components/PrintButton";

type Phase = "intro" | "round-intro" | "questions" | "checkpoint";

export function JourneyClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const roundMeta = rounds[currentRound - 1];
  const question = roundQuestions[questionIndex];
  const report = useMemo(() => buildReport(answers, currentRound, profile ?? undefined), [answers, currentRound, profile]);
  const roundProgress = roundQuestions.length ? Math.round(((questionIndex + 1) / roundQuestions.length) * 100) : 0;
  const totalProgress = Math.round((answers.length / 45) * 100);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(parseParticipantProfile(window.localStorage.getItem(PARTICIPANT_PROFILE_STORAGE_KEY)));
      setProfileLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function prepareRound(round: 1 | 2 | 3) {
    setCurrentRound(round);
    setRoundQuestions(getRoundQuestions(round, answers));
    setQuestionIndex(0);
    setSelectedChoices([]);
    setPhase("round-intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choose(index: number) {
    if (!question) return;
    setSelectedChoices((current) => {
      if (current.includes(index)) return current.filter((choice) => choice !== index);
      if (current.length < 2) return [...current, index];
      return [current[0], index];
    });
  }

  function confirmChoice() {
    if (!question || selectedChoices.length === 0) return;
    const answer: AnswerRecord = {
      questionId: question.id,
      choice: selectedChoices[0],
      ...(selectedChoices[1] === undefined ? {} : { secondaryChoice: selectedChoices[1] }),
    };
    const next = [...answers, answer];
    setAnswers(next);
    setSelectedChoices([]);
    if (questionIndex < roundQuestions.length - 1) {
      setQuestionIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPhase("checkpoint");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (questionIndex === 0) return;
    const previous = answers.at(-1);
    if (!previous) return;
    setAnswers((current) => current.slice(0, -1));
    setQuestionIndex((value) => value - 1);
    setSelectedChoices([previous.choice, ...(previous.secondaryChoice === undefined ? [] : [previous.secondaryChoice])]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (phase !== "questions" || !question) return;
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < question.choices.length) choose(index);
      if (event.key === "Enter" && selectedChoices.length) confirmChoice();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!profileLoaded) return <main className="journey-intro progressive-intro" aria-busy="true" />;
  if (!profile) {
    return <main className="journey-intro progressive-intro"><ParticipantDialog required onComplete={setProfile} /></main>;
  }

  const nickname = profile.nickname;

  if (phase === "intro") {
    return (
      <main className="journey-intro progressive-intro">
        <Link href="/" className="journey-logo">人类说明书 <small>野生版</small></Link>
        <div className="intro-stamp">非官方<br />不装懂<br />但认真</div>
        <p className="eyebrow">HUMAN MANUAL · PATCH 3.0</p>
        <h1>{nickname}，欢迎参加<br /><em>“我到底哪根筋”</em>。</h1>
        <p>不是 45 道题一口闷。我们分三轮来：每轮先出阶段报告，再由上一轮结果决定下一轮问什么。你随时可以停，没人拿着计时器追你。</p>
        <button className="primary-button" onClick={() => prepareRound(1)}>开始扫描人类故障 <span>↗</span></button>
        <div className="round-roadmap" aria-label="三轮探索安排">
          {rounds.map((round) => (
            <div key={round.number}><b>0{round.number}</b><span>{round.title}<small>{round.count} 题 · {round.duration}</small></span></div>
          ))}
        </div>
      </main>
    );
  }

  if (phase === "round-intro") {
    const adaptive = currentRound > 1;
    return (
      <main className={`round-intro-page round-${currentRound}`}>
        <Link href="/" className="journey-logo">人类说明书 <small>野生版</small></Link>
        <div className="round-number">0{currentRound}</div>
        <p className="eyebrow">ROUND {currentRound} / 3 · {roundMeta.duration}</p>
        <h1>{roundMeta.title}</h1>
        <p className="round-subtitle">{roundMeta.subtitle}</p>
        {adaptive ? (
          <div className="adaptive-note"><span>私人订制，但不加钱</span><p>这一轮的 {roundMeta.count} 题，已根据上一轮的模糊坐标与突出信号重新排过。别人走到这里，看到的题目未必和你一样。</p></div>
        ) : (
          <div className="adaptive-note"><span>先建立基线</span><p>第一轮只抓系统默认值，不急着给你下结论。凭第一反应，比努力扮演成熟人类更有用。</p></div>
        )}
        <button className="primary-button" onClick={() => setPhase("questions")}>进入本轮 {roundMeta.count} 题 <span>↗</span></button>
      </main>
    );
  }

  if (phase === "checkpoint") {
    const isFinal = currentRound === 3;
    const actions = (
      <>
        {!isFinal ? <button className="primary-button" onClick={() => prepareRound((currentRound + 1) as 2 | 3)}>继续第 {currentRound + 1} 轮 <span>↗</span></button> : null}
        <PrintButton />
      </>
    );
    return <main className="report-page checkpoint-page"><ReportView report={report} actions={actions} checkpoint participantName={nickname} /></main>;
  }

  return (
    <main className="question-page">
      <header className="question-header progressive-header">
        <Link href="/" className="journey-logo">人类说明书</Link>
        <div className="progress-wrap">
          <div className="progress-copy"><span>第 {currentRound} 轮 · {roundMeta.title}</span><b>总探索 {totalProgress}%</b></div>
          <div className="progress-track"><i style={{ width: `${roundProgress}%` }} /></div>
          <span>{questionIndex + 1} / {roundQuestions.length}</span>
        </div>
        <button aria-label="返回上一题" disabled={questionIndex === 0} onClick={goBack}>←</button>
      </header>
      <section className={`question-stage mode-${question?.mode.length % 3}`} key={question?.id}>
        <div className="scene-panel">
          <span className="chapter-label">{question?.chapter}</span>
          <div className="mode-ticket"><small>本题玩法</small><b>{question?.mode}</b></div>
          <div className={`scene-art scene-${((questionIndex + currentRound) % 4) + 1}`}><span>{question?.choices[0].emoji}</span><i /><b>※</b></div>
        </div>
        <div className="question-panel">
          <div className="question-context"><span>先看情境</span><p>{question?.scene}</p></div>
          <p className="eyebrow">先选最像你的；纠结时可以再选一个</p>
          <h1>{question?.prompt}</h1>
          <p className="question-hint">{question?.hint}</p>
          <div className="choice-list">
            {question?.choices.map((choice, index) => (
              <button
                key={choice.title}
                className={`choice-card${selectedChoices[0] === index ? " is-primary" : selectedChoices[1] === index ? " is-secondary" : ""}`}
                aria-pressed={selectedChoices.includes(index)}
                onClick={() => choose(index)}
              >
                <span className="choice-key">{index + 1}</span>
                <i>{choice.emoji}</i>
                <span><b>{choice.title}</b><small>{choice.note}</small></span>
                <em>{selectedChoices[0] === index ? "主选" : selectedChoices[1] === index ? "次选" : ""}</em>
              </button>
            ))}
          </div>
          <div className={`choice-confirm${selectedChoices.length ? " is-ready" : ""}`} aria-live="polite">
            <p>{selectedChoices.length === 0 ? "先选一个最常发生的反应" : selectedChoices.length === 1 ? "还纠结？可以再点一个作为次选" : "已记录：主选更像你，次选也会参与校准"}</p>
            <button type="button" disabled={!selectedChoices.length} onClick={confirmChoice}>确认，下一题 <span>↗</span></button>
          </div>
        </div>
      </section>
    </main>
  );
}
