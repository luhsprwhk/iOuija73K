import { describe, it, expect } from 'vitest';
import { validateName } from './validateName';

describe('validateName', () => {
  it('should accept valid names', () => {
    expect(validateName('John')).toBe(true);
    expect(validateName('Mary Jane')).toBe(true);
    expect(validateName('José')).toBe(true);
    expect(validateName("O'Brien")).toBe(true);
    expect(validateName('Anne-Marie')).toBe(true);
  });

  it('should reject names that are too short', () => {
    expect(validateName('J')).toBe(false);
    expect(validateName('a')).toBe(false);
  });

  it('should reject names that are too long', () => {
    const longName = 'a'.repeat(51);
    expect(validateName(longName)).toBe(false);
  });

  it('should reject names without letters', () => {
    expect(validateName('123')).toBe(false);
    expect(validateName('!!!')).toBe(false);
  });

  it('should reject names with mostly numbers', () => {
    expect(validateName('test123456')).toBe(false);
    expect(validateName('12345a')).toBe(false);
  });

  it('should reject common fake names', () => {
    expect(validateName('test')).toBe(false);
    expect(validateName('asdf')).toBe(false);
    expect(validateName('admin')).toBe(false);
    expect(validateName('guest')).toBe(false);
    expect(validateName('anonymous')).toBe(false);
  });

  it('should reject keyboard mashing', () => {
    expect(validateName('aaaa')).toBe(false);
    expect(validateName('qwerty')).toBe(false);
    expect(validateName('asdfgh')).toBe(false);
  });

  it('should reject excessive special characters', () => {
    expect(validateName('!@#$%')).toBe(false);
    expect(validateName('***test***')).toBe(false);
  });

  it('should reject all caps (shouting)', () => {
    expect(validateName('JOHNDOE')).toBe(false);
    expect(validateName('TESTNAME')).toBe(false);
  });

  it('should accept short all caps names (if not in fake list)', () => {
    // Short names like "ANN" or "MAX" are acceptable if not in the fake list
    expect(validateName('ANN')).toBe(true);
    expect(validateName('MAX')).toBe(true);
    expect(validateName('SAM')).toBe(true);
    // But "JOE" is rejected because it's in the fake names list (joe mama meme)
    expect(validateName('JOE')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateName('')).toBe(false);
    expect(validateName(null)).toBe(false);
    expect(validateName(undefined)).toBe(false);
    expect(validateName('   ')).toBe(false);
  });
});
