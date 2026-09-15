import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeCalendar, activitySvg } from '../scripts/lib.mjs';

function calendar(counts, start = '2026-01-01') {
  const days = counts.map((count, i) => ({ date: new Date(Date.parse(start + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10), contributionCount: count }));
  return { contributionCalendar: { totalContributions: counts.reduce((sum, n) => sum + n, 0), weeks: [{ contributionDays: days }] } };
}
test('zero contributions is a valid calendar with zero activity', () => {
  const result = summarizeCalendar(calendar([0, 0, 0]));
  assert.equal(result.totalContributions, 0);
  assert.equal(result.activeDays, 0);
  assert.equal(result.longestStreak, 0);
});
test('counts days, not commits, and resets the streak at gaps', () => {
  const result = summarizeCalendar(calendar([5, 2, 0, 1, 3, 2, 0]));
  assert.equal(result.totalContributions, 13);
  assert.equal(result.activeDays, 5);
  assert.equal(result.longestStreak, 3);
});
test('streak continues across December and January without exceeding the given range', () => {
  const result = summarizeCalendar(calendar([3, 1, 2, 0], '2025-12-30'));
  assert.equal(result.from, '2025-12-30');
  assert.equal(result.to, '2026-01-02');
  assert.equal(result.longestStreak, 3);
});
test('incomplete API data must fail instead of publishing understated totals', () => {
  const missing = calendar([1, 2, 3]);
  missing.contributionCalendar.weeks[0].contributionDays.splice(1, 1);
  assert.throws(() => summarizeCalendar(missing), /Incomplete/);
  const mismatch = calendar([1, 2]);
  mismatch.contributionCalendar.totalContributions = 100;
  assert.throws(() => summarizeCalendar(mismatch), /does not match/);
  assert.throws(() => summarizeCalendar({ contributionCalendar: { totalContributions: 0, weeks: [] } }), /Empty/);
});
test('private repository metadata is not retained in the generated summary or SVG', () => {
  const source = calendar([12, 0, 9]);
  source.privateRepository = 'SECRET-REPO';
  const summary = summarizeCalendar(source, '2026-01-03T16:00:00Z');
  assert.deepEqual(Object.keys(summary), ['totalContributions', 'activeDays', 'longestStreak', 'from', 'to', 'generatedAt']);
  for (const theme of ['light', 'dark']) {
    const svg = activitySvg(summary, theme);
    assert.ok(!svg.includes('SECRET-REPO'));
    assert.match(svg, /Updated 2026-01-04 KST/);
  }
});
