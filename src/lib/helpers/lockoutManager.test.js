/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkLockout,
  setLockout,
  clearLockout,
  getLockoutDuration,
} from './lockoutManager';

describe('lockoutManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should return not locked out when no lockout is set', () => {
    const result = checkLockout();
    expect(result.isLockedOut).toBe(false);
    expect(result.remainingTime).toBe(0);
  });

  it('should set a lockout', () => {
    setLockout();
    const result = checkLockout();
    expect(result.isLockedOut).toBe(true);
    expect(result.remainingTime).toBeGreaterThan(0);
  });

  it('should clear a lockout', () => {
    setLockout();
    clearLockout();
    const result = checkLockout();
    expect(result.isLockedOut).toBe(false);
    expect(result.remainingTime).toBe(0);
  });

  it('should return correct remaining time', () => {
    setLockout();
    const result = checkLockout();
    // Should be close to 5 minutes (300 seconds)
    expect(result.remainingTime).toBeGreaterThan(295);
    expect(result.remainingTime).toBeLessThanOrEqual(300);
  });

  it('should automatically clear expired lockouts', () => {
    // Set a lockout that expired 1 second ago
    const expiredTime = Date.now() - 1000;
    localStorage.setItem('io73k_lockout', expiredTime.toString());

    const result = checkLockout();
    expect(result.isLockedOut).toBe(false);
    expect(result.remainingTime).toBe(0);
    // Should also clear from localStorage
    expect(localStorage.getItem('io73k_lockout')).toBeNull();
  });

  it('should return lockout duration', () => {
    const duration = getLockoutDuration();
    expect(duration).toBe(300); // 5 minutes in seconds
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('Storage error');
    });

    const result = checkLockout();
    expect(result.isLockedOut).toBe(false);
    expect(result.remainingTime).toBe(0);

    // Restore
    localStorage.getItem = originalGetItem;
  });
});
