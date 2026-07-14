import assert from "node:assert/strict";
import test from "node:test";

import {
  allQuestions,
  buildReport,
  getRoundQuestions,
  rounds,
  validateProgress,
} from "../lib/assessment.ts";

function answerQuestions(questions, choice = 0) {
  return questions.map((question) => ({
    questionId: question.id,
    choice: Math.min(choice, question.choices.length - 1),
  }));
}

test("question bank is structurally valid", () => {
  assert.deepEqual(rounds.map((round) => round.count), [10, 15, 20]);
  assert.equal(new Set(allQuestions.map((question) => question.id)).size, allQuestions.length);

  for (const question of allQuestions) {
    assert.match(question.id, /^r[123][a-z0-9_]*$/);
    assert.ok(question.prompt.length > 0);
    assert.ok(question.scene.length > 0);
    assert.ok(question.focus.length > 0);
    assert.ok(question.choices.length >= 2);
    for (const choice of question.choices) {
      assert.ok(choice.title.length > 0);
      assert.ok(Object.keys(choice.scores).length > 0);
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

  assert.equal(report.version, 2);
  assert.equal(report.completedRound, 3);
  assert.equal(report.answeredCount, 45);
  assert.equal(report.axes.length, 4);
  assert.equal(report.bigFive.length, 5);
  assert.equal(report.values.length, 5);
  assert.equal(report.regulation.length, 4);
  assert.equal(report.confidence, 92);
  assert.match(report.mbti, /^[IE][NS][FT][JP]$/);
  assert.ok(report.strengths.length >= 3);
  assert.ok(report.experiments.length >= 3);
});
