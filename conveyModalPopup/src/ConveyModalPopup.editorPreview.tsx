import { ReactElement } from "react";
import { ConveyModalPopupPreviewProps } from "../typings/ConveyModalPopupProps";

export function preview(props: ConveyModalPopupPreviewProps): ReactElement {
    const {
        title,
        dockPosition,
        width,
        height,
        tabColor,
        tabTextColor,
        tabBorderColor,
        tabBorderWidth,
        tabBorderRadius,
        panelBackgroundColor,
        headerBackgroundColor,
        bodyBackgroundColor,
        titleColor,
        panelBorderColor,
        panelBorderWidth,
        panelBorderRadius
    } = props;

    const resolvedTitle = typeof title === "string" && title.trim() ? title : "Convey Modal Popup";

    return (
        <div className="convey-modal-popup convey-modal-popup--preview">
            <div className="convey-modal-popup__trigger">
                <em>Trigger dropzone</em>
            </div>
            <div
                className={`convey-modal-panel convey-modal-panel--${dockPosition || "right"}`}
                style={{
                    position: "relative",
                    width: width || "240px",
                    height: height === "100%" ? "160px" : height || "160px",
                    marginTop: 8,
                    backgroundColor: panelBackgroundColor || "#ffffff",
                    borderColor: panelBorderColor || "#e5e7eb",
                    borderWidth: panelBorderWidth || "0",
                    borderStyle: "solid",
                    borderRadius: panelBorderRadius || "0"
                }}
            >
                <header
                    className="convey-modal-panel__header"
                    style={{ backgroundColor: headerBackgroundColor || "#ffffff" }}
                >
                    <h2 className="convey-modal-panel__title" style={{ color: titleColor || "#1a2b4b" }}>
                        {resolvedTitle}
                    </h2>
                </header>
                <div className="convey-modal-panel__body" style={{ backgroundColor: bodyBackgroundColor || "#ffffff" }}>
                    <em>Content dropzone</em>
                </div>
            </div>
            <div className="convey-modal-dock" style={{ position: "relative", marginTop: 8 }}>
                <div
                    className="convey-modal-dock-tab"
                    style={{
                        backgroundColor: tabColor || "#cfe8ff",
                        color: tabTextColor || "#1a2b4b",
                        borderColor: tabBorderColor || "rgba(26, 43, 75, 0.06)",
                        borderWidth: tabBorderWidth || "1px",
                        borderStyle: "solid",
                        borderRadius: tabBorderRadius || "8px"
                    }}
                >
                    <span className="convey-modal-dock-tab__title" style={{ color: tabTextColor || "#1a2b4b" }}>
                        {resolvedTitle}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ConveyModalPopup.css");
}
