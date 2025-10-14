/**
 * Validates if the input looks like a real name
 * @param {string} name - The name to validate
 * @returns {boolean} - True if the name appears valid, false otherwise
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();

  // Must have at least 2 characters
  if (trimmedName.length < 2) {
    return false;
  }

  // Must not be too long (reasonable name length)
  if (trimmedName.length > 50) {
    return false;
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return false;
  }

  // Reject if it's mostly numbers (e.g., "123", "test123456")
  const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;
  const digitCount = (trimmedName.match(/[0-9]/g) || []).length;
  if (digitCount > letterCount) {
    return false;
  }

  // Reject common fake/joke names
  const lowerName = trimmedName.toLowerCase();
  const fakenames = [
    'test',
    'asdf',
    'qwerty',
    'admin',
    'user',
    'guest',
    'anonymous',
    'anon',
    'none',
    'null',
    'undefined',
    'na',
    'n/a',
    'xxx',
    'aaa',
    'zzz',
    'fake',
    'notmyname',
    'noname',
    'nope',
    'lol',
    'lmao',
    'haha',
    'hehe',
    'bruh',
    'yeet',
    'sus',
    'ligma',
    'deez',
    'joe',
    'mama',
    'your mom',
    'yourmom',
    'fuck',
    'shit',
    'ass',
    'dick',
    'penis',
    'vagina',
    'poop',
    'fart',
    'butthole',
  ];

  if (fakenames.includes(lowerName)) {
    return false;
  }

  // Reject if it contains excessive special characters
  const specialCharCount = (trimmedName.match(/[^a-zA-Z0-9\s\-']/g) || [])
    .length;
  if (specialCharCount > 2) {
    return false;
  }

  // Reject if it's all caps and longer than 4 characters (likely shouting/fake)
  if (trimmedName.length > 4) {
    const hasLowerCase = /[a-z]/.test(trimmedName);
    const hasUpperCase = /[A-Z]/.test(trimmedName);
    // If it has letters and they're all uppercase, reject it
    if (hasUpperCase && !hasLowerCase) {
      return false;
    }
  }

  // Reject keyboard mashing patterns
  const mashingPatterns = [
    /(.)\1{3,}/, // Same character repeated 4+ times
    /^[qwertyuiop]+$/i,
    /^[asdfghjkl]+$/i,
    /^[zxcvbnm]+$/i,
    /^[qaz]+$/i,
    /^[wsx]+$/i,
    /^[edc]+$/i,
  ];

  for (const pattern of mashingPatterns) {
    if (pattern.test(trimmedName)) {
      return false;
    }
  }

  return true;
}
