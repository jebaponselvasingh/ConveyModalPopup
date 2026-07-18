import { KeyboardEvent, MouseEvent, ReactElement, useCallback, useEffect, useId, useRef, useState } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import classNames from "classnames";
import { ModalPanel } from "./components/ModalPanel";
import { SharedDockBar } from "./components/SharedDockBar";
import { dockRegistry } from "./utils/dockRegistry";
import { ConveyModalPopupContainerProps } from "../typings/ConveyModalPopupProps";

import "./ui/ConveyModalPopup.css";

type ModalUiState = "closed" | "maximized" | "minimized";

function readText(value?: DynamicValue<string>, fallback = ""): string {
    if (!value || value.status !== "available" || value.value == null) {
        return fallback;
    }
    return value.value;
}

function executeAction(action?: ActionValue): void {
    if (action && action.canExecute && !action.isExecuting) {
        action.execute();
    }
}

function setOpenAttribute(isOpen: EditableValue<boolean> | undefined, next: boolean): void {
    if (isOpen && !isOpen.readOnly) {
        isOpen.setValue(next);
    }
}

export function ConveyModalPopup(props: ConveyModalPopupContainerProps): ReactElement {
    const {
        class: className,
        style,
        tabIndex,
        title,
        trigger,
        content,
        isOpen,
        dockPosition,
        width,
        height,
        topOffset,
        zIndex,
        tabColor,
        iconClass,
        showOverlay,
        closeOnOverlayClick,
        onOpen,
        onClose,
        onMinimize,
        onMaximize
    } = props;

    const instanceId = useId();
    const [uiState, setUiState] = useState<ModalUiState>(() => (isOpen?.value === true ? "maximized" : "closed"));
    const uiStateRef = useRef(uiState);
    const skipAttributeSyncRef = useRef(false);
    const callbacksRef = useRef({
        onOpen,
        onClose,
        onMinimize,
        onMaximize,
        isOpen
    });

    useEffect(() => {
        uiStateRef.current = uiState;
    }, [uiState]);

    useEffect(() => {
        callbacksRef.current = { onOpen, onClose, onMinimize, onMaximize, isOpen };
    }, [isOpen, onClose, onMaximize, onMinimize, onOpen]);

    const resolvedTitle = readText(title, "Modal");
    const resolvedTabColor = tabColor?.trim() || "#cfe8ff";
    const resolvedIconClass = iconClass?.trim() || undefined;
    const resolvedWidth = width?.trim() || "480px";
    const resolvedHeight = height?.trim() || "100%";
    const resolvedTopOffset = topOffset?.trim() || "0";
    const resolvedZIndex = typeof zIndex === "number" ? zIndex : 1000;

    const openMaximized = useCallback(() => {
        const previous = uiStateRef.current;
        setUiState("maximized");
        skipAttributeSyncRef.current = true;
        setOpenAttribute(callbacksRef.current.isOpen, true);
        dockRegistry.unregister(instanceId);

        if (previous === "closed") {
            executeAction(callbacksRef.current.onOpen);
        } else if (previous === "minimized") {
            executeAction(callbacksRef.current.onMaximize);
        }
    }, [instanceId]);

    const close = useCallback(() => {
        setUiState("closed");
        skipAttributeSyncRef.current = true;
        setOpenAttribute(callbacksRef.current.isOpen, false);
        executeAction(callbacksRef.current.onClose);
        dockRegistry.unregister(instanceId);
    }, [instanceId]);

    const minimize = useCallback(() => {
        setUiState("minimized");
        executeAction(callbacksRef.current.onMinimize);
        dockRegistry.register({
            id: instanceId,
            title: resolvedTitle,
            tabColor: resolvedTabColor,
            iconClass: resolvedIconClass,
            onMaximize: openMaximized,
            onClose: close
        });
    }, [close, instanceId, openMaximized, resolvedIconClass, resolvedTabColor, resolvedTitle]);

    // Keep dock tab metadata in sync while minimized
    useEffect(() => {
        if (uiState !== "minimized") {
            return;
        }
        dockRegistry.update(instanceId, {
            title: resolvedTitle,
            tabColor: resolvedTabColor,
            iconClass: resolvedIconClass,
            onMaximize: openMaximized,
            onClose: close
        });
    }, [close, instanceId, openMaximized, resolvedIconClass, resolvedTabColor, resolvedTitle, uiState]);

    // Sync from Mendix boolean attribute
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        if (skipAttributeSyncRef.current) {
            skipAttributeSyncRef.current = false;
            return;
        }
        if (isOpen.status !== "available") {
            return;
        }
        const open = isOpen.value === true;
        if (open && uiStateRef.current === "closed") {
            setUiState("maximized");
            executeAction(onOpen);
        } else if (!open && uiStateRef.current !== "closed") {
            setUiState("closed");
            dockRegistry.unregister(instanceId);
            executeAction(onClose);
        }
    }, [instanceId, isOpen, onClose, onOpen]);

    useEffect(() => {
        return () => {
            dockRegistry.unregister(instanceId);
        };
    }, [instanceId]);

    const handleTriggerClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            if (uiStateRef.current === "closed" || uiStateRef.current === "minimized") {
                openMaximized();
            }
        },
        [openMaximized]
    );

    const handleTriggerKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (uiStateRef.current === "closed" || uiStateRef.current === "minimized") {
                    openMaximized();
                }
            }
        },
        [openMaximized]
    );

    return (
        <div className={classNames("convey-modal-popup", className)} style={style} tabIndex={tabIndex}>
            {trigger ? (
                <div
                    className="convey-modal-popup__trigger"
                    onClick={handleTriggerClick}
                    onKeyDown={handleTriggerKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    {trigger}
                </div>
            ) : null}

            {(uiState === "maximized" || uiState === "minimized") && (
                <ModalPanel
                    title={resolvedTitle}
                    iconClass={resolvedIconClass}
                    dockPosition={dockPosition}
                    width={resolvedWidth}
                    height={resolvedHeight}
                    topOffset={resolvedTopOffset}
                    zIndex={resolvedZIndex}
                    showOverlay={showOverlay}
                    closeOnOverlayClick={closeOnOverlayClick}
                    visible={uiState === "maximized"}
                    onMinimize={minimize}
                    onClose={close}
                >
                    {content}
                </ModalPanel>
            )}

            <SharedDockBar instanceId={instanceId} />
        </div>
    );
}
