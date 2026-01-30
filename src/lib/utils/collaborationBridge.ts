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
 * Logic to sync local Geoman changes to remote Y.js shared state
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
 * Get local feature IDs from Geoman
 */
function getLocalFeatureIds(geoman: Geoman): Set<string> {
    const localFeatures = geoman.features.exportGeoJson().features;
    return new Set(localFeatures.map((f) => f.id?.toString()).filter((id): id is string => !!id));
}

export function setupCollaborationBridge(
    mapLib: MapLibreMap,
    geoman: Geoman,
    yFeatures: Y.Map<GeoJSON.Feature>,
) {
    let isApplyingRemoteChange = false;
    let geomanReady = false;

    const gmanSync = createGeomanToYjsSync(yFeatures);

    const wrapHandler = <T>(handler: (e: T) => void) => (e: T) => {
        if (!isApplyingRemoteChange) handler(e);
    };

    /**
     * Full sync from Yjs to Geoman - used on initial load
     */
    const syncFromYjs = () => {
        if (!geomanReady) return;

        const remoteFeatureIds = new Set(yFeatures.keys());
        const localFeatures = geoman.features.exportGeoJson().features;
        const localFeatureIds = new Set(
            localFeatures.map((f) => f.id?.toString()).filter((id): id is string => !!id),
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
    };

    // Wait for Geoman to be fully loaded before syncing
    mapLib.once("gm:loaded", () => {
        geomanReady = true;
        syncFromYjs();
    });

    // Geoman -> Yjs listeners
    mapLib.on("gm:create", wrapHandler(gmanSync.onCreate));
    mapLib.on("gm:editend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:dragend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:rotateend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:cut", wrapHandler(gmanSync.onCut));
    mapLib.on("gm:remove", wrapHandler(gmanSync.onRemove));

    // Yjs -> Geoman observer
    const observer = (event: Y.YMapEvent<GeoJSON.Feature>) => {
        // Skip local changes - we already have them in Geoman
        if (event.transaction.local) return;
        // Skip if Geoman not ready yet
        if (!geomanReady) return;

        isApplyingRemoteChange = true;

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

        isApplyingRemoteChange = false;
    };

    yFeatures.observe(observer);

    return {
        destroy: () => {
            yFeatures.unobserve(observer);
        },
    };
}
