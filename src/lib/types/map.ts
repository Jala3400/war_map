export enum MapStyle {
    Bright = "bright",
    Dark = "dark",
    Positron = "positron",
    Liberty = "liberty",
}

export interface MapStyleOption {
    id: MapStyle;
    label: string;
    url: string;
}

export const MAP_STYLES: MapStyleOption[] = [
    {
        id: MapStyle.Bright,
        label: "Bright",
        url: "https://tiles.openfreemap.org/styles/bright",
    },
    {
        id: MapStyle.Dark,
        label: "Dark",
        url: "https://tiles.openfreemap.org/styles/dark",
    },
    {
        id: MapStyle.Positron,
        label: "Positron",
        url: "https://tiles.openfreemap.org/styles/positron",
    },
    {
        id: MapStyle.Liberty,
        label: "Liberty",
        url: "https://tiles.openfreemap.org/styles/liberty",
    },
];
