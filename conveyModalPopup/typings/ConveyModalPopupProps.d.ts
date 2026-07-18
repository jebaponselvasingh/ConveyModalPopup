/**
 * This file was generated from ConveyModalPopup.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ObjectItem } from "mendix";
import { ComponentType, CSSProperties, ReactNode } from "react";

export type DockPositionEnum = "right" | "left";

export interface ConveyModalPopupContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    title?: DynamicValue<string>;
    trigger?: ReactNode;
    datasource?: DynamicValue<ObjectItem>;
    content?: ReactNode;
    isOpen?: EditableValue<boolean>;
    dockPosition: DockPositionEnum;
    width: string;
    height: string;
    topOffset: string;
    zIndex: number;
    enableDrag: boolean;
    iconClass: string;
    showOverlay: boolean;
    closeOnOverlayClick: boolean;
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
    panelBoxShadow: string;
    tabColor: string;
    tabTextColor: string;
    tabBorderColor: string;
    tabBorderWidth: string;
    tabBorderRadius: string;
    onOpen?: ActionValue;
    onClose?: ActionValue;
    onMinimize?: ActionValue;
    onMaximize?: ActionValue;
}

export interface ConveyModalPopupPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    title: string;
    trigger: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    datasource: {} | { caption: string } | { type: string } | null;
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    isOpen: string;
    dockPosition: DockPositionEnum;
    width: string;
    height: string;
    topOffset: string;
    zIndex: number | null;
    enableDrag: boolean;
    iconClass: string;
    showOverlay: boolean;
    closeOnOverlayClick: boolean;
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
    panelBoxShadow: string;
    tabColor: string;
    tabTextColor: string;
    tabBorderColor: string;
    tabBorderWidth: string;
    tabBorderRadius: string;
    onOpen: {} | null;
    onClose: {} | null;
    onMinimize: {} | null;
    onMaximize: {} | null;
}
