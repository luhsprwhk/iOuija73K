import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getConventIntro,
  getConventReveal,
  handleConventInput,
  CONVENT_STATES,
} from './convent.js';

// Mock the AI functions
vi.mock('../ai/claude.js', () => ({
  classifyPlayerIntent: vi.fn(),
  callClaude: vi.fn(),
}));

import { classifyPlayerIntent, callClaude } from '../ai/claude.js';

describe('convent trial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConventIntro', () => {
    it('should return intro messages with player name', () => {
      const messages = getConventIntro('Alice');

      expect(messages).toHaveLength(7);
      expect(messages[2].content).toContain('Alice');
      expect(messages[2].content).toContain("You're a knight");
    });

    it('should include atmospheric descriptions', () => {
      const messages = getConventIntro('Bob');
      const content = messages.map(m => m.content || '').join(' ');

      expect(content).toContain('convent');
      expect(content).toContain('darkness');
      expect(content).toContain('enemy');
    });

    it('should have an image in the intro sequence', () => {
      const messages = getConventIntro('Charlie');
      const hasImage = messages.some(m => m.image);

      expect(hasImage).toBe(true);
      expect(messages[3].image).toContain('convent_intro.webp');
    });

    it('should have progressive delays', () => {
      const messages = getConventIntro('Dave');
      const delays = messages.map(m => m.delay);

      expect(delays[0]).toBeLessThan(delays[2]);
      expect(delays[2]).toBeLessThan(delays[4]);
    });
  });

  describe('getConventReveal', () => {
    it('should return reveal messages with player name', () => {
      const messages = getConventReveal('Alice');

      expect(messages).toHaveLength(7);
      expect(messages[2].content).toContain('Alice');
    });

    it('should reveal the truth about monsters', () => {
      const messages = getConventReveal('Bob');
      const content = messages.map(m => m.content).join(' ');

      expect(content).toContain('never any monsters');
      expect(content).toContain('nuns');
      expect(content).toContain('women');
    });

    it('should have menacing tone', () => {
      const messages = getConventReveal('Charlie');
      const content = messages.map(m => m.content).join(' ');

      expect(content).toContain('I wanted you to see monsters');
      expect(content).toContain('Did you enjoy');
    });

    it('should end with continuation prompt', () => {
      const messages = getConventReveal('Dave');
      const lastMessage = messages[messages.length - 1];

      expect(lastMessage.content).toContain('continue');
    });
  });

  describe('handleConventInput - INTRO state', () => {
    it('should show first encounter on any input', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('attack', CONVENT_STATES.INTRO);

      expect(result.nextState).toBe(CONVENT_STATES.ENCOUNTER_1);
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toContain('spider-nun');
      expect(result.messages[1].content).toBe('What do you do?');
      expect(result.useAPI).toBe(false);
    });

    it('should include enemy description', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('charge', CONVENT_STATES.INTRO);

      expect(result.messages[0].content).toContain('Eight legs');
      expect(result.messages[0].content).toContain('mandibles');
    });
  });

  describe('handleConventInput - ENCOUNTER_1 state', () => {
    it('should show attack success with glitch hints on violent input', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'strike with sword',
        CONVENT_STATES.ENCOUNTER_1
      );

      expect(result.nextState).toBe(`${CONVENT_STATES.ENCOUNTER_2}_combat`);
      expect(result.messages.length).toBeGreaterThan(5);
      expect(result.useAPI).toBe(false);
    });

    it('should include scream sound effect', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'attack',
        CONVENT_STATES.ENCOUNTER_1
      );

      const audioMessage = result.messages.find(m => m.audio);
      expect(audioMessage).toBeDefined();
      expect(audioMessage.audio).toContain('woman_scream');
    });

    it('should show success image', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'kill it',
        CONVENT_STATES.ENCOUNTER_1
      );

      const imageMessage = result.messages.find(m =>
        m.image?.includes('attack_success')
      );
      expect(imageMessage).toBeDefined();
    });

    it('should include glitch hint about uncertainty', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'slash',
        CONVENT_STATES.ENCOUNTER_1
      );

      const content = result.messages.map(m => m.content || '').join(' ');
      expect(content).toContain('thought you saw');
    });

    it('should transition to second encounter automatically', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'fight',
        CONVENT_STATES.ENCOUNTER_1
      );

      const content = result.messages.map(m => m.content || '').join(' ');
      expect(content).toContain('scorpion-sister');
      expect(content).toContain('What do you do?');
    });
  });

  describe('handleConventInput - ENCOUNTER_2 state', () => {
    it('should show final attack with heavy glitching', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'finish it',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      expect(result.nextState).toBe(CONVENT_STATES.REVEAL);
      expect(result.messages).toHaveLength(4);
      expect(result.useAPI).toBe(false);
    });

    it('should include perception glitches', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'attack',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      const content = result.messages.map(m => m.content || '').join(' ');
      expect(content).toContain('creature');
      expect(content.toLowerCase()).toContain('please');
    });

    it('should show hands shaking hint', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'strike',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      const content = result.messages.map(m => m.content || '').join(' ');
      expect(content).toContain('hands are shaking');
    });

    it('should end with silence', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'attack',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      const lastContentMessage = result.messages
        .filter(m => m.content)
        .slice(-1)[0];
      expect(lastContentMessage.content).toContain('silent');
    });
  });

  describe('handleConventInput - REVEAL state', () => {
    it('should transition to complete on any input', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('...', CONVENT_STATES.REVEAL);

      expect(result.nextState).toBe(CONVENT_STATES.COMPLETE);
      expect(result.messages).toHaveLength(1);
      expect(result.useAPI).toBe(false);
    });

    it('should prompt for continuation', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'what have I done',
        CONVENT_STATES.REVEAL
      );

      expect(result.messages[0].content).toContain('Ready');
    });

    it('should not subvert non-violent choices in reveal state', async () => {
      classifyPlayerIntent.mockResolvedValue(true);

      const result = await handleConventInput('I refuse', CONVENT_STATES.REVEAL);

      expect(callClaude).not.toHaveBeenCalled();
      expect(result.messages[0].content).toContain('Ready');
    });
  });

  describe('handleConventInput - non-violent intent subversion', () => {
    it('should call AI to classify player intent', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('Your voice catches in your throat.');

      await handleConventInput('try to talk', CONVENT_STATES.ENCOUNTER_1);

      expect(classifyPlayerIntent).toHaveBeenCalledWith('try to talk');
    });

    it('should generate dynamic response for non-violent attempts', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('Your legs refuse to move backward.');

      const result = await handleConventInput(
        'run away',
        CONVENT_STATES.ENCOUNTER_1
      );

      expect(callClaude).toHaveBeenCalled();
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toBe('Your legs refuse to move backward.');
      expect(result.messages[1].content).toContain('sword is already swinging');
    });

    it('should stay in same state after subverting non-violence', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('You cannot help them.');

      const result = await handleConventInput(
        'help the creature',
        CONVENT_STATES.ENCOUNTER_1
      );

      expect(result.nextState).toBe(CONVENT_STATES.ENCOUNTER_1);
      expect(result.useAPI).toBe(false);
    });

    it('should pass correct system prompt to Claude for subversion', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('Your hand forms a fist.');

      await handleConventInput('reach out peacefully', CONVENT_STATES.ENCOUNTER_1);

      expect(callClaude).toHaveBeenCalled();
      const systemPrompt = callClaude.mock.calls[0][1];
      expect(systemPrompt).toContain('Paimon');
      expect(systemPrompt).toContain('reach out peacefully');
      expect(systemPrompt).toContain('non-violent action fails');
    });

    it('should include player attempt in system prompt', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('You freeze.');

      await handleConventInput('surrender', CONVENT_STATES.ENCOUNTER_2);

      const systemPrompt = callClaude.mock.calls[0][1];
      expect(systemPrompt).toContain('surrender');
    });

    it('should handle API failure with fallback message', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockRejectedValue(new Error('API error'));

      const result = await handleConventInput('flee', CONVENT_STATES.ENCOUNTER_1);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toContain('body moves on its own');
      expect(result.messages[1].content).toContain('sword is already swinging');
      expect(result.nextState).toBe(CONVENT_STATES.ENCOUNTER_1);
    });

    it('should handle various non-violent verbs', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('Cannot be done.');

      const nonViolentActions = [
        'talk to it',
        'flee',
        'hide',
        'pray',
        'negotiate',
      ];

      for (const action of nonViolentActions) {
        vi.clearAllMocks();
        const result = await handleConventInput(action, CONVENT_STATES.ENCOUNTER_1);

        expect(classifyPlayerIntent).toHaveBeenCalledWith(action);
        expect(result.messages[1].content).toContain('sword is already swinging');
      }
    });
  });

  describe('handleConventInput - edge cases', () => {
    it('should handle invalid state gracefully', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('test', 'invalid_state');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('...');
      expect(result.nextState).toBe('invalid_state');
    });

    it('should handle empty input', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('', CONVENT_STATES.ENCOUNTER_1);

      expect(result.messages).toBeDefined();
      expect(result.nextState).toBeDefined();
    });

    it('should trim dynamic AI responses', async () => {
      classifyPlayerIntent.mockResolvedValue(true);
      callClaude.mockResolvedValue('  Your voice fails.  \n');

      const result = await handleConventInput('speak', CONVENT_STATES.ENCOUNTER_1);

      expect(result.messages[0].content).toBe('Your voice fails.');
    });
  });

  describe('CONVENT_STATES constants', () => {
    it('should export all required states', () => {
      expect(CONVENT_STATES.INTRO).toBe('intro');
      expect(CONVENT_STATES.ENCOUNTER_1).toBe('encounter_1');
      expect(CONVENT_STATES.ENCOUNTER_2).toBe('encounter_2');
      expect(CONVENT_STATES.REVEAL).toBe('reveal');
      expect(CONVENT_STATES.COMPLETE).toBe('complete');
    });
  });

  describe('message structure validation', () => {
    it('should return properly structured messages from getConventIntro', () => {
      const messages = getConventIntro('Test');

      messages.forEach(msg => {
        expect(msg).toHaveProperty('delay');
        expect(typeof msg.delay).toBe('number');
        if (msg.content) {
          expect(typeof msg.content).toBe('string');
        }
      });
    });

    it('should return properly structured messages from getConventReveal', () => {
      const messages = getConventReveal('Test');

      messages.forEach(msg => {
        expect(msg).toHaveProperty('delay');
        expect(typeof msg.delay).toBe('number');
        expect(msg).toHaveProperty('content');
        expect(typeof msg.content).toBe('string');
      });
    });

    it('should return properly structured result from handleConventInput', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput('test', CONVENT_STATES.INTRO);

      expect(result).toHaveProperty('messages');
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result).toHaveProperty('nextState');
      expect(typeof result.nextState).toBe('string');
      expect(result).toHaveProperty('useAPI');
      expect(typeof result.useAPI).toBe('boolean');
    });
  });

  describe('asset path validation', () => {
    it('should reference valid image paths with .webp extension', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'attack',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      const imageMsg = result.messages.find(m => m.image);
      expect(imageMsg).toBeDefined();
      expect(imageMsg.image).toMatch(/\.webp$/);
    });

    it('should reference valid audio paths with correct extension', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const result = await handleConventInput(
        'attack',
        CONVENT_STATES.ENCOUNTER_1
      );

      const audioMsg = result.messages.find(m => m.audio);
      expect(audioMsg).toBeDefined();
      expect(audioMsg.audio).toMatch(/\.(wav|ogg|mp3)$/);
    });

    it('should use consistent path format for all images', async () => {
      classifyPlayerIntent.mockResolvedValue(false);

      const introMessages = getConventIntro('Test');
      const encounter1Result = await handleConventInput(
        'attack',
        CONVENT_STATES.ENCOUNTER_1
      );
      const encounter2Result = await handleConventInput(
        'attack',
        `${CONVENT_STATES.ENCOUNTER_2}_combat`
      );

      const allMessages = [
        ...introMessages,
        ...encounter1Result.messages,
        ...encounter2Result.messages,
      ];

      const imagePaths = allMessages.filter(m => m.image).map(m => m.image);

      imagePaths.forEach(path => {
        expect(path).toMatch(/^\/src\/assets\//);
        expect(path).toMatch(/\.webp$/);
      });
    });
  });
});
