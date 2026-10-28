const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const code = ts.transpileModule(fs.readFileSync(require.resolve("../src/utils/academic.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { scheduleMatchesDate, scoreText } = context.exports;

test("dated lessons do not reappear on the same weekday in another week", () => {
  const lesson = { teachingDate: "2026-11-02" };
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 10, 2)), true);
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 10, 9)), false);
});
test("legacy weekly lessons stay within the semester, including boundary dates", () => {
  const lesson = { startDate: "2026-11-01", endDate: "2026-11-30" };
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 9, 31)), false);
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 10, 1)), true);
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 10, 30)), true);
  assert.equal(scheduleMatchesDate(lesson, new Date(2026, 11, 1)), false);
});
test("a legitimate zero score remains distinct from an unpublished score", () => {
  assert.equal(scoreText(0), "0.0/100");
  assert.notEqual(scoreText(null), scoreText(0));
  assert.notEqual(scoreText(undefined), scoreText(0));
});
