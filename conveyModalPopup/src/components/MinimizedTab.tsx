import { CSSProperties, ReactElement } from "react";
import { DockItem } from "../utils/dockRegistry";

export interface MinimizedTabProps {
    item: DockItem;
}

function MaximizeIcon(): ReactElement {
    return (
        <svg
            className="convey-modal-dock-tab__maximize-icon"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path
                d="M7 2.5H9.5V5M9.5 2.5L6.5 5.5M5 9.5H2.5V7M2.5 9.5L5.5 6.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function MinimizedTab({ item }: MinimizedTabProps): ReactElement {
    const tabStyle: CSSProperties = {
        backgroundColor: item.tabColor,
        color: item.tabTextColor,
        borderColor: item.tabBorderColor,
        borderWidth: item.tabBorderWidth,
        borderStyle: item.tabBorderWidth === "0" || item.tabBorderWidth === "0px" ? "none" : "solid",
        borderRadius: item.tabBorderRadius
    };

    const textStyle: CSSProperties = {
        color: item.tabTextColor
    };

    return (
        <div className="convey-modal-dock-tab" style={tabStyle} title={item.title}>
            {item.iconClass ? (
                <span className={`convey-modal-dock-tab__icon ${item.iconClass}`} style={textStyle} aria-hidden />
            ) : null}
            <span className="convey-modal-dock-tab__title" style={textStyle}>
                {item.title}
            </span>
            <button
                type="button"
                className="convey-modal-dock-tab__btn"
                style={textStyle}
                aria-label={`Maximize ${item.title}`}
                title="Maximize"
                onClick={item.onMaximize}
            >
                <MaximizeIcon />
            </button>
            <button
                type="button"
                className="convey-modal-dock-tab__btn"
                style={textStyle}
                aria-label={`Close ${item.title}`}
                title="Close"
                onClick={item.onClose}
            >
                <span className="convey-modal-dock-tab__close-icon" aria-hidden />
            </button>
        </div>
    );
}
