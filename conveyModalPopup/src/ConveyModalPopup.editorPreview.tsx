import { ReactElement } from "react";
import { ConveyModalPopupPreviewProps } from "../typings/ConveyModalPopupProps";

export function preview({ title, dockPosition, width, height, tabColor }: ConveyModalPopupPreviewProps): ReactElement {
    const resolvedTitle = typeof title === "string" && title.trim() ? title : "Convey Modal Popup";
    const resolvedColor = tabColor?.trim() || "#cfe8ff";

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
                    marginTop: 8
                }}
            >
                <header className="convey-modal-panel__header">
                    <h2 className="convey-modal-panel__title">{resolvedTitle}</h2>
                </header>
                <div className="convey-modal-panel__body">
                    <em>Content dropzone</em>
                </div>
            </div>
            <div className="convey-modal-dock" style={{ position: "relative", marginTop: 8 }}>
                <div className="convey-modal-dock-tab" style={{ backgroundColor: resolvedColor }}>
                    <span className="convey-modal-dock-tab__title">{resolvedTitle}</span>
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ConveyModalPopup.css");
}
