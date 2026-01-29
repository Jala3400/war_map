import type {
    Geoman,
    FeatureCreatedFwdEvent,
    FeatureUpdatedFwdEvent,
    FeatureRemovedFwdEvent,
    GeoJsonImportFeature,
} from "@geoman-io/maplibre-geoman-free";
import type * as Y from "yjs";
import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Logic to sync local Geoman changes to remote Y.js shared state
 */
function createGeomanToYjsSync(yFeatures: Y.Map<any>) {
    const upsertFeature = (feature: any) => {
        const geojson = feature.getGeoJson();
        if (!geojson.id) geojson.id = crypto.randomUUID();
        yFeatures.set(geojson.id.toString(), geojson);
    };

    const removeFeature = (feature: any) => {
        const id = feature.getGeoJson().id;
        if (id) yFeatures.delete(id.toString());
    };

    return {
        onCreate: (e: FeatureCreatedFwdEvent) => upsertFeature(e.feature),
        onUpdate: (e: FeatureUpdatedFwdEvent | { feature: any }) => {
            if (e.feature) upsertFeature(e.feature);
        },
        onCut: (e: { features: any[] }) => {
            if (e.features && Array.isArray(e.features)) {
                e.features.forEach(upsertFeature);
            }
        },
        onRemove: (e: FeatureRemovedFwdEvent) => removeFeature(e.feature),
    };
}

/**
 * Logic to sync remote Y.js shared state to local Geoman instance
 */
function createYjsToGeomanSync(geoman: Geoman, yFeatures: Y.Map<any>) {
    return () => {
        const remoteFeatureIds = new Set(yFeatures.keys());
        const localFeatures = geoman.features.exportGeoJson().features;
        const localFeatureIds = new Set(
            localFeatures.map((f: any) => f.id?.toString()),
        );

        // Remove local features not in remote
        for (const localFeature of localFeatures) {
            const id = localFeature.id?.toString();
            if (id && !remoteFeatureIds.has(id)) {
                geoman.features.delete(id);
            }
        }

        // Add or update remote features to local
        for (const [id, geojson] of yFeatures.entries()) {
            if (localFeatureIds.has(id)) {
                geoman.features.delete(id);
            }
            geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
        }
    };
}

export function setupCollaborationBridge(
    mapLib: MapLibreMap,
    geoman: Geoman,
    yFeatures: Y.Map<any>,
) {
    let isApplyingRemoteChange = false;

    const gmanSync = createGeomanToYjsSync(yFeatures);
    const syncFromYjs = createYjsToGeomanSync(geoman, yFeatures);

    const wrapHandler = (handler: Function) => (e: any) => {
        if (!isApplyingRemoteChange) handler(e);
    };

    // Geoman -> Yjs listeners
    mapLib.on("gm:create", wrapHandler(gmanSync.onCreate));
    mapLib.on("gm:editend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:dragend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:rotateend", wrapHandler(gmanSync.onUpdate));
    mapLib.on("gm:cut", wrapHandler(gmanSync.onCut));
    mapLib.on("gm:remove", wrapHandler(gmanSync.onRemove));

    // Yjs -> Geoman observer
    const observer = () => {
        isApplyingRemoteChange = true;
        syncFromYjs();
        isApplyingRemoteChange = false;
    };

    yFeatures.observe(observer);
    syncFromYjs(); // Initial sync

    return {
        destroy: () => {
            yFeatures.unobserve(observer);
        },
    };
}
