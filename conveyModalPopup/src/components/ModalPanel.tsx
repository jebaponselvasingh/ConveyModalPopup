import { CSSProperties, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

export type DockPosition = "left" | "right";

export interface ModalPanelProps {
    title: string;
    iconClass?: string;
    dockPosition: DockPosition;
    width: string;
    height: string;
    topOffset: string;
    zIndex: number;
    showOverlay: boolean;
    closeOnOverlayClick: boolean;
    visible: boolean;
    children?: ReactNode;
    onMinimize: () => void;
    onClose: () => void;
}

export function ModalPanel({
    title,
    iconClass,
    dockPosition,
    width,
    height,
    topOffset,
    zIndex,
    showOverlay,
    closeOnOverlayClick,
    visible,
    children,
    onMinimize,
    onClose
}: ModalPanelProps): ReactElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    const panelStyle: CSSProperties = {
        width,
        height,
        top: topOffset,
        zIndex: zIndex + 1,
        [dockPosition]: 0
    };

    const overlayStyle: CSSProperties = {
        zIndex
    };

    return createPortal(
        <div
            className={`convey-modal-portal${
                visible ? " convey-modal-portal--visible" : " convey-modal-portal--hidden"
            }`}
            aria-hidden={!visible}
        >
            {showOverlay ? (
                <div
                    className="convey-modal-overlay"
                    style={overlayStyle}
                    onClick={closeOnOverlayClick ? onClose : undefined}
                />
            ) : null}
            <aside
                className={`convey-modal-panel convey-modal-panel--${dockPosition}`}
                style={panelStyle}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <header className="convey-modal-panel__header">
                    <div className="convey-modal-panel__title-wrap">
                        {iconClass ? <span className={`convey-modal-panel__icon ${iconClass}`} aria-hidden /> : null}
                        <h2 className="convey-modal-panel__title">{title}</h2>
                    </div>
                    <div className="convey-modal-panel__actions">
                        <button
                            type="button"
                            className="convey-modal-panel__btn"
                            aria-label="Minimize"
                            title="Minimize"
                            onClick={onMinimize}
                        >
                            <span className="convey-modal-panel__minimize-icon" aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="convey-modal-panel__btn"
                            aria-label="Close"
                            title="Close"
                            onClick={onClose}
                        >
                            <span className="convey-modal-panel__close-icon" aria-hidden />
                        </button>
                    </div>
                </header>
                <div className="convey-modal-panel__body">{children}</div>
            </aside>
        </div>,
        document.body
    );
}
