import { CSSProperties, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

export type DockPosition = "left" | "right";

export interface PanelAppearance {
    overlayColor: string;
    panelBackgroundColor: string;
    headerBackgroundColor: string;
    bodyBackgroundColor: string;
    titleColor: string;
    controlColor: string;
    headerBorderColor: string;
    panelBorderColor: string;
    panelBorderWidth: string;
    panelBorderRadius: string;
    panelBoxShadow?: string;
}

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
    appearance: PanelAppearance;
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
    appearance,
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
        [dockPosition]: 0,
        backgroundColor: appearance.panelBackgroundColor,
        borderColor: appearance.panelBorderColor,
        borderWidth: appearance.panelBorderWidth,
        borderStyle: appearance.panelBorderWidth === "0" || appearance.panelBorderWidth === "0px" ? "none" : "solid",
        borderRadius: appearance.panelBorderRadius,
        ...(appearance.panelBoxShadow ? { boxShadow: appearance.panelBoxShadow } : {})
    };

    const overlayStyle: CSSProperties = {
        zIndex,
        backgroundColor: appearance.overlayColor
    };

    const headerStyle: CSSProperties = {
        backgroundColor: appearance.headerBackgroundColor,
        borderBottomColor: appearance.headerBorderColor,
        color: appearance.titleColor
    };

    const titleStyle: CSSProperties = {
        color: appearance.titleColor
    };

    const controlStyle: CSSProperties = {
        color: appearance.controlColor
    };

    const bodyStyle: CSSProperties = {
        backgroundColor: appearance.bodyBackgroundColor
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
                <header className="convey-modal-panel__header" style={headerStyle}>
                    <div className="convey-modal-panel__title-wrap">
                        {iconClass ? (
                            <span className={`convey-modal-panel__icon ${iconClass}`} style={titleStyle} aria-hidden />
                        ) : null}
                        <h2 className="convey-modal-panel__title" style={titleStyle}>
                            {title}
                        </h2>
                    </div>
                    <div className="convey-modal-panel__actions">
                        <button
                            type="button"
                            className="convey-modal-panel__btn"
                            style={controlStyle}
                            aria-label="Minimize"
                            title="Minimize"
                            onClick={onMinimize}
                        >
                            <span className="convey-modal-panel__minimize-icon" aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="convey-modal-panel__btn"
                            style={controlStyle}
                            aria-label="Close"
                            title="Close"
                            onClick={onClose}
                        >
                            <span className="convey-modal-panel__close-icon" aria-hidden />
                        </button>
                    </div>
                </header>
                <div className="convey-modal-panel__body" style={bodyStyle}>
                    {children}
                </div>
            </aside>
        </div>,
        document.body
    );
}
