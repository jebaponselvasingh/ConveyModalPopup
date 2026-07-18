export type PanelDockSide = "left" | "right";

export type PanelEntry = {
    id: string;
    side: PanelDockSide;
    widthPx: number;
    /** Registration order — earlier panels sit closer to the dock edge. */
    order: number;
};

type Listener = () => void;

const GAP_PX = 8;
const MIN_VISIBLE_PX = 40;

const panels = new Map<string, PanelEntry>();
const listeners = new Set<Listener>();
let nextOrder = 0;

function notify(): void {
    listeners.forEach(listener => listener());
}

function panelsOnSide(side: PanelDockSide): PanelEntry[] {
    return Array.from(panels.values())
        .filter(panel => panel.side === side)
        .sort((a, b) => a.order - b.order);
}

/**
 * Sum of widths (+ gap) of panels registered before this one on the same side.
 * Caps so at least MIN_VISIBLE_PX of the panel remains on-screen.
 */
export function computeInset(id: string, side: PanelDockSide, ownWidthPx: number): number {
    const siblings = panelsOnSide(side);
    const self = panels.get(id);
    let inset = 0;

    for (const panel of siblings) {
        if (self && panel.order >= self.order) {
            break;
        }
        if (panel.id === id) {
            break;
        }
        inset += panel.widthPx + GAP_PX;
    }

    if (typeof window !== "undefined" && ownWidthPx > 0) {
        const maxInset = Math.max(0, window.innerWidth - MIN_VISIBLE_PX);
        inset = Math.min(inset, maxInset);
    }

    return inset;
}

export const panelRegistry = {
    register(id: string, side: PanelDockSide, widthPx: number): void {
        const existing = panels.get(id);
        if (existing) {
            panels.set(id, { ...existing, side, widthPx: widthPx || existing.widthPx });
        } else {
            panels.set(id, { id, side, widthPx, order: nextOrder++ });
        }
        notify();
    },

    updateWidth(id: string, widthPx: number): void {
        const existing = panels.get(id);
        if (!existing || existing.widthPx === widthPx || widthPx <= 0) {
            return;
        }
        panels.set(id, { ...existing, widthPx });
        notify();
    },

    unregister(id: string): void {
        if (!panels.has(id)) {
            return;
        }
        panels.delete(id);
        notify();
    },

    getInset(id: string, side: PanelDockSide, ownWidthPx: number): number {
        return computeInset(id, side, ownWidthPx);
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        listener();
        return () => {
            listeners.delete(listener);
        };
    }
};
