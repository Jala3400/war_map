import { writable } from "svelte/store";

export interface KeymapAction {
    id: string;
    key: string;
    modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
    };
    description: string;
    category: "drawing" | "editing" | "navigation" | "general";
    handler: () => void;
}

export interface Keymap {
    [key: string]: KeymapAction;
}

export const keymapStore = writable<Keymap>({});
export const keymapEnabled = writable<boolean>(true);

/**
 * Register a new keymap action
 */
export function registerKeymap(action: KeymapAction) {
    keymapStore.update((keymap) => {
        const key = buildKeymapKey(action.key, action.modifiers);
        keymap[key] = action;
        return keymap;
    });
}

/**
 * Unregister a keymap action
 */
export function unregisterKeymap(id: string) {
    keymapStore.update((keymap) => {
        const key = Object.keys(keymap).find((k) => keymap[k].id === id);
        if (key) {
            delete keymap[key];
        }
        return keymap;
    });
}

/**
 * Build a keymap key from key and modifiers
 */
export function buildKeymapKey(
    key: string,
    modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
    },
): string {
    const parts: string[] = [];
    if (modifiers?.ctrl) parts.push("ctrl");
    if (modifiers?.shift) parts.push("shift");
    if (modifiers?.alt) parts.push("alt");
    parts.push(key.toLowerCase());
    return parts.join("+");
}

/**
 * Clear all keymaps
 */
export function clearKeymaps() {
    keymapStore.set({});
}
