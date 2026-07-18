export type DockItem = {
    id: string;
    title: string;
    tabColor: string;
    tabTextColor: string;
    tabBorderColor: string;
    tabBorderWidth: string;
    tabBorderRadius: string;
    iconClass?: string;
    onMaximize: () => void;
    onClose: () => void;
};

type Listener = (items: DockItem[]) => void;

const items = new Map<string, DockItem>();
const listeners = new Set<Listener>();

function notify(): void {
    const snapshot = Array.from(items.values());
    listeners.forEach(listener => listener(snapshot));
}

export const dockRegistry = {
    register(item: DockItem): void {
        items.set(item.id, item);
        notify();
    },

    update(id: string, patch: Partial<Omit<DockItem, "id">>): void {
        const existing = items.get(id);
        if (!existing) {
            return;
        }
        items.set(id, { ...existing, ...patch });
        notify();
    },

    unregister(id: string): void {
        if (!items.has(id)) {
            return;
        }
        items.delete(id);
        notify();
    },

    getItems(): DockItem[] {
        return Array.from(items.values());
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        listener(Array.from(items.values()));
        return () => {
            listeners.delete(listener);
        };
    },

    hasItems(): boolean {
        return items.size > 0;
    }
};
