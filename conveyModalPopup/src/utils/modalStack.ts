/**
 * Tracks the order in which modal instances were maximized so the Escape key
 * only closes the topmost (most recently opened) modal when several are open.
 */
const stack: string[] = [];

export const modalStack = {
    push(id: string): void {
        this.remove(id);
        stack.push(id);
    },

    remove(id: string): void {
        const index = stack.indexOf(id);
        if (index !== -1) {
            stack.splice(index, 1);
        }
    },

    isTop(id: string): boolean {
        return stack.length > 0 && stack[stack.length - 1] === id;
    }
};
