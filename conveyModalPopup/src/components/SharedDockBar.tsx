import { createElement, ReactElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DockItem, dockRegistry } from "../utils/dockRegistry";
import { MinimizedTab } from "./MinimizedTab";

let dockHost: HTMLDivElement | null = null;
let dockOwnerId: string | null = null;
const ownershipListeners = new Set<() => void>();

function getDockHost(): HTMLDivElement {
    if (!dockHost) {
        dockHost = document.createElement("div");
        dockHost.className = "convey-modal-dock-host";
        document.body.appendChild(dockHost);
    }
    return dockHost;
}

function notifyOwnershipChange(): void {
    ownershipListeners.forEach(listener => listener());
}

function claimDockOwnership(instanceId: string): boolean {
    if (dockOwnerId === null || dockOwnerId === instanceId) {
        dockOwnerId = instanceId;
        return true;
    }
    return false;
}

function releaseDockOwnership(instanceId: string): void {
    if (dockOwnerId === instanceId) {
        dockOwnerId = null;
        notifyOwnershipChange();
    }
}

export interface SharedDockBarProps {
    instanceId: string;
}

/**
 * Renders the shared bottom dock once. Only the owning widget instance portals the dock;
 * if that instance unmounts, another instance claims ownership.
 */
export function SharedDockBar({ instanceId }: SharedDockBarProps): ReactElement | null {
    const [items, setItems] = useState<DockItem[]>(() => dockRegistry.getItems());
    const [isOwner, setIsOwner] = useState(() => claimDockOwnership(instanceId));

    useEffect(() => {
        const tryClaim = (): void => {
            setIsOwner(claimDockOwnership(instanceId));
        };

        tryClaim();
        ownershipListeners.add(tryClaim);
        const unsubscribe = dockRegistry.subscribe(setItems);

        return () => {
            ownershipListeners.delete(tryClaim);
            unsubscribe();
            releaseDockOwnership(instanceId);
        };
    }, [instanceId]);

    if (!isOwner || items.length === 0) {
        return null;
    }

    return createPortal(
        <div className="convey-modal-dock" role="toolbar" aria-label="Minimized modals">
            {items.map(item => (
                <MinimizedTab key={item.id} item={item} />
            ))}
        </div>,
        getDockHost()
    );
}
