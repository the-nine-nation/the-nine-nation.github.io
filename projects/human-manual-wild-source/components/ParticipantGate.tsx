"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  LEGACY_NICKNAME_STORAGE_KEY,
  PARTICIPANT_PROFILE_STORAGE_KEY,
  getParticipantDraft,
  participantGenderOptions,
  sanitizeNickname,
  type ParticipantGender,
  type ParticipantProfile,
} from "../lib/profile";

export function readProfileDraft() {
  if (typeof window === "undefined") return { nickname: "", gender: undefined };
  return getParticipantDraft(
    window.localStorage.getItem(PARTICIPANT_PROFILE_STORAGE_KEY),
    window.localStorage.getItem(LEGACY_NICKNAME_STORAGE_KEY),
  );
}

export function saveParticipantProfile(profile: ParticipantProfile) {
  window.localStorage.setItem(PARTICIPANT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function ParticipantDialog({
  required = false,
  onClose,
  onComplete,
}: {
  required?: boolean;
  onClose?: () => void;
  onComplete: (profile: ParticipantProfile) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<ParticipantGender | undefined>();
  const [showErrors, setShowErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const hintId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const draft = readProfileDraft();
      setNickname(draft.nickname);
      setGender(draft.gender);
      inputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(timer);
  }, []);

  function confirm() {
    const cleanName = sanitizeNickname(nickname);
    if (!cleanName || !gender) {
      setShowErrors(true);
      if (!cleanName) inputRef.current?.focus();
      return;
    }
    const profile = { nickname: cleanName, gender };
    saveParticipantProfile(profile);
    onComplete(profile);
  }

  return (
    <div className="nickname-gate" role="presentation" onMouseDown={(event) => {
      if (!required && event.target === event.currentTarget) onClose?.();
    }}>
      <section className="nickname-dialog participant-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={hintId}>
        {!required ? <button type="button" className="nickname-close" aria-label="关闭人物卡" onClick={onClose}>×</button> : null}
        <span className="nickname-specimen" aria-hidden="true">※</span>
        <p className="eyebrow">IDENTITY, WITHOUT THE STEREOTYPES</p>
        <h2 id={titleId}>先登记一下<br />这位复杂生物。</h2>
        <p id={hintId}>称呼用来叫你，性别只用于身份展示。它不会改变伴侣画像，也不会替你猜喜欢谁。</p>
        <form onSubmit={(event) => { event.preventDefault(); confirm(); }}>
          <label htmlFor={`${titleId}-input`}>本次出场名</label>
          <div className={`nickname-input-row${showErrors && !sanitizeNickname(nickname) ? " has-error" : ""}`}>
            <input
              ref={inputRef}
              id={`${titleId}-input`}
              value={nickname}
              maxLength={20}
              autoComplete="nickname"
              placeholder="例如：周一拒绝开机"
              onChange={(event) => setNickname(event.target.value)}
            />
            <span>{nickname.trim().length}/20</span>
          </div>
          <fieldset className={`gender-picker${showErrors && !gender ? " has-error" : ""}`}>
            <legend>性别</legend>
            <div>
              {participantGenderOptions.map((option) => (
                <label key={option.value} className={gender === option.value ? "is-selected" : ""}>
                  <input type="radio" name={`${titleId}-gender`} value={option.value} checked={gender === option.value} onChange={() => setGender(option.value)} />
                  <span><b>{option.label}</b><small>{option.note}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          {showErrors && (!sanitizeNickname(nickname) || !gender) ? <p className="profile-error">请补齐称呼和性别；“不愿透露”也是一个完整答案。</p> : null}
          <button type="submit" className="primary-button">登记这位人类 <span>↗</span></button>
        </form>
        <small>资料只留在当前浏览器；性别不参与心理维度计分。</small>
      </section>
    </div>
  );
}

export function ParticipantGate({ children, className }: { children: ReactNode; className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{children}</button>
      {open ? <ParticipantDialog onClose={() => setOpen(false)} onComplete={() => window.location.assign("/journey")} /> : null}
    </>
  );
}
