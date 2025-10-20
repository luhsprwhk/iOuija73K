/**
 * Security utilities for sanitizing user input before use in AI prompts
 */

/**
 * Sanitizes player name to prevent prompt injection attacks
 *
 * Security measures:
 * - Strips all newlines and carriage returns (prevents multi-line injection)
 * - Limits length to reasonable maximum (prevents context flooding)
 * - Removes control characters (prevents invisible injections)
 * - Trims whitespace (prevents padding attacks)
 *
 * @param {string} name - The raw player name input
 * @param {number} maxLength - Maximum allowed length (default 50)
 * @returns {string} - Sanitized player name safe for use in prompts
 */
export function sanitizePlayerName(name, maxLength = 50) {
  if (!name || typeof name !== 'string') {
    return 'Player';
  }

  // Remove all newlines, carriage returns, and tabs (critical for prompt injection prevention)
  let sanitized = name.replace(/[\r\n\t\u2028\u2029]/g, ' ');

  // Remove other control characters (ASCII 0-31 except space and the ones already handled, and DEL)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce length limit to prevent context flooding
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  // If nothing remains after sanitization, return safe default
  if (sanitized.length === 0) {
    return 'Player';
  }

  return sanitized;
}

/**
 * Validates that a player name is safe and meets requirements
 *
 * @param {string} name - The player name to validate
 * @returns {{ valid: boolean, reason?: string }} - Validation result
 */
export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, reason: 'Name is required' };
  }

  const sanitized = sanitizePlayerName(name);

  if (sanitized === 'Player' && name !== 'Player') {
    return { valid: false, reason: 'Name contains invalid characters' };
  }

  if (sanitized.length < 2) {
    return { valid: false, reason: 'Name must be at least 2 characters' };
  }

  return { valid: true };
}
