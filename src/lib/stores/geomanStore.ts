import type { Geoman } from "@geoman-io/maplibre-geoman-free";
import { writable } from "svelte/store";

export const geomanInstance = writable<Geoman | undefined>(undefined);
