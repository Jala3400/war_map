import { writable } from "svelte/store";
import { MapStyle } from "../types/map";

export const currentStyle = writable<MapStyle>(MapStyle.Dark);
