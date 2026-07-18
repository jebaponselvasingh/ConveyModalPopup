import { DragOffset } from "../components/ModalPanel";

export type StoredModalUiState = "closed" | "maximized" | "minimized";

export type StoredModalState = {
    uiState: StoredModalUiState;
    dragOffset: DragOffset;
    savedAt: number;
};

/** Entries older than this are treated as stale (real page navigation). */
const TTL_MS = 2000;

const store = new Map<string, StoredModalState>();

export const modalStateStore = {
    save(name: string, uiState: StoredModalUiState, dragOffset: DragOffset): void {
        if (uiState === "closed") {
            store.delete(name);
            return;
        }
        store.set(name, {
            uiState,
            dragOffset: { ...dragOffset },
            savedAt: Date.now()
        });
    },

    /**
     * Returns a recent non-closed snapshot for this widget name, if any.
     * Consumes the entry so a later remount after a real navigation starts fresh.
     */
    take(name: string): StoredModalState | null {
        const entry = store.get(name);
        if (!entry) {
            return null;
        }
        store.delete(name);
        if (Date.now() - entry.savedAt > TTL_MS) {
            return null;
        }
        return entry;
    },

    clear(name: string): void {
        store.delete(name);
    }
};
