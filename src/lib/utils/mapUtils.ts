import { browser } from "$app/environment";

/**
 * Gets the room name from URL or generates a new one and updates the URL
 */
export function getOrCreateRoom(): string {
    if (!browser) return "default";

    const urlParams = new URLSearchParams(window.location.search);
    let room = urlParams.get("room");
    
    if (!room) {
        room = `war-map-${Math.random().toString(36).substring(2, 9)}`;
        urlParams.set("room", room);
        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${urlParams.toString()}`,
        );
    }
    
    return room;
}
