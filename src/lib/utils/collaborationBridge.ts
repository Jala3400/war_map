import type {
    Geoman,
    FeatureCreatedFwdEvent,
    FeatureUpdatedFwdEvent,
    FeatureRemovedFwdEvent,
    GeoJsonImportFeature,
} from "@geoman-io/maplibre-geoman-free";
import type * as Y from "yjs";
import type { Map as MapLibreMap } from "maplibre-gl";

export function setupCollaborationBridge(
    mapLib: MapLibreMap,
    geoman: Geoman,
    yFeatures: Y.Map<any>,
) {
    let isApplyingRemoteChange = false;

    // --- Geoman -> Y.js ---

    mapLib.on("gm:create", (e: FeatureCreatedFwdEvent) => {
        if (isApplyingRemoteChange) return;
        const geojson = e.feature.getGeoJson();
        if (!geojson.id) geojson.id = crypto.randomUUID();
        yFeatures.set(geojson.id.toString(), geojson);
    });

    mapLib.on("gm:editend", (e: FeatureUpdatedFwdEvent) => {
        if (isApplyingRemoteChange) return;
        const feature = e.feature;
        if (!feature) return;
        const geojson = feature.getGeoJson();
        if (geojson.id) {
            yFeatures.set(geojson.id.toString(), geojson);
        }
    });

    mapLib.on("gm:dragend", (e: any) => {
        if (isApplyingRemoteChange) return;
        const feature = e.feature;
        if (!feature) return;
        const geojson = feature.getGeoJson();
        if (geojson.id) {
            yFeatures.set(geojson.id.toString(), geojson);
        }
    });

    mapLib.on("gm:rotateend", (e: any) => {
        if (isApplyingRemoteChange) return;
        const feature = e.feature;
        if (!feature) return;
        const geojson = feature.getGeoJson();
        if (geojson.id) {
            yFeatures.set(geojson.id.toString(), geojson);
        }
    });

    mapLib.on("gm:cut", (e: any) => {
        if (isApplyingRemoteChange) return;
        if (e.features && Array.isArray(e.features)) {
            for (const feature of e.features) {
                const geojson = feature.getGeoJson();
                if (!geojson.id) geojson.id = crypto.randomUUID();
                yFeatures.set(geojson.id.toString(), geojson);
            }
        }
    });

    mapLib.on("gm:remove", (e: FeatureRemovedFwdEvent) => {
        if (isApplyingRemoteChange) return;
        const id = e.feature.getGeoJson().id;
        if (id) {
            yFeatures.delete(id.toString());
        }
    });

    // --- Y.js -> Geoman ---

    const syncFromYjs = () => {
        isApplyingRemoteChange = true;

        const remoteFeatureIds = new Set(yFeatures.keys());
        const localFeatures = geoman.features.exportGeoJson().features;
        const localFeatureIds = new Set(
            localFeatures.map((f: any) => f.id?.toString()),
        );

        // Remove features that exist locally but not in Yjs
        for (const localFeature of localFeatures) {
            const id = localFeature.id?.toString();
            if (id && !remoteFeatureIds.has(id)) {
                geoman.features.delete(id);
            }
        }

        // Add or update features from Yjs
        for (const [id, geojson] of yFeatures.entries()) {
            if (localFeatureIds.has(id)) {
                // Update existing feature: remove then re-add
                geoman.features.delete(id);
                geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
            } else {
                // Add new feature
                geoman.features.importGeoJson(geojson as GeoJsonImportFeature);
            }
        }

        isApplyingRemoteChange = false;
    };

    yFeatures.observe(() => {
        syncFromYjs();
    });

    // Initial sync
    syncFromYjs();

    return {
        destroy: () => {
            yFeatures.unobserve(syncFromYjs);
        },
    };
}
