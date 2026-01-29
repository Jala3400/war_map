import type maplibregl from "maplibre-gl";
import { writable } from "svelte/store";
import { MapStyle } from "../types/map";

export const currentStyle = writable<MapStyle>(MapStyle.Dark);
export const mapInstance = writable<maplibregl.Map | undefined>(undefined);
