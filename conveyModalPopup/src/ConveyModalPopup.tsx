import {
    createElement,
    KeyboardEvent as ReactKeyboardEvent,
    MouseEvent,
    ReactElement,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState
} from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import classNames from "classnames";
import { DragOffset, ModalPanel, MultiOpenBehavior } from "./components/ModalPanel";
import { SharedDockBar } from "./components/SharedDockBar";
import { dockRegistry } from "./utils/dockRegistry";
import { modalStack } from "./utils/modalStack";
import { modalStateStore, StoredModalUiState } from "./utils/modalStateStore";
import { ConveyModalPopupContainerProps } from "../typings/ConveyModalPopupProps";

import "./ui/ConveyModalPopup.css";

type ModalUiState = StoredModalUiState;

const ZERO_OFFSET: DragOffset = { x: 0, y: 0 };

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

function setOpenAttribute(isOpen: EditableValue<boolean> | undefined, next: boolean): boolean {
    if (isOpen && !isOpen.readOnly) {
        isOpen.setValue(next);
        return true;
    }
    return false;
}

const INTERACTIVE_SELECTOR = "button, a[href], input, select, textarea, [tabindex]";

function resolveMultiOpenBehavior(value: string | undefined): MultiOpenBehavior {
    return value === "overlap" ? "overlap" : "beside";
}

export function ConveyModalPopup(props: ConveyModalPopupContainerProps): ReactElement {
    const {
        name,
        class: className,
        style,
        tabIndex,
        title,
        trigger,
        content,
        isOpen,
        dockPosition,
        dockAlign,
        width,
        height,
        topOffset,
        zIndex,
        enableDrag,
        multiOpenBehavior: multiOpenBehaviorProp,
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

    const multiOpenBehavior = resolveMultiOpenBehavior((multiOpenBehaviorProp as string | undefined) ?? "beside");

    // useId alone is only unique within one React root; combining it with the widget
    // name keeps ids unique across roots and across repeated instances in list rows.
    const reactId = useId();
    const instanceId = `${name}-${reactId}`;

    // Restore open/minimized state after a Mendix remount (e.g. datasource refresh
    // that replaces the Data view object). Fresh navigations have no recent entry.
    const [restored] = useState(() => modalStateStore.take(name));
    const [uiState, setUiState] = useState<ModalUiState>(() => {
        if (restored) {
            return restored.uiState;
        }
        return isOpen?.value === true ? "maximized" : "closed";
    });
    const [dragOffset, setDragOffset] = useState<DragOffset>(() => (restored ? restored.dragOffset : ZERO_OFFSET));
    const [triggerHasInteractiveChild, setTriggerHasInteractiveChild] = useState(false);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const uiStateRef = useRef(uiState);
    const dragOffsetRef = useRef(dragOffset);
    const skipAttributeSyncRef = useRef(false);
    const restoredOpenRef = useRef(restored != null && restored.uiState !== "closed");
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
        dragOffsetRef.current = dragOffset;
    }, [dragOffset]);

    useEffect(() => {
        callbacksRef.current = { onOpen, onClose, onMinimize, onMaximize, isOpen };
    }, [isOpen, onClose, onMaximize, onMinimize, onOpen]);

    // Persist state so a remount within TTL can restore open/minimized + drag.
    useEffect(() => {
        modalStateStore.save(name, uiState, dragOffset);
    }, [dragOffset, name, uiState]);

    // After remount with restored open state, re-assert Is open = true when the
    // new object still has false (transient refresh), instead of closing.
    useEffect(() => {
        if (!restoredOpenRef.current || !isOpen) {
            return;
        }
        if (isOpen.status !== "available") {
            return;
        }
        if (isOpen.value !== true && uiStateRef.current !== "closed") {
            skipAttributeSyncRef.current = setOpenAttribute(isOpen, true);
        }
        restoredOpenRef.current = false;
    }, [isOpen]);

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
        skipAttributeSyncRef.current = setOpenAttribute(callbacksRef.current.isOpen, true);
        dockRegistry.unregister(instanceId);

        if (previous === "closed") {
            executeAction(callbacksRef.current.onOpen);
        } else if (previous === "minimized") {
            executeAction(callbacksRef.current.onMaximize);
        }
    }, [instanceId]);

    const close = useCallback(() => {
        setUiState("closed");
        setDragOffset(ZERO_OFFSET);
        skipAttributeSyncRef.current = setOpenAttribute(callbacksRef.current.isOpen, false);
        executeAction(callbacksRef.current.onClose);
        dockRegistry.unregister(instanceId);
        modalStateStore.clear(name);
    }, [instanceId, name]);

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

    // Keep dock tab registered while minimized (including after remount restore).
    useEffect(() => {
        if (uiState !== "minimized") {
            return;
        }
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
        // Ignore the first attribute sync after a remount restore — the new
        // object's Is open may still be false until we re-assert it.
        if (restoredOpenRef.current) {
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
            setDragOffset(ZERO_OFFSET);
            dockRegistry.unregister(instanceId);
            modalStateStore.clear(name);
            executeAction(onClose);
        }
    }, [instanceId, isOpen, name, onClose, onOpen]);

    useEffect(() => {
        return () => {
            // Snapshot latest state for a possible remount (refresh).
            modalStateStore.save(name, uiStateRef.current, dragOffsetRef.current);
            dockRegistry.unregister(instanceId);
            modalStack.remove(instanceId);
        };
    }, [instanceId, name]);

    // Track maximize order so Escape only closes the topmost open modal.
    useEffect(() => {
        if (uiState === "maximized") {
            modalStack.push(instanceId);
        } else {
            modalStack.remove(instanceId);
        }
    }, [instanceId, uiState]);

    useEffect(() => {
        if (uiState !== "maximized") {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape" && modalStack.isTop(instanceId)) {
                event.stopPropagation();
                close();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, instanceId, uiState]);

    // If the trigger contains its own interactive widget (e.g. an Action Button),
    // don't add role="button"/tabIndex on the wrapper to avoid nested controls.
    useEffect(() => {
        const node = triggerRef.current;
        if (!trigger || !node) {
            return;
        }
        const detect = (): void => {
            setTriggerHasInteractiveChild(node.querySelector(INTERACTIVE_SELECTOR) !== null);
        };
        detect();
        const observer = new MutationObserver(detect);
        observer.observe(node, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
        };
    }, [trigger]);

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
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
                    ref={triggerRef}
                    className="convey-modal-popup__trigger"
                    onClick={handleTriggerClick}
                    onKeyDown={triggerHasInteractiveChild ? undefined : handleTriggerKeyDown}
                    role={triggerHasInteractiveChild ? undefined : "button"}
                    tabIndex={triggerHasInteractiveChild ? undefined : 0}
                >
                    {trigger}
                </div>
            ) : null}

            {(uiState === "maximized" || uiState === "minimized") && (
                <ModalPanel
                    instanceId={instanceId}
                    title={resolvedTitle}
                    iconClass={resolvedIconClass}
                    dockPosition={dockPosition}
                    dockAlign={dockAlign}
                    multiOpenBehavior={multiOpenBehavior}
                    width={resolvedWidth}
                    height={resolvedHeight}
                    topOffset={resolvedTopOffset}
                    zIndex={resolvedZIndex}
                    showOverlay={showOverlay}
                    closeOnOverlayClick={closeOnOverlayClick}
                    appearance={appearance}
                    visible={uiState === "maximized"}
                    enableDrag={enableDrag}
                    dragOffset={dragOffset}
                    onDragOffsetChange={setDragOffset}
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
