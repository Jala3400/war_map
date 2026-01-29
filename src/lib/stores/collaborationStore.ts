import { browser } from "$app/environment";
import { writable } from "svelte/store";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

export interface CollaborationState {
    doc: Y.Doc | null;
    provider: WebrtcProvider | null;
    features: Y.Map<any> | null;
    roomName: string | null;
}

const initialState: CollaborationState = {
    doc: null,
    provider: null,
    features: null,
    roomName: null,
};

export const collaborationStore = writable<CollaborationState>(initialState);

export function initCollaboration(room: string) {
    if (!browser) return;

    const doc = new Y.Doc();

    // Default signaling servers are used if none are provided
    const provider = new WebrtcProvider(room, doc);

    const features = doc.getMap("geojson-features");

    collaborationStore.set({
        doc,
        provider,
        features,
        roomName: room,
    });

    return { doc, provider, features };
}
