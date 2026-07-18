import { ConveyModalPopupPreviewProps } from "../typings/ConveyModalPopupProps";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[];
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[];
};

export type Problem = {
    property?: string;
    severity?: "error" | "warning" | "deprecation";
    message: string;
    studioMessage?: string;
    url?: string;
    studioUrl?: string;
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number;
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string;
    data?: string;
    property?: object;
    width?: number;
    height?: number;
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[];
    borders?: boolean;
    borderRadius?: number;
    backgroundColor?: string;
    borderWidth?: number;
    padding?: number;
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow";
};

type TextProps = BaseProps & {
    type: "Text";
    content: string;
    fontSize?: number;
    fontColor?: string;
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object;
    placeholder: string;
    showDataSourceHeader?: boolean;
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object;
    child: PreviewProps;
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null;
    child?: PreviewProps;
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(_values: ConveyModalPopupPreviewProps, defaultProperties: Properties): Properties {
    return defaultProperties;
}

export function check(values: ConveyModalPopupPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (!values.width?.trim()) {
        errors.push({
            property: "width",
            severity: "error",
            message: "Width is required (e.g. 480px or 40%)."
        });
    }

    if (!values.height?.trim()) {
        errors.push({
            property: "height",
            severity: "error",
            message: "Height is required (e.g. 100% or 90vh)."
        });
    }

    const hasTrigger = values.trigger && values.trigger.widgetCount > 0;
    const hasIsOpen = Boolean(values.isOpen);
    if (!hasTrigger && !hasIsOpen) {
        errors.push({
            property: "trigger",
            severity: "warning",
            message: "Configure a Trigger dropzone or an Is open attribute so the modal can be opened."
        });
    }

    return errors;
}

export function getPreview(values: ConveyModalPopupPreviewProps, _isDarkMode: boolean): PreviewProps {
    const title = typeof values.title === "string" && values.title.trim() ? values.title : "Convey Modal Popup";

    return {
        type: "Container",
        borders: true,
        borderRadius: 6,
        padding: 8,
        children: [
            {
                type: "Text",
                content: `${title} (${values.dockPosition || "right"})`,
                bold: true,
                fontSize: 12
            },
            {
                type: "DropZone",
                property: values.trigger,
                placeholder: "Trigger (click to open)"
            },
            {
                type: "DropZone",
                property: values.content,
                placeholder: "Modal content"
            },
            {
                type: "Text",
                content: `Size: ${values.width || "480px"} × ${values.height || "100%"}`,
                fontSize: 10,
                fontColor: "#64748b"
            }
        ]
    };
}

export function getCustomCaption(values: ConveyModalPopupPreviewProps, _platform: Platform): string {
    if (typeof values.title === "string" && values.title.trim()) {
        return values.title;
    }
    return "Convey Modal Popup";
}
