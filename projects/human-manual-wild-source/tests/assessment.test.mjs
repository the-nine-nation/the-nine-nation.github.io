import assert from "node:assert/strict";
import test from "node:test";

import {
  allQuestions,
  buildReport,
  getRoundQuestions,
  rounds,
  scoreAnswers,
  validateProgress,
} from "../lib/assessment.ts";
import {
  getParticipantDraft,
  parseParticipantProfile,
  participantGenderOptions,
} from "../lib/profile.ts";

function answerQuestions(questions, choice = 0) {
  return questions.map((question) => ({
    questionId: question.id,
    choice: Math.min(choice, question.choices.length - 1),
  }));
}

test("question bank is structurally valid", () => {
  assert.deepEqual(rounds.map((round) => round.count), [10, 15, 20]);
  assert.equal(allQuestions.length, 66);
  assert.equal(new Set(allQuestions.map((question) => question.id)).size, allQuestions.length);

  for (const question of allQuestions) {
    assert.match(question.id, /^r[123][a-z0-9_]*$/);
    assert.ok(question.prompt.length > 0);
    assert.ok(question.prompt.length <= 28, `${question.id} prompt is too long`);
    assert.ok(question.scene.length > 0);
    assert.ok(question.scene.length <= 72, `${question.id} scene is too long`);
    assert.ok(question.focus.length > 0);
    assert.equal(question.choices.length, 4);
    assert.match(question.hint, /最近三个月/);
    assert.match(question.hint, /主选/);
    assert.match(question.hint, /次选/);
    assert.equal(new Set(question.choices.map((choice) => choice.title)).size, question.choices.length);

    const scoredDimensions = new Set(question.choices.flatMap((choice) => Object.keys(choice.scores)));
    for (const dimension of question.focus) {
      assert.equal(scoredDimensions.has(dimension), true, `${question.id} focuses on ${dimension} without scoring it`);
    }

    for (const choice of question.choices) {
      assert.ok(choice.title.length > 0);
      assert.ok(choice.title.length <= 24, `${question.id} choice is too long`);
      assert.ok(choice.note.length > 0);
      assert.ok(choice.emoji.length > 0);
      assert.ok(Object.keys(choice.scores).length > 0);
      for (const score of Object.values(choice.scores)) {
        assert.equal(Number.isInteger(score), true);
        assert.ok(Math.abs(score) <= 3);
        assert.notEqual(score, 0);
      }
    }
  }
});

test("all three cumulative checkpoints validate", () => {
  const answers = [];
  for (const round of [1, 2, 3]) {
    const questions = getRoundQuestions(round, answers);
    assert.equal(questions.length, rounds[round - 1].count);
    answers.push(...answerQuestions(questions, round - 1));
    assert.equal(validateProgress(answers, round), true);
  }
  assert.equal(answers.length, 45);
});

test("tampered order and choices are rejected", () => {
  const firstRound = getRoundQuestions(1, []);
  const answers = answerQuestions(firstRound);
  const reordered = [...answers];
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];

  assert.equal(validateProgress(reordered, 1), false);
  assert.equal(validateProgress([...answers.slice(0, -1)], 1), false);
  assert.equal(validateProgress([...answers.slice(0, -1), { ...answers.at(-1), choice: 99 }], 1), false);
  assert.equal(validateProgress([...answers.slice(0, -1), { ...answers.at(-1), secondaryChoice: answers.at(-1).choice }], 1), false);
  assert.equal(validateProgress([...answers.slice(0, -1), { ...answers.at(-1), secondaryChoice: 99 }], 1), false);
});

test("secondary choices calibrate without outweighing the primary choice", () => {
  const { scores, evidence } = scoreAnswers([{ questionId: "r1_party", choice: 0, secondaryChoice: 2 }]);
  assert.equal(scores.EI, 1.65);
  assert.equal(evidence.EI, 1.45);

  const attraction = scoreAnswers([{ questionId: "r2_romantic_spark", choice: 0, secondaryChoice: 1 }]);
  assert.equal(attraction.scores.ATTR_WARM, 3);
  assert.equal(attraction.scores.ATTR_VITAL, 1.35);
});

test("participant profiles support all privacy choices and legacy nickname migration", () => {
  assert.deepEqual(participantGenderOptions.map((option) => option.value), ["male", "female", "nonbinary", "undisclosed"]);
  for (const gender of participantGenderOptions.map((option) => option.value)) {
    assert.deepEqual(parseParticipantProfile(JSON.stringify({ nickname: "  周一  拒绝开机  ", gender })), {
      nickname: "周一 拒绝开机",
      gender,
    });
  }
  assert.equal(parseParticipantProfile("{broken"), null);
  assert.equal(parseParticipantProfile(JSON.stringify({ nickname: "人类", gender: "invalid" })), null);
  assert.deepEqual(getParticipantDraft(null, "  旧昵称  "), { nickname: "旧昵称", gender: undefined });
});

test("later rounds adapt to earlier signals", () => {
  const firstRound = getRoundQuestions(1, []);
  const firstProfile = answerQuestions(firstRound, 0);
  const secondProfile = answerQuestions(firstRound, 3);
  const firstAdaptiveIds = getRoundQuestions(2, firstProfile).slice(9).map((question) => question.id);
  const secondAdaptiveIds = getRoundQuestions(2, secondProfile).slice(9).map((question) => question.id);

  assert.notDeepEqual(firstAdaptiveIds, secondAdaptiveIds);
});

test("final report contains every public section", () => {
  const answers = [];
  for (const round of [1, 2, 3]) {
    answers.push(...answerQuestions(getRoundQuestions(round, answers), round));
  }
  const report = buildReport(answers, 3);

  assert.equal(report.version, 3);
  assert.equal(report.completedRound, 3);
  assert.equal(report.answeredCount, 45);
  assert.equal(report.axes.length, 4);
  assert.equal(report.bigFive.length, 5);
  assert.equal(report.values.length, 5);
  assert.equal(report.regulation.length, 4);
  assert.equal(report.attraction.confidence, 82);
  assert.equal(report.attraction.drawnTo.signals.length, 2);
  assert.equal(report.attraction.drawsIn.signals.length, 2);
  assert.equal(report.confidence, 92);
  assert.match(report.mbti, /^[IE][NS][FT][JP]$/);
  assert.ok(report.strengths.length >= 3);
  assert.ok(report.experiments.length >= 3);
});

test("attraction previews deepen by round and keep deterministic tie order", () => {
  const answers = [];
  const reports = [];
  for (const round of [1, 2, 3]) {
    answers.push(...answerQuestions(getRoundQuestions(round, answers), 0));
    reports.push(buildReport(answers, round));
  }
  assert.deepEqual(reports.map((report) => report.attraction.confidence), [30, 62, 82]);
  assert.deepEqual(reports.map((report) => report.attraction.evidenceLevel), ["preview", "calibrated", "deep"]);

  const tied = buildReport([], 1);
  assert.deepEqual(tied.attraction.drawnTo.signals.map((signal) => signal.key), ["warm", "vital"]);
  assert.deepEqual(tied.attraction.drawsIn.signals.map((signal) => signal.key), ["warm", "vital"]);
});

test("gender is a report snapshot and never changes attraction scoring", () => {
  const answers = [];
  for (const round of [1, 2, 3]) answers.push(...answerQuestions(getRoundQuestions(round, answers), 2));
  const male = buildReport(answers, 3, { nickname: "甲", gender: "male" });
  const female = buildReport(answers, 3, { nickname: "乙", gender: "female" });

  assert.deepEqual(male.attraction, female.attraction);
  assert.deepEqual(male.scores, female.scores);
  assert.deepEqual(male.participant, { nickname: "甲", gender: "male" });
  assert.deepEqual(female.participant, { nickname: "乙", gender: "female" });
});

test("version 2 reports remain representable without invented attraction data", () => {
  const current = buildReport(answerQuestions(getRoundQuestions(1, [])), 1);
  const historical = { ...current, version: 2 };
  delete historical.attraction;
  delete historical.participant;
  assert.equal(historical.version, 2);
  assert.equal(historical.attraction, undefined);
  assert.equal(historical.participant, undefined);
  assert.ok(historical.axes.length > 0);
});
