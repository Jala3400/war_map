import { get } from "svelte/store";
import {
    keymapStore,
    keymapEnabled,
    buildKeymapKey,
} from "../stores/keymapStore";

/**
 * Handle keyboard events and trigger registered keymap actions
 */
export function handleKeyPress(event: KeyboardEvent): boolean {
    // Check if keymaps are enabled
    if (!get(keymapEnabled)) {
        return false;
    }

    // Ignore if typing in input fields
    const target = event.target as HTMLElement;
    if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
    ) {
        return false;
    }

    const keymap = get(keymapStore);
    const key = buildKeymapKey(event.key, {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
    });

    const action = keymap[key];
    if (action) {
        event.preventDefault();
        event.stopPropagation();
        action.handler();
        return true;
    }

    return false;
}

/**
 * Get formatted key display for UI
 */
export function formatKeyDisplay(
    key: string,
    modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
    },
): string {
    const parts: string[] = [];
    if (modifiers?.ctrl) parts.push("Ctrl");
    if (modifiers?.shift) parts.push("Shift");
    if (modifiers?.alt) parts.push("Alt");
    parts.push(key.toUpperCase());
    return parts.join("+");
}
