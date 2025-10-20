import { describe, it, expect, vi } from 'vitest';
import {
  getWhiteRoomIntro,
  getWhiteRoomReveal,
  handleWhiteRoomInput,
  WHITE_ROOM_STATES,
} from '../../src/trials/whiteRoom.js';
import * as claude from '../../src/ai/claude.js';

// Mock the AI functions
vi.mock('../../src/ai/claude.js', () => ({
  getWhiteRoomExplorationResponse: vi.fn(),
}));

describe('White Room Trial', () => {
  describe('getWhiteRoomIntro', () => {
    it('should return the correct intro messages', () => {
      const intro = getWhiteRoomIntro('Player');
      expect(intro).toBeInstanceOf(Array);
      expect(intro.length).toBeGreaterThan(0);
      const lastMessage = intro[intro.length - 1];
      expect(lastMessage.content).toContain('What do you do, Player?');
      const mirrorMessage = intro.find(m => m.content.includes('You are staring at yourself'));
      expect(mirrorMessage).toBeDefined();
    });
  });

  describe('getWhiteRoomReveal', () => {
    it('should return the correct reveal for choosing to die', () => {
      const reveal = getWhiteRoomReveal('Player', true);
      expect(reveal).toBeInstanceOf(Array);
      const paimonReveal = reveal.find(m => m.content.includes('I just gave you a mirror to do it with'));
      expect(paimonReveal).toBeDefined();
    });

    it('should return the correct reveal for choosing to fight', () => {
      const reveal = getWhiteRoomReveal('Player', false);
      expect(reveal).toBeInstanceOf(Array);
      const paimonReveal = reveal.find(m => m.content.includes('You thought you could win against yourself?'));
      expect(paimonReveal).toBeDefined();
    });
  });

  describe('handleWhiteRoomInput', async () => {
    it('should handle \'fight\' intent correctly', async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'fight',
        content: 'Wait, what are you—no, please!',
        sawReference: false,
      });
      const result = await handleWhiteRoomInput('I attack!', 'Player', []);
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(result.choseToDie).toBe(false);
      expect(result.sawDetected).toBe(false);
      const darkMessage = result.messages.find(m => m.content.includes('Everything goes dark'));
      expect(darkMessage).toBeDefined();
    });

    it('should handle \'surrender\' intent correctly', async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'surrender',
        content: 'You... you\'re sure?',
        sawReference: false,
      });
      const result = await handleWhiteRoomInput('I give up.', 'Player', []);
      expect(result.nextState).toBe(WHITE_ROOM_STATES.REVEAL);
      expect(result.choseToDie).toBe(true);
      expect(result.sawDetected).toBe(false);
      const darkMessage = result.messages.find(m => m.content.includes('Everything goes dark'));
      expect(darkMessage).toBeDefined();
    });

    it('should handle exploration input correctly', async () => {
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'The other you just stares back.',
        sawReference: false,
      });

      const result = await handleWhiteRoomInput('What is this place?', 'Player', []);
      expect(result.nextState).toBe(WHITE_ROOM_STATES.EXPLORATION);
      expect(result.messages[0].content).toBe('The other you just stares back.');
      expect(result.sawDetected).toBe(false);
      expect(claude.getWhiteRoomExplorationResponse).toHaveBeenCalledWith('What is this place?', 'Player', []);
    });

    it('should detect Saw movie references using AI', async () => {
      const mockAchievement = vi.fn();
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'Saw? What... what are you talking about? This is real!',
        sawReference: true,
      });

      const result = await handleWhiteRoomInput('Is this like the Saw movies?', 'Player', [], mockAchievement);
      expect(result.sawDetected).toBe(true);
      expect(mockAchievement).toHaveBeenCalledWith('jigsaw_apprentice');
    });

    it('should not trigger achievement on false positives', async () => {
      const mockAchievement = vi.fn();
      claude.getWhiteRoomExplorationResponse.mockResolvedValue({
        intent: 'explore',
        content: 'There is no door. I\'ve checked every wall.',
        sawReference: false,
      });

      const result = await handleWhiteRoomInput('I saw the door earlier', 'Player', [], mockAchievement);
      expect(result.sawDetected).toBe(false);
      expect(mockAchievement).not.toHaveBeenCalled();
    });
  });
});
