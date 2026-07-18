import {
    CSSProperties,
    PointerEvent as ReactPointerEvent,
    ReactElement,
    ReactNode,
    useCallback,
    useRef,
    useState
} from "react";
import { createPortal } from "react-dom";

export type DockPosition = "left" | "right";

export type DragOffset = { x: number; y: number };

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
    enableDrag: boolean;
    dragOffset: DragOffset;
    onDragOffsetChange: (offset: DragOffset) => void;
    children?: ReactNode;
    onMinimize: () => void;
    onClose: () => void;
}

const HEADER_CLAMP_PX = 40;
const HEADER_HEIGHT_FALLBACK_PX = 44;

type DragSession = {
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    homeLeft: number;
    homeTop: number;
    panelWidth: number;
    headerHeight: number;
};

function clampOffset(next: DragOffset, session: DragSession): DragOffset {
    const { homeLeft, homeTop, panelWidth, headerHeight } = session;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Keep at least HEADER_CLAMP_PX of the panel's horizontal extent on-screen.
    const minX = HEADER_CLAMP_PX - panelWidth - homeLeft;
    const maxX = vw - HEADER_CLAMP_PX - homeLeft;

    // Keep at least HEADER_CLAMP_PX of the *header* (panel top) on-screen vertically.
    // Panel top = homeTop + y; require homeTop + y + headerHeight >= HEADER_CLAMP_PX
    // so the header cannot be dragged fully above the viewport.
    const minY = HEADER_CLAMP_PX - headerHeight - homeTop;
    const maxY = vh - HEADER_CLAMP_PX - homeTop;

    return {
        x: Math.min(maxX, Math.max(minX, next.x)),
        y: Math.min(maxY, Math.max(minY, next.y))
    };
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
    enableDrag,
    dragOffset,
    onDragOffsetChange,
    children,
    onMinimize,
    onClose
}: ModalPanelProps): ReactElement | null {
    const panelRef = useRef<HTMLElement | null>(null);
    const dragStartRef = useRef<DragSession | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleHeaderPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enableDrag || !visible) {
                return;
            }
            const target = event.target as HTMLElement | null;
            if (target?.closest("button")) {
                return;
            }
            if (event.button !== 0) {
                return;
            }

            const panel = panelRef.current;
            if (!panel) {
                return;
            }

            event.preventDefault();
            const rect = panel.getBoundingClientRect();
            const header = event.currentTarget;
            const headerHeight = header.getBoundingClientRect().height || HEADER_HEIGHT_FALLBACK_PX;

            dragStartRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                originX: dragOffset.x,
                originY: dragOffset.y,
                homeLeft: rect.left - dragOffset.x,
                homeTop: rect.top - dragOffset.y,
                panelWidth: rect.width,
                headerHeight
            };
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [dragOffset.x, dragOffset.y, enableDrag, visible]
    );

    const handleHeaderPointerMove = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            const drag = dragStartRef.current;
            if (!drag || drag.pointerId !== event.pointerId) {
                return;
            }

            const proposed = {
                x: drag.originX + (event.clientX - drag.startX),
                y: drag.originY + (event.clientY - drag.startY)
            };
            onDragOffsetChange(clampOffset(proposed, drag));
        },
        [onDragOffsetChange]
    );

    const endDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        const drag = dragStartRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }
        dragStartRef.current = null;
        setIsDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }, []);

    const handleLostPointerCapture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        const drag = dragStartRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }
        dragStartRef.current = null;
        setIsDragging(false);
    }, []);

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
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        ...(appearance.panelBoxShadow ? { boxShadow: appearance.panelBoxShadow } : {})
    };

    const overlayStyle: CSSProperties = {
        zIndex,
        backgroundColor: appearance.overlayColor
    };

    const headerStyle: CSSProperties = {
        backgroundColor: appearance.headerBackgroundColor,
        borderBottomColor: appearance.headerBorderColor,
        color: appearance.titleColor,
        cursor: enableDrag ? (isDragging ? "grabbing" : "grab") : undefined
    };

    const titleStyle: CSSProperties = {
        color: appearance.titleColor
    };

    const controlStyle: CSSProperties = {
        color: appearance.controlColor,
        cursor: "pointer"
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
                ref={panelRef}
                className={`convey-modal-panel convey-modal-panel--${dockPosition}${
                    isDragging ? " convey-modal-panel--dragging" : ""
                }`}
                style={panelStyle}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <header
                    className={`convey-modal-panel__header${
                        enableDrag ? " convey-modal-panel__header--draggable" : ""
                    }`}
                    style={headerStyle}
                    onPointerDown={handleHeaderPointerDown}
                    onPointerMove={handleHeaderPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onLostPointerCapture={handleLostPointerCapture}
                >
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
