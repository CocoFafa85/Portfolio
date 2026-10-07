import { describe, expect, it } from 'vitest';
import { nextTabIndex } from './tabs';

describe('nextTabIndex', () => {
    it('moves to the next tab with Down or Right, wrapping after the last', () => {
        // Arrange / Act / Assert
        expect(nextTabIndex('ArrowDown', 0, 3)).toBe(1);
        expect(nextTabIndex('ArrowRight', 1, 3)).toBe(2);
        expect(nextTabIndex('ArrowDown', 2, 3)).toBe(0);
    });

    it('moves to the previous tab with Up or Left, wrapping before the first', () => {
        // Arrange / Act / Assert
        expect(nextTabIndex('ArrowUp', 2, 3)).toBe(1);
        expect(nextTabIndex('ArrowLeft', 0, 3)).toBe(2);
    });

    it('jumps to the ends with Home and End', () => {
        // Arrange / Act / Assert
        expect(nextTabIndex('Home', 2, 3)).toBe(0);
        expect(nextTabIndex('End', 0, 3)).toBe(2);
    });

    it('ignores other keys and an empty list', () => {
        // Arrange / Act / Assert
        expect(nextTabIndex('Enter', 1, 3)).toBe(-1);
        expect(nextTabIndex('Tab', 1, 3)).toBe(-1);
        expect(nextTabIndex('ArrowDown', 0, 0)).toBe(-1);
    });
});
