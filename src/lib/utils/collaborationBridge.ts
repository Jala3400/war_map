import type {
    FeatureCreatedFwdEvent,
    FeatureData,
    FeatureRemovedFwdEvent,
    FeatureUpdatedFwdEvent,
    GeoJsonImportFeature,
    Geoman,
} from "@geoman-io/maplibre-geoman-free";
import type { Map as MapLibreMap } from "maplibre-gl";
import type * as Y from "yjs";

/**
 * Get local feature IDs from Geoman
 */
function getLocalFeatureIds(geoman: Geoman): Set<string> {
    const localFeatures = geoman.features.exportGeoJson().features;
    return new Set(
        localFeatures
            .map((f) => f.id?.toString())
            .filter((id): id is string => !!id),
    );
}

/**
 * Wrap a handler to skip execution during remote changes
 */
function wrapHandler<T>(
    handler: (e: T) => void,
    isApplyingRemoteChange: () => boolean,
) {
    return (e: T) => {
        if (!isApplyingRemoteChange()) handler(e);
    };
}

/**
 * Create handlers for syncing Geoman changes to Yjs
 */
function createGeomanToYjsSync(yFeatures: Y.Map<GeoJSON.Feature>) {
    const upsertFeature = (feature: FeatureData) => {
        const geojson = feature.getGeoJson();
        if (!geojson.id) geojson.id = crypto.randomUUID();
        yFeatures.set(geojson.id.toString(), geojson);
    };

    const removeFeature = (feature: FeatureData) => {
        const id = feature.getGeoJson().id;
        if (id) yFeatures.delete(id.toString());
    };

    return {
        onCreate: (e: FeatureCreatedFwdEvent) => upsertFeature(e.feature),
        onUpdate: (e: FeatureUpdatedFwdEvent) => {
            if (e.feature) upsertFeature(e.feature);
        },
        onCut: (e: FeatureUpdatedFwdEvent) => {
            if (e.feature) upsertFeature(e.feature);
        },
        onRemove: (e: FeatureRemovedFwdEvent) => removeFeature(e.feature),
    };
}

/**
 * Perform initial full sync from Yjs to Geoman
 */
function syncFromYjs(geoman: Geoman, yFeatures: Y.Map<GeoJSON.Feature>) {
    const remoteFeatureIds = new Set(yFeatures.keys());
    const localFeatures = geoman.features.exportGeoJson().features;
    const localFeatureIds = new Set(
        localFeatures
            .map((f) => f.id?.toString())
            .filter((id): id is string => !!id),
    );

    // Remove local features not in remote
    for (const localFeature of localFeatures) {
        const id = localFeature.id?.toString();
        if (id && !remoteFeatureIds.has(id)) {
            geoman.features.delete(id);
        }
    }

    // Add remote features not already in local
    for (const [id, geojson] of yFeatures.entries()) {
        if (!localFeatureIds.has(id)) {
            geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
        }
    }
}

/**
 * Create observer for syncing Yjs changes to Geoman
 */
function createYjsToGeomanObserver(
    geoman: Geoman,
    yFeatures: Y.Map<GeoJSON.Feature>,
    isApplyingRemoteChange: { value: boolean },
    geomanReady: { value: boolean },
) {
    return (event: Y.YMapEvent<GeoJSON.Feature>) => {
        // Skip local changes - we already have them in Geoman
        if (event.transaction.local) return;
        // Skip if Geoman not ready yet
        if (!geomanReady.value) return;

        isApplyingRemoteChange.value = true;

        const localFeatureIds = getLocalFeatureIds(geoman);

        event.keysChanged.forEach((key) => {
            const geojson = yFeatures.get(key);
            const existsLocally = localFeatureIds.has(key);

            if (geojson) {
                // Feature added or updated
                // Only delete if it exists locally (update case)
                if (existsLocally) {
                    geoman.features.delete(key);
                }
                geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
            } else if (existsLocally) {
                // Feature removed - only delete if we have it locally
                geoman.features.delete(key);
            }
        });

        isApplyingRemoteChange.value = false;
    };
}

export function setupCollaborationBridge(
    mapLib: MapLibreMap,
    geoman: Geoman,
    yFeatures: Y.Map<GeoJSON.Feature>,
) {
    let isApplyingRemoteChange = { value: false };
    let geomanReady = { value: false };

    const gmanSync = createGeomanToYjsSync(yFeatures);
    const yjsObserver = createYjsToGeomanObserver(
        geoman,
        yFeatures,
        isApplyingRemoteChange,
        geomanReady,
    );

    // Wait for Geoman to be fully loaded before syncing
    mapLib.once("gm:loaded", () => {
        geomanReady.value = true;
        syncFromYjs(geoman, yFeatures);
    });

    // Geoman -> Yjs listeners
    mapLib.on(
        "gm:create",
        wrapHandler(gmanSync.onCreate, () => isApplyingRemoteChange.value),
    );
    mapLib.on(
        "gm:editend",
        wrapHandler(gmanSync.onUpdate, () => isApplyingRemoteChange.value),
    );
    mapLib.on(
        "gm:dragend",
        wrapHandler(gmanSync.onUpdate, () => isApplyingRemoteChange.value),
    );
    mapLib.on(
        "gm:rotateend",
        wrapHandler(gmanSync.onUpdate, () => isApplyingRemoteChange.value),
    );
    mapLib.on(
        "gm:cut",
        wrapHandler(gmanSync.onCut, () => isApplyingRemoteChange.value),
    );
    mapLib.on(
        "gm:remove",
        wrapHandler(gmanSync.onRemove, () => isApplyingRemoteChange.value),
    );

    // Yjs -> Geoman observer
    yFeatures.observe(yjsObserver);

    return {
        destroy: () => {
            yFeatures.unobserve(yjsObserver);
        },
    };
}
