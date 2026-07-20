export type PanelDockSide = "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type DockPosition = "left" | "right" | "top" | "bottom";
export type DockAlign = "left" | "right";

export type PanelEntry = {
    id: string;
    side: PanelDockSide;
    /** Pixel width used for horizontal beside-tiling. */
    sizePx: number;
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

/** Registry key for tiling: side docks use the edge; top/bottom include corner align. */
export function resolveRegistrySide(position: DockPosition, align: DockAlign): PanelDockSide {
    if (position === "left" || position === "right") {
        return position;
    }
    return `${position}-${align}`;
}

/**
 * Sum of widths (+ gap) of panels registered before this one on the same home.
 * Caps so at least MIN_VISIBLE_PX of the panel remains on-screen.
 */
export function computeInset(id: string, side: PanelDockSide, ownSizePx: number): number {
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
        inset += panel.sizePx + GAP_PX;
    }

    if (typeof window !== "undefined" && ownSizePx > 0) {
        const maxInset = Math.max(0, window.innerWidth - MIN_VISIBLE_PX);
        inset = Math.min(inset, maxInset);
    }

    return inset;
}

export const panelRegistry = {
    register(id: string, side: PanelDockSide, sizePx: number): void {
        const existing = panels.get(id);
        if (existing) {
            panels.set(id, { ...existing, side, sizePx: sizePx || existing.sizePx });
        } else {
            panels.set(id, { id, side, sizePx, order: nextOrder++ });
        }
        notify();
    },

    updateSize(id: string, sizePx: number): void {
        const existing = panels.get(id);
        if (!existing || existing.sizePx === sizePx || sizePx <= 0) {
            return;
        }
        panels.set(id, { ...existing, sizePx });
        notify();
    },

    unregister(id: string): void {
        if (!panels.has(id)) {
            return;
        }
        panels.delete(id);
        notify();
    },

    getInset(id: string, side: PanelDockSide, ownSizePx: number): number {
        return computeInset(id, side, ownSizePx);
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        listener();
        return () => {
            listeners.delete(listener);
        };
    }
};
