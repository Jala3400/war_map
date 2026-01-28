export enum MapStyle {
    Bright = "bright",
    Dark = "dark",
    Positron = "positron",
    Liberty = "liberty",
}

export interface MapStyleOption {
    label: string;
    url: string;
}

export const MAP_STYLES: Record<MapStyle, MapStyleOption> = {
    [MapStyle.Bright]: {
        label: "Bright",
        url: "https://tiles.openfreemap.org/styles/bright",
    },
    [MapStyle.Dark]: {
        label: "Dark",
        url: "https://tiles.openfreemap.org/styles/dark",
    },
    [MapStyle.Positron]: {
        label: "Positron",
        url: "https://tiles.openfreemap.org/styles/positron",
    },
    [MapStyle.Liberty]: {
        label: "Liberty",
        url: "https://tiles.openfreemap.org/styles/liberty",
    },
};
