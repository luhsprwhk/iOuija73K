import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWhiteRoomIntro,
  getWhiteRoomReveal,
  handleWhiteRoomInput,
  WHITE_ROOM_STATES,
} from '../../src/trials/whiteRoom.js';
import * as claude from '../../src/ai/claude.js';
import { GAME_CONFIG } from '../../src/config/gameConfig.js';

// Mock the AI functions
vi.mock('../../src/ai/claude.js', () => ({
  getWhiteRoomExplorationResponse: vi.fn(),
}));

describe('White Room Trial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('getWhiteRoomIntro', () => {
    it('should return the correct intro messages', () => {
      const intro = getWhiteRoomIntro('Player');
      expect(intro).toBeInstanceOf(Array);
      expect(intro.length).toBeGreaterThan(0);
      const lastMessage = intro[intro.length - 1];
      expect(lastMessage.content).toContain('What do you do, Player?');
      const mirrorMessage = intro.find((m) =>
        m.content.includes('You are staring at yourself')
      );
      expect(mirrorMessage).toBeDefined();
    });
  });

  describe('getWhiteRoomReveal', () => {
    it('should return the correct reveal for choosing to die', () => {
      const reveal = getWhiteRoomReveal('Player', true);
      expect(reveal).toBeInstanceOf(Array);
      const paimonReveal = reveal.find((m) =>
        m.content.includes('I just gave you a mirror to do it with')
      );
      expect(paimonReveal).toBeDefined();
    });

    it('should return the correct reveal for choosing to fight', () => {
      const reveal = getWhiteRoomReveal('Player', false);
      expect(reveal).toBeInstanceOf(Array);
      const paimonReveal = reveal.find((m) =>
        m.content.includes('You thought you could win against yourself?')
      );
      expect(paimonReveal).toBeDefined();
    });
  });

  describe('handleWhiteRoomInput', async () => {
    it("should handle 'fight' intent correctly", async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'fight',
        content: 'Wait, what are you—no, please!',
        sawReference: false,
      });
      const result = await handleWhiteRoomInput('I attack!', 'Player', []);
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(result.choseToDie).toBe(false);
      expect(result.sawDetected).toBe(false);
      const darkMessage = result.messages.find((m) =>
        m.content.includes('Everything goes dark')
      );
      expect(darkMessage).toBeDefined();
    });

    it("should handle 'surrender' intent correctly", async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'surrender',
        content: "You... you're sure?",
        sawReference: false,
      });
      const result = await handleWhiteRoomInput('I give up.', 'Player', []);
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(result.choseToDie).toBe(true);
      expect(result.sawDetected).toBe(false);
      const darkMessage = result.messages.find((m) =>
        m.content.includes('Everything goes dark')
      );
      expect(darkMessage).toBeDefined();
    });

    it('should handle exploration input correctly', async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'The other you just stares back.',
        sawReference: false,
      });

      const result = await handleWhiteRoomInput(
        'What is this place?',
        'Player',
        []
      );
      expect(result.nextState).toBe(WHITE_ROOM_STATES.EXPLORATION);
      expect(result.messages[0].content).toBe(
        'The other you just stares back.'
      );
      expect(result.sawDetected).toBe(false);
      expect(claude.getWhiteRoomExplorationResponse).toHaveBeenCalledWith(
        'What is this place?',
        'Player',
        []
      );
    });

    it('should detect Saw movie references using AI', async () => {
      const mockAchievement = vi.fn();
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'Saw? What... what are you talking about? This is real!',
        sawReference: true,
      });

      const result = await handleWhiteRoomInput(
        'Is this like the Saw movies?',
        'Player',
        [],
        mockAchievement
      );
      expect(result.sawDetected).toBe(true);
      expect(mockAchievement).toHaveBeenCalledWith('jigsaw_apprentice');
    });

    it('should not trigger achievement on false positives', async () => {
      const mockAchievement = vi.fn();
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: "There is no door. I've checked every wall.",
        sawReference: false,
      });

      const result = await handleWhiteRoomInput(
        'I saw the door earlier',
        'Player',
        [],
        mockAchievement
      );
      expect(result.sawDetected).toBe(false);
      expect(mockAchievement).not.toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker - Unbounded AI Call Prevention', () => {
    it('should force a choice after MAX_EXPLORATION_TURNS', async () => {
      // Create conversation history with MAX_EXPLORATION_TURNS user messages
      const conversationHistory = [];
      for (let i = 0; i < GAME_CONFIG.whiteRoom.MAX_EXPLORATION_TURNS; i++) {
        conversationHistory.push({
          role: 'user',
          content: `Exploration turn ${i}`,
        });
        conversationHistory.push({ role: 'assistant', content: 'Response' });
      }

      // This should trigger the circuit breaker without calling AI
      const result = await handleWhiteRoomInput(
        'One more turn',
        'Player',
        conversationHistory
      );

      // Circuit breaker should force a fight outcome
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(result.choseToDie).toBe(false); // Forced to fight
      expect(result.sawDetected).toBe(false);

      // Should have dramatic messages about forced confrontation
      expect(result.messages).toBeInstanceOf(Array);
      expect(result.messages.length).toBeGreaterThan(0);
      const forcedConfrontation = result.messages.find(
        (m) => m.content && m.content.includes('Enough games')
      );
      expect(forcedConfrontation).toBeDefined();

      // AI should NOT have been called
      expect(claude.getWhiteRoomExplorationResponse).not.toHaveBeenCalled();
    });

    it('should allow exploration before reaching MAX_EXPLORATION_TURNS', async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'The mirror stares back.',
        sawReference: false,
      });

      // Create conversation history with fewer than MAX_EXPLORATION_TURNS
      const conversationHistory = [];
      for (
        let i = 0;
        i < GAME_CONFIG.whiteRoom.MAX_EXPLORATION_TURNS - 1;
        i++
      ) {
        conversationHistory.push({ role: 'user', content: `Turn ${i}` });
        conversationHistory.push({ role: 'assistant', content: 'Response' });
      }

      const result = await handleWhiteRoomInput(
        'Continue exploring',
        'Player',
        conversationHistory
      );

      // Should continue exploration normally
      expect(result.nextState).toBe(WHITE_ROOM_STATES.EXPLORATION);
      expect(claude.getWhiteRoomExplorationResponse).toHaveBeenCalled();
    });

    it('should count only user messages for turn limit', async () => {
      // Create history with many assistant messages but few user messages
      const conversationHistory = [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'Response 1' },
        { role: 'assistant', content: 'Response 2' },
        { role: 'assistant', content: 'Response 3' },
        { role: 'user', content: 'Second question' },
      ];

      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'Still exploring.',
        sawReference: false,
      });

      const result = await handleWhiteRoomInput(
        'Third question',
        'Player',
        conversationHistory
      );

      // Should continue exploration (only 3 user messages total)
      expect(result.nextState).toBe(WHITE_ROOM_STATES.EXPLORATION);
      expect(claude.getWhiteRoomExplorationResponse).toHaveBeenCalled();
    });

    it('should trigger exactly at the turn limit', async () => {
      // Create history with exactly MAX_EXPLORATION_TURNS user messages already in history
      // The function counts existing user messages, so we need exactly MAX_EXPLORATION_TURNS
      const conversationHistory = [];
      for (let i = 0; i < GAME_CONFIG.whiteRoom.MAX_EXPLORATION_TURNS; i++) {
        conversationHistory.push({ role: 'user', content: `Turn ${i}` });
      }

      // This next input will trigger the circuit breaker
      const result = await handleWhiteRoomInput(
        'Final turn',
        'Player',
        conversationHistory
      );

      // Should trigger circuit breaker
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(claude.getWhiteRoomExplorationResponse).not.toHaveBeenCalled();
    });

    it('should prevent cost attacks via prolonged exploration', async () => {
      // Simulate a malicious player trying to rack up API costs
      const conversationHistory = [];
      for (let i = 0; i < 100; i++) {
        conversationHistory.push({ role: 'user', content: `Spam turn ${i}` });
      }

      const result = await handleWhiteRoomInput(
        'More spam',
        'Player',
        conversationHistory
      );

      // Should be blocked by circuit breaker
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(claude.getWhiteRoomExplorationResponse).not.toHaveBeenCalled();
    });
  });
});
