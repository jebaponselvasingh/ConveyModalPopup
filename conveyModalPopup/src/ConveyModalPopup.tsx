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

function cssValue(value: string | undefined, fallback: string): string {
    const trimmed = value?.trim();
    return trimmed || fallback;
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
        iconClass,
        showOverlay,
        closeOnOverlayClick,
        overlayColor,
        panelBackgroundColor,
        headerBackgroundColor,
        bodyBackgroundColor,
        titleColor,
        controlColor,
        headerBorderColor,
        panelBorderColor,
        panelBorderWidth,
        panelBorderRadius,
        panelBoxShadow,
        tabColor,
        tabTextColor,
        tabBorderColor,
        tabBorderWidth,
        tabBorderRadius,
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
    const resolvedIconClass = iconClass?.trim() || undefined;
    const resolvedWidth = cssValue(width, "480px");
    const resolvedHeight = cssValue(height, "100%");
    const resolvedTopOffset = cssValue(topOffset, "0");
    const resolvedZIndex = typeof zIndex === "number" ? zIndex : 1000;

    const appearance = {
        overlayColor: cssValue(overlayColor, "rgba(15, 23, 42, 0.12)"),
        panelBackgroundColor: cssValue(panelBackgroundColor, "#ffffff"),
        headerBackgroundColor: cssValue(headerBackgroundColor, "#ffffff"),
        bodyBackgroundColor: cssValue(bodyBackgroundColor, "#ffffff"),
        titleColor: cssValue(titleColor, "#1a2b4b"),
        controlColor: cssValue(controlColor, "#1a2b4b"),
        headerBorderColor: cssValue(headerBorderColor, "#e8eaed"),
        panelBorderColor: cssValue(panelBorderColor, "#e5e7eb"),
        panelBorderWidth: cssValue(panelBorderWidth, "0"),
        panelBorderRadius: cssValue(panelBorderRadius, "0"),
        panelBoxShadow: panelBoxShadow?.trim() || undefined
    };

    const resolvedTabColor = cssValue(tabColor, "#cfe8ff");
    const resolvedTabTextColor = cssValue(tabTextColor, "#1a2b4b");
    const resolvedTabBorderColor = cssValue(tabBorderColor, "rgba(26, 43, 75, 0.06)");
    const resolvedTabBorderWidth = cssValue(tabBorderWidth, "1px");
    const resolvedTabBorderRadius = cssValue(tabBorderRadius, "8px");

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
            tabTextColor: resolvedTabTextColor,
            tabBorderColor: resolvedTabBorderColor,
            tabBorderWidth: resolvedTabBorderWidth,
            tabBorderRadius: resolvedTabBorderRadius,
            iconClass: resolvedIconClass,
            onMaximize: openMaximized,
            onClose: close
        });
    }, [
        close,
        instanceId,
        openMaximized,
        resolvedIconClass,
        resolvedTabBorderColor,
        resolvedTabBorderRadius,
        resolvedTabBorderWidth,
        resolvedTabColor,
        resolvedTabTextColor,
        resolvedTitle
    ]);

    useEffect(() => {
        if (uiState !== "minimized") {
            return;
        }
        dockRegistry.update(instanceId, {
            title: resolvedTitle,
            tabColor: resolvedTabColor,
            tabTextColor: resolvedTabTextColor,
            tabBorderColor: resolvedTabBorderColor,
            tabBorderWidth: resolvedTabBorderWidth,
            tabBorderRadius: resolvedTabBorderRadius,
            iconClass: resolvedIconClass,
            onMaximize: openMaximized,
            onClose: close
        });
    }, [
        close,
        instanceId,
        openMaximized,
        resolvedIconClass,
        resolvedTabBorderColor,
        resolvedTabBorderRadius,
        resolvedTabBorderWidth,
        resolvedTabColor,
        resolvedTabTextColor,
        resolvedTitle,
        uiState
    ]);

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
                    appearance={appearance}
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
