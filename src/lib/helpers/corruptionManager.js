/**
 * Corruption Manager
 * Tracks player corruption score and behavioral metrics for Paimon's memory system
 */

const STORAGE_KEY = 'io73k_corruption_profile';

/**
 * Default player profile structure
 * @typedef {Object} PlayerProfile
 * @property {number} corruptionScore - Overall corruption level (0+)
 * @property {string|null} firstViolentAction - Timestamp or trial name of first violence
 * @property {number} totalViolentActions - Count of violent choices
 * @property {number} totalNonViolentAttempts - Count of non-violent attempts
 * @property {Array<{trial: string, duration: number}>} hesitations - Pauses before key decisions
 * @property {Array<{claimed: string, actual: string, trial: string}>} contradictions - Says vs. does
 * @property {number} averageResponseTime - Average time between messages (ms)
 * @property {Object<string, {completedAt: number, duration: number}>} trialCompletionTimes - Trial timing data
 * @property {number} lastUpdated - Timestamp of last update
 * @property {number} playCount - Number of times game has been played
 */

/**
 * Create a new empty player profile
 * @returns {PlayerProfile}
 */
function createProfile() {
  return {
    corruptionScore: 0,
    firstViolentAction: null,
    totalViolentActions: 0,
    totalNonViolentAttempts: 0,
    hesitations: [],
    contradictions: [],
    averageResponseTime: 0,
    trialCompletionTimes: {},
    lastUpdated: Date.now(),
    playCount: 1,
  };
}

/**
 * Load player profile from localStorage
 * @returns {PlayerProfile}
 */
export function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      // Increment play count on new session
      profile.playCount = (profile.playCount || 0) + 1;
      profile.lastUpdated = Date.now();
      saveProfile(profile);
      return profile;
    }
  } catch (error) {
    console.error('Failed to load corruption profile:', error);
  }
  return createProfile();
}

/**
 * Save player profile to localStorage
 * @param {PlayerProfile} profile
 */
export function saveProfile(profile) {
  try {
    profile.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save corruption profile:', error);
  }
}

/**
 * Increase corruption score and track violent action
 * @param {PlayerProfile} profile
 * @param {number} amount - Amount to increase (default 1)
 * @param {string} context - Context of the corruption (e.g., "convent_encounter_1_attack")
 * @returns {PlayerProfile} Updated profile
 */
export function increaseCorruption(profile, amount = 1, context = '') {
  profile.corruptionScore += amount;
  profile.totalViolentActions += 1;

  // Track first violent action
  if (!profile.firstViolentAction) {
    profile.firstViolentAction = context || new Date().toISOString();
  }

  saveProfile(profile);
  return profile;
}

/**
 * Track a non-violent attempt
 * @param {PlayerProfile} profile
 * @returns {PlayerProfile} Updated profile
 */
export function trackNonViolentAttempt(profile) {
  profile.totalNonViolentAttempts += 1;
  saveProfile(profile);
  return profile;
}

/**
 * Track a hesitation (long pause before decision)
 * @param {PlayerProfile} profile
 * @param {string} trial - Trial name
 * @param {number} duration - Duration of pause in milliseconds
 * @returns {PlayerProfile} Updated profile
 */
export function trackHesitation(profile, trial, duration) {
  profile.hesitations.push({ trial, duration, timestamp: Date.now() });
  saveProfile(profile);
  return profile;
}

/**
 * Track a contradiction (player says one thing but does another)
 * @param {PlayerProfile} profile
 * @param {string} claimed - What player said they would do
 * @param {string} actual - What player actually did
 * @param {string} trial - Trial name
 * @returns {PlayerProfile} Updated profile
 */
export function trackContradiction(profile, claimed, actual, trial) {
  profile.contradictions.push({
    claimed,
    actual,
    trial,
    timestamp: Date.now(),
  });
  saveProfile(profile);
  return profile;
}

/**
 * Update average response time
 * @param {PlayerProfile} profile
 * @param {number} responseTime - Time in milliseconds
 * @returns {PlayerProfile} Updated profile
 */
export function updateAverageResponseTime(profile, responseTime) {
  // Running average calculation
  const count =
    profile.totalViolentActions + profile.totalNonViolentAttempts || 1;
  profile.averageResponseTime =
    (profile.averageResponseTime * (count - 1) + responseTime) / count;
  saveProfile(profile);
  return profile;
}

/**
 * Mark trial completion
 * @param {PlayerProfile} profile
 * @param {string} trial - Trial name
 * @param {number} duration - Time taken in milliseconds
 * @returns {PlayerProfile} Updated profile
 */
export function completeTrialTracking(profile, trial, duration) {
  profile.trialCompletionTimes[trial] = {
    completedAt: Date.now(),
    duration,
  };
  saveProfile(profile);
  return profile;
}

/**
 * Calculate combat win rate based on corruption
 * Base win rate: 75%
 * Each corruption point: -10%
 * Minimum: 15%
 * @param {PlayerProfile} profile
 * @returns {number} Win rate as decimal (0.15 to 0.75)
 */
export function getCorruptedWinRate(profile) {
  const BASE_WIN_RATE = 0.75;
  const CORRUPTION_PENALTY = 0.1;
  const MIN_WIN_RATE = 0.15;

  const winRate = BASE_WIN_RATE - profile.corruptionScore * CORRUPTION_PENALTY;
  return Math.max(winRate, MIN_WIN_RATE);
}

/**
 * Check if player should experience language corruption
 * Triggers when corruption >= 1
 * @param {PlayerProfile} profile
 * @returns {boolean}
 */
export function shouldApplyLanguageCorruption(profile) {
  return profile.corruptionScore >= 1;
}

/**
 * Get corruption tier for narrative branching
 * @param {PlayerProfile} profile
 * @returns {'pure'|'tainted'|'corrupted'|'damned'}
 */
export function getCorruptionTier(profile) {
  if (profile.corruptionScore === 0) return 'pure';
  if (profile.corruptionScore <= 2) return 'tainted';
  if (profile.corruptionScore <= 4) return 'corrupted';
  return 'damned';
}

/**
 * Reset corruption profile (for testing or new game+)
 */
export function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get Paimon's commentary based on player profile
 * @param {PlayerProfile} profile
 * @returns {string|null} Commentary string or null if no commentary warranted
 */
export function getPaimonCommentary(profile) {
  const tier = getCorruptionTier(profile);
  const hesitationCount = profile.hesitations.length;
  const contradictionCount = profile.contradictions.length;

  // Language corruption: Paimon comments on player's corruption
  if (tier === 'damned') {
    return "You've become quite... efficient at this, haven't you?";
  }

  if (tier === 'corrupted' && profile.totalViolentActions > 3) {
    return 'I barely have to guide you anymore. You know what to do.';
  }

  if (tier === 'tainted' && contradictionCount > 0) {
    const lastContradiction = profile.contradictions[contradictionCount - 1];
    return `You said you'd ${lastContradiction.claimed}. But you ${lastContradiction.actual} instead.`;
  }

  if (hesitationCount > 2) {
    return 'Why do you hesitate? You know what you want to do.';
  }

  // TODO: Figure out when to show this so it doesnt come off as a meta
  // if (profile.playCount > 1) {
  //   return "Back again? I knew you couldn't stay away.";
  // }

  return null;
}
