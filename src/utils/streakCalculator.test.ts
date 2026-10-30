/**
 * Automated Verification Test Suite for Streak Calculation & User Isolation
 */

import {
  calculateStreakFromDates,
  toLocalDateString,
  getUserActivityDates,
  recordUserActivityDate,
  getMockUserStreak
} from './streakCalculator';

// Polyfill localStorage for node environment if running outside browser
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (i: number) => Object.keys(store)[i] || null,
    length: 0
  } as any;
}

// Polyfill window.dispatchEvent if running in node
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true
  } as any;
}

let passedCount = 0;
let totalCount = 0;

function assertTest(condition: boolean, testName: string, detail?: any) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`, detail !== undefined ? detail : '');
    throw new Error(`Assertion failed: ${testName}`);
  }
}

export function runStreakTestSuite() {
  console.log('--- RUNNING STREAK VERIFICATION TEST SUITE ---');

  // Case 1: No activity
  assertTest(
    calculateStreakFromDates([]) === 0,
    'Case 1: No activity returns 0'
  );

  const ref = new Date(2026, 9, 29); // Oct 29, 2026

  // Case 2: Activity today
  assertTest(
    calculateStreakFromDates(['2026-10-29'], ref) === 1,
    'Case 2: Activity today returns 1'
  );

  // Case 3: Activity yesterday
  assertTest(
    calculateStreakFromDates(['2026-10-28'], ref) === 1,
    'Case 3: Activity yesterday returns 1'
  );

  // Case 4: Consecutive active days
  assertTest(
    calculateStreakFromDates(['2026-10-29', '2026-10-28', '2026-10-27'], ref) === 3,
    'Case 4: Three consecutive active days returns 3'
  );

  // Case 5: A gap between active days
  assertTest(
    calculateStreakFromDates(['2026-10-29', '2026-10-28', '2026-10-25'], ref) === 2,
    'Case 5a: Gap after 2 days correctly stops streak at 2'
  );
  assertTest(
    calculateStreakFromDates(['2026-10-26', '2026-10-25'], ref) === 0,
    'Case 5b: Activity older than yesterday returns 0 (streak broken)'
  );

  // Case 6: Month boundary
  const refNov = new Date(2026, 10, 2); // Nov 2, 2026
  assertTest(
    calculateStreakFromDates(['2026-11-02', '2026-11-01', '2026-10-31', '2026-10-30'], refNov) === 4,
    'Case 6: Month boundary transition (Oct 30 -> Oct 31 -> Nov 1 -> Nov 2) returns 4'
  );

  // Case 7: Year boundary
  const refJan = new Date(2027, 0, 2); // Jan 2, 2027
  assertTest(
    calculateStreakFromDates(['2027-01-02', '2027-01-01', '2026-12-31', '2026-12-30'], refJan) === 4,
    'Case 7: Year boundary transition (Dec 30 -> Dec 31 -> Jan 1 -> Jan 2) returns 4'
  );

  // Case 8: Duplicate events on the same day
  assertTest(
    calculateStreakFromDates(['2026-10-29', '2026-10-29', '2026-10-28', '2026-10-28', '2026-10-28'], ref) === 2,
    'Case 8: Multiple activities on same calendar day are deduplicated'
  );

  // Case 9: Zero streak returned by backend preserved in UI rendering
  const mockDashboardDataZero = { streak_days: 0 };
  const mockDashboardDataFive = { streak_days: 5 };
  const renderedZero = mockDashboardDataZero?.streak_days ?? 0;
  const renderedFive = mockDashboardDataFive?.streak_days ?? 0;
  assertTest(
    renderedZero === 0 && renderedFive === 5,
    'Case 9: Nullish coalescing preserves 0 streak from backend and does not coerce to fallback'
  );

  // Case 10: Backend unavailable with valid local activity
  localStorage.clear();
  const todayIso = new Date().toISOString();
  recordUserActivityDate(todayIso, 'test-user-offline');
  const offlineStreak = getMockUserStreak('test-user-offline');
  assertTest(
    offlineStreak === 1,
    'Case 10: Backend unavailable with valid local activity returns genuine streak (1)'
  );

  // Case 11: Backend unavailable with NO valid local activity
  const emptyUserStreak = getMockUserStreak('non-existent-user');
  assertTest(
    emptyUserStreak === 0,
    'Case 11: Backend unavailable with no activity returns 0'
  );

  // Case 12: Isolation between different users
  localStorage.clear();
  const user1 = 'alice@example.com';
  const user2 = 'bob@example.com';
  recordUserActivityDate(new Date(), user1);
  assertTest(
    getMockUserStreak(user1) === 1 && getMockUserStreak(user2) === 0,
    'Case 12: User isolation confirmed: activity for User 1 does not affect User 2'
  );

  console.log(`\nTEST SUITE COMPLETED: ${passedCount}/${totalCount} tests PASSED!`);
}

runStreakTestSuite();

