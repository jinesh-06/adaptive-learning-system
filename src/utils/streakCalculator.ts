/**
 * Streak Calculation Engine
 * 
 * Provides robust consecutive-day learning streak calculations for offline and mock modes,
 * matching the server-side algorithm in backend/services/state_store.py.
 * 
 * Rules:
 * 1. An active day is any calendar day with at least one qualifying learning activity
 *    (quiz submission, code execution, lesson completion).
 * 2. A streak remains active if the most recent activity occurred today or yesterday.
 * 3. Returns 0 if there is no activity or if the last activity was 2 or more days ago.
 * 4. Dates are normalized to local YYYY-MM-DD to avoid timezone and UTC off-by-one errors.
 * 5. Multiple activities on the same calendar day are counted exactly once.
 * 6. User activities are stored isolated per user ID.
 */

const STORAGE_PREFIX = 'cog_activity_dates_';

/**
 * Normalizes a Date, timestamp number, or ISO string into a local 'YYYY-MM-DD' calendar string.
 */
export function toLocalDateString(input?: Date | string | number): string {
  const d = input ? (input instanceof Date ? input : new Date(input)) : new Date();
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Resolves the currently active user identifier for localStorage isolation.
 */
export function getActiveUserId(): string {
  try {
    const rawUser = localStorage.getItem('cognitive_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.email) return String(parsed.email);
    }
    const token = localStorage.getItem('cognitive_token');
    if (token && token.includes('.')) {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      if (payload?.sub) return String(payload.sub);
      if (payload?.user_id) return String(payload.user_id);
      if (payload?.email) return String(payload.email);
    }
    const savedEmail = localStorage.getItem('cognitive_saved_email');
    if (savedEmail) return savedEmail.trim().toLowerCase();
  } catch {}
  return 'default-learner';
}

/**
 * Pure calculation function: computes streak from a list of date inputs.
 * Accepts an optional referenceDate (defaults to current wall-clock Date).
 */
export function calculateStreakFromDates(
  datesInput: (string | Date | number)[],
  referenceDate?: Date
): number {
  if (!datesInput || datesInput.length === 0) {
    return 0;
  }

  const dateSet = new Set<string>();
  for (const item of datesInput) {
    const str = toLocalDateString(item);
    if (str && str.length === 10) {
      dateSet.add(str);
    }
  }

  if (dateSet.size === 0) {
    return 0;
  }

  // Sort descending: e.g. ['2026-10-29', '2026-10-28', ...]
  const sortedDates = Array.from(dateSet).sort().reverse();

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const todayStr = toLocalDateString(ref);

  const yesterdayDate = new Date(ref);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterdayDate);

  const mostRecent = sortedDates[0];

  // If most recent activity is older than yesterday, the streak is broken
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  // Parse most recent date in local timezone components (avoiding UTC constructor drift)
  const [startYear, startMonth, startDay] = mostRecent.split('-').map(Number);
  let expectedPrevDate = new Date(startYear, startMonth - 1, startDay);

  for (let i = 1; i < sortedDates.length; i++) {
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    const expectedStr = toLocalDateString(expectedPrevDate);

    if (sortedDates[i] === expectedStr) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Retrieves persisted activity dates for a specific user from localStorage.
 */
export function getUserActivityDates(userId?: string): string[] {
  const safeId = (userId || getActiveUserId()).trim().toLowerCase();
  const key = `${STORAGE_PREFIX}${safeId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(d => typeof d === 'string' && d.length === 10);
      }
    }
  } catch {}
  return [];
}

/**
 * Records a learning activity timestamp for the user and persists it to isolated localStorage.
 * Dispatches a 'streak:updated' custom event so dashboards can re-render immediately.
 */
export function recordUserActivityDate(timestamp?: string | Date, userId?: string): number {
  const safeId = (userId || getActiveUserId()).trim().toLowerCase();
  const key = `${STORAGE_PREFIX}${safeId}`;
  const dateStr = toLocalDateString(timestamp);
  if (!dateStr) return 0;

  const dates = getUserActivityDates(safeId);
  if (!dates.includes(dateStr)) {
    dates.push(dateStr);
    try {
      localStorage.setItem(key, JSON.stringify(dates));
    } catch {}
  }

  const newStreak = calculateStreakFromDates(dates);

  try {
    window.dispatchEvent(
      new CustomEvent('streak:updated', {
        detail: { streak: newStreak, userId: safeId, date: dateStr }
      })
    );
  } catch {}

  return newStreak;
}

/**
 * Computes the real streak for mock and offline fallback modes.
 */
export function getMockUserStreak(userId?: string): number {
  const safeId = (userId || getActiveUserId()).trim().toLowerCase();
  const dates = getUserActivityDates(safeId);
  return calculateStreakFromDates(dates);
}

