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
 * Sync a Geoman feature to Yjs
 */
function syncFeatureToYjs(
    feature: FeatureData,
    yFeatures: Y.Map<GeoJSON.Feature>,
) {
    const geojson = feature.getGeoJson();
    if (!geojson.id) geojson.id = crypto.randomUUID();
    yFeatures.set(geojson.id.toString(), geojson);
}

/**
 * Remove a feature from Yjs
 */
function removeFeatureFromYjs(
    feature: FeatureData,
    yFeatures: Y.Map<GeoJSON.Feature>,
) {
    const id = feature.getGeoJson().id;
    if (id) yFeatures.delete(id.toString());
}

/**
 * Get current feature IDs from Geoman
 */
function getGeomanFeatureIds(geoman: Geoman): Set<string> {
    return new Set(
        geoman.features
            .exportGeoJson()
            .features.map((f) => f.id?.toString())
            .filter((id): id is string => !!id),
    );
}

/**
 * Sync all features from Yjs to Geoman
 */
function syncYjsToGeoman(geoman: Geoman, yFeatures: Y.Map<GeoJSON.Feature>) {
    const remoteIds = new Set(yFeatures.keys());
    const localIds = getGeomanFeatureIds(geoman);

    // Remove local features not in remote
    for (const id of localIds) {
        if (!remoteIds.has(id)) geoman.features.delete(id);
    }

    // Add missing remote features
    for (const [id, geojson] of yFeatures.entries()) {
        if (!localIds.has(id)) {
            geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
        }
    }
}

export function setupCollaborationBridge(
    mapLib: MapLibreMap,
    geoman: Geoman,
    yFeatures: Y.Map<GeoJSON.Feature>,
) {
    let isApplyingRemoteChange = false;
    let geomanReady = false;

    // Geoman -> Yjs event handlers
    const handleCreate = (e: FeatureCreatedFwdEvent) => {
        if (!isApplyingRemoteChange) syncFeatureToYjs(e.feature, yFeatures);
    };

    const handleUpdate = (e: FeatureUpdatedFwdEvent) => {
        if (!isApplyingRemoteChange && e.feature)
            syncFeatureToYjs(e.feature, yFeatures);
    };

    const handleRemove = (e: FeatureRemovedFwdEvent) => {
        if (!isApplyingRemoteChange) removeFeatureFromYjs(e.feature, yFeatures);
    };

    // Yjs -> Geoman observer
    const yjsObserver = (event: Y.YMapEvent<GeoJSON.Feature>) => {
        if (event.transaction.local || !geomanReady) return;

        isApplyingRemoteChange = true;
        const localIds = getGeomanFeatureIds(geoman);

        event.keysChanged.forEach((key) => {
            const geojson = yFeatures.get(key);
            if (geojson) {
                if (localIds.has(key)) geoman.features.delete(key);
                geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
            } else if (localIds.has(key)) {
                geoman.features.delete(key);
            }
        });

        isApplyingRemoteChange = false;
    };

    // Setup listeners
    mapLib.once("gm:loaded", () => {
        geomanReady = true;
        syncYjsToGeoman(geoman, yFeatures);
    });

    mapLib.on("gm:create", handleCreate);
    mapLib.on("gm:editend", handleUpdate);
    mapLib.on("gm:dragend", handleUpdate);
    mapLib.on("gm:rotateend", handleUpdate);
    mapLib.on("gm:cut", handleUpdate);
    mapLib.on("gm:remove", handleRemove);

    yFeatures.observe(yjsObserver);

    return {
        destroy: () => yFeatures.unobserve(yjsObserver),
    };
}
