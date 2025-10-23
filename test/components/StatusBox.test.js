/**
 * Tests for StatusBox component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import StatusBox from '../../src/lib/components/StatusBox.svelte';

describe('StatusBox', () => {
  describe('Rendering', () => {
    it('should render with basic content', () => {
      render(StatusBox, {
        props: {
          content: '<p>Test content</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render with empty content', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '',
          showInput: false,
        },
      });

      // Container should exist but be empty
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should render with HTML content', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: red;">Styled content</p>',
          showInput: false,
        },
      });

      const element = screen.getByText('Styled content');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('P');
    });

    it('should render with multiple HTML elements', () => {
      render(StatusBox, {
        props: {
          content: '<p>Line 1</p><p>Line 2</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
    });
  });

  describe('HP Display', () => {
    it('should display full HP with two hearts', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">HP: ❤️❤️</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/HP: ❤️❤️/)).toBeInTheDocument();
    });

    it('should display half HP with one heart and one broken heart', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">HP: ❤️💔</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/HP: ❤️💔/)).toBeInTheDocument();
    });

    it('should display zero HP with two broken hearts', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">HP: 💔💔</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/HP: 💔💔/)).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('should display timer with seconds', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">30s</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should display timer with minutes and seconds', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">2:30</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('2:30')).toBeInTheDocument();
    });

    it('should display timer at zero', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">0s</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('0s')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept showInput prop as true', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '<p>Test</p>',
          showInput: true,
        },
      });

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should accept showInput prop as false', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '<p>Test</p>',
          showInput: false,
        },
      });

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use default showInput value when not provided', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '<p>Test</p>',
        },
      });

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use default content value when not provided', () => {
      const { container } = render(StatusBox, {
        props: {
          showInput: false,
        },
      });

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update content when prop changes', async () => {
      const { rerender } = render(StatusBox, {
        props: {
          content: '<p>Initial content</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('Initial content')).toBeInTheDocument();

      await rerender({
        content: '<p>Updated content</p>',
        showInput: false,
      });

      expect(screen.getByText('Updated content')).toBeInTheDocument();
      expect(screen.queryByText('Initial content')).not.toBeInTheDocument();
    });

    it('should update HP display when content changes', async () => {
      const { rerender } = render(StatusBox, {
        props: {
          content: '<p>HP: ❤️❤️</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/HP: ❤️❤️/)).toBeInTheDocument();

      await rerender({
        content: '<p>HP: ❤️💔</p>',
        showInput: false,
      });

      expect(screen.getByText(/HP: ❤️💔/)).toBeInTheDocument();
      expect(screen.queryByText(/HP: ❤️❤️/)).not.toBeInTheDocument();
    });

    it('should update timer display when content changes', async () => {
      const { rerender } = render(StatusBox, {
        props: {
          content: '<p>30s</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('30s')).toBeInTheDocument();

      await rerender({
        content: '<p>29s</p>',
        showInput: false,
      });

      expect(screen.getByText('29s')).toBeInTheDocument();
      expect(screen.queryByText('30s')).not.toBeInTheDocument();
    });

    it('should update showInput prop', async () => {
      const { rerender, container } = render(StatusBox, {
        props: {
          content: '<p>Test</p>',
          showInput: false,
        },
      });

      expect(container.querySelector('div')).toBeInTheDocument();

      await rerender({
        content: '<p>Test</p>',
        showInput: true,
      });

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle content with special characters', () => {
      render(StatusBox, {
        props: {
          content: '<p>Test & "special" <characters></p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/Test & "special"/)).toBeInTheDocument();
    });

    it('should handle content with emojis', () => {
      render(StatusBox, {
        props: {
          content: '<p>🎮 Game Status 🎯</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/🎮 Game Status 🎯/)).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = '<p>' + 'A'.repeat(200) + '</p>';
      render(StatusBox, {
        props: {
          content: longContent,
          showInput: false,
        },
      });

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('should handle content with line breaks', () => {
      render(StatusBox, {
        props: {
          content: '<p>Line 1<br/>Line 2</p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });

    it('should handle nested HTML elements', () => {
      render(StatusBox, {
        props: {
          content: '<div><p><strong>Bold text</strong></p></div>',
          showInput: false,
        },
      });

      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('should handle content with inline styles', () => {
      render(StatusBox, {
        props: {
          content:
            '<p style="color: red; font-weight: bold; font-size: 20px;">Styled text</p>',
          showInput: false,
        },
      });

      const element = screen.getByText('Styled text');
      expect(element).toBeInTheDocument();
      expect(element.style.color).toBe('red');
      expect(element.style.fontWeight).toBe('bold');
    });
  });

  describe('Trial-Specific Content', () => {
    it('should display convent trial HP format', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">HP: ❤️❤️</p>',
          showInput: true,
        },
      });

      const element = screen.getByText(/HP: ❤️❤️/);
      expect(element).toBeInTheDocument();
      expect(element.style.color).toBe('rgb(255, 0, 0)');
      expect(element.style.fontWeight).toBe('bold');
    });

    it('should display hangman trial timer format', () => {
      render(StatusBox, {
        props: {
          content: '<p style="color: #ff0000; font-weight: bold;">45s</p>',
          showInput: true,
        },
      });

      const element = screen.getByText('45s');
      expect(element).toBeInTheDocument();
      expect(element.style.color).toBe('rgb(255, 0, 0)');
      expect(element.style.fontWeight).toBe('bold');
    });

    it('should handle custom trial status format', () => {
      render(StatusBox, {
        props: {
          content: '<p>Score: <strong>100</strong></p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/Score:/)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should render a single container div', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '<p>Test</p>',
          showInput: false,
        },
      });

      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThanOrEqual(1);
    });

    it('should preserve HTML structure in content', () => {
      const { container } = render(StatusBox, {
        props: {
          content: '<div><p>Nested</p></div>',
          showInput: false,
        },
      });

      expect(container.querySelector('p')).toBeInTheDocument();
      expect(screen.getByText('Nested')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render content that is accessible', () => {
      render(StatusBox, {
        props: {
          content: '<p>Accessible content</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('Accessible content')).toBeInTheDocument();
    });

    it('should handle ARIA attributes in content', () => {
      render(StatusBox, {
        props: {
          content: '<p aria-label="Status">HP: ❤️❤️</p>',
          showInput: false,
        },
      });

      const element = screen.getByText(/HP: ❤️❤️/);
      expect(element).toBeInTheDocument();
      expect(element.getAttribute('aria-label')).toBe('Status');
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple StatusBox instances with different content', () => {
      const { container: container1 } = render(StatusBox, {
        props: {
          content: '<p>Box 1</p>',
          showInput: false,
        },
        target: document.body,
      });

      const { container: container2 } = render(StatusBox, {
        props: {
          content: '<p>Box 2</p>',
          showInput: true,
        },
        target: document.body,
      });

      expect(screen.getByText('Box 1')).toBeInTheDocument();
      expect(screen.getByText('Box 2')).toBeInTheDocument();
    });
  });

  describe('Content Sanitization', () => {
    it('should render safe HTML content', () => {
      render(StatusBox, {
        props: {
          content: '<p>Safe <strong>content</strong></p>',
          showInput: false,
        },
      });

      expect(screen.getByText(/Safe/)).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should handle content with data attributes', () => {
      render(StatusBox, {
        props: {
          content: '<p data-testid="status">Test</p>',
          showInput: false,
        },
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
