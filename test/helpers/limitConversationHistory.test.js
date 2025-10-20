import { describe, it, expect } from 'vitest';
import { limitConversationHistory } from '../../src/lib/helpers/chat.js';

describe('limitConversationHistory', () => {
  it('should return the same array if length is less than maxMessages', () => {
    const history = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];
    
    const result = limitConversationHistory(history, 10);
    
    expect(result).toEqual(history);
    expect(result.length).toBe(2);
  });

  it('should return the same array if length equals maxMessages', () => {
    const history = [
      { role: 'user', content: 'Message 1' },
      { role: 'assistant', content: 'Response 1' },
      { role: 'user', content: 'Message 2' },
      { role: 'assistant', content: 'Response 2' },
      { role: 'user', content: 'Message 3' },
    ];
    
    const result = limitConversationHistory(history, 5);
    
    expect(result).toEqual(history);
    expect(result.length).toBe(5);
  });

  it('should trim to last N messages when history exceeds maxMessages', () => {
    const history = [
      { role: 'user', content: 'Message 1' },
      { role: 'assistant', content: 'Response 1' },
      { role: 'user', content: 'Message 2' },
      { role: 'assistant', content: 'Response 2' },
      { role: 'user', content: 'Message 3' },
      { role: 'assistant', content: 'Response 3' },
      { role: 'user', content: 'Message 4' },
      { role: 'assistant', content: 'Response 4' },
    ];
    
    const result = limitConversationHistory(history, 4);
    
    expect(result.length).toBe(4);
    expect(result[0].content).toBe('Message 3');
    expect(result[1].content).toBe('Response 3');
    expect(result[2].content).toBe('Message 4');
    expect(result[3].content).toBe('Response 4');
  });

  it('should use default maxMessages of 10 when not specified', () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
    }));
    
    const result = limitConversationHistory(history);
    
    expect(result.length).toBe(10);
    expect(result[0].content).toBe('Message 6');
    expect(result[9].content).toBe('Message 15');
  });

  it('should handle empty array', () => {
    const result = limitConversationHistory([], 10);
    
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should handle non-array input gracefully', () => {
    const result = limitConversationHistory(null, 10);
    
    expect(result).toBeNull();
  });

  it('should preserve message structure and properties', () => {
    const history = [
      { role: 'user', content: 'Test 1', timestamp: 123 },
      { role: 'assistant', content: 'Test 2', metadata: { foo: 'bar' } },
      { role: 'user', content: 'Test 3' },
    ];
    
    const result = limitConversationHistory(history, 2);
    
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ role: 'assistant', content: 'Test 2', metadata: { foo: 'bar' } });
    expect(result[1]).toEqual({ role: 'user', content: 'Test 3' });
  });
});
