import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * useFocusTrap - Traps focus inside a container element.
 * On mount: saves the previously focused element, moves focus into the trap.
 * While active: Tab/Shift+Tab cycle within focusable children.
 * On Escape: calls onClose.
 * On unmount: restores focus to the previously focused element.
 */
export function useFocusTrap(
  isOpen: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Save the previously focused element when opening
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    }
  }, [isOpen]);

  // Move focus into the trap on open
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Small delay to allow animation to render focusable elements
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Fallback: focus the container itself
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && previouslyFocusedRef.current) {
      const el = previouslyFocusedRef.current;
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      });
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !containerRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const container = containerRef.current;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: wrap from first to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: wrap from last to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleKeyDown]);

  return containerRef;
}
