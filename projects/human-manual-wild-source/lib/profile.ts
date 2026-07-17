export type ParticipantGender = "male" | "female" | "nonbinary" | "undisclosed";

export type ParticipantProfile = {
  nickname: string;
  gender: ParticipantGender;
};

export const PARTICIPANT_PROFILE_STORAGE_KEY = "human-manual-wild-profile-v2";
export const LEGACY_NICKNAME_STORAGE_KEY = "human-manual-wild-nickname-v1";

export const participantGenderOptions: { value: ParticipantGender; label: string; note: string }[] = [
  { value: "male", label: "男性", note: "仅作身份信息" },
  { value: "female", label: "女性", note: "仅作身份信息" },
  { value: "nonbinary", label: "非二元 / 其他", note: "不把你塞进两个格子" },
  { value: "undisclosed", label: "不愿透露", note: "隐私出口一直有效" },
];

export function sanitizeNickname(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 20) : "";
}

export function isParticipantGender(value: unknown): value is ParticipantGender {
  return participantGenderOptions.some((option) => option.value === value);
}

export function parseParticipantProfile(raw: string | null): ParticipantProfile | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ParticipantProfile>;
    const nickname = sanitizeNickname(value.nickname);
    if (!nickname || !isParticipantGender(value.gender)) return null;
    return { nickname, gender: value.gender };
  } catch {
    return null;
  }
}

export function getParticipantDraft(rawProfile: string | null, rawLegacyNickname: string | null) {
  const profile = parseParticipantProfile(rawProfile);
  if (profile) return profile;
  return {
    nickname: sanitizeNickname(rawLegacyNickname),
    gender: undefined,
  } satisfies { nickname: string; gender: undefined };
}

export function genderLabel(gender: ParticipantGender) {
  return participantGenderOptions.find((option) => option.value === gender)?.label ?? "不愿透露";
}
