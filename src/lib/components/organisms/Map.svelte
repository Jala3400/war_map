<script lang="ts">
    import DrawingToolbar from "$lib/components/molecules/DrawingToolbar.svelte";
    import KeyboardShortcutsHelp from "$lib/components/molecules/KeyboardShortcutsHelp.svelte";
    import NavigationToolbar from "$lib/components/molecules/NavigationToolbar.svelte";
    import StyleSwitcher from "$lib/components/molecules/StyleSwitcher.svelte";
    import {
        collaborationStore,
        initCollaboration,
    } from "$lib/stores/collaborationStore";
    import { geomanInstance } from "$lib/stores/geomanStore";
    import { currentStyle, mapInstance } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";
    import { handleKeyPress } from "$lib/utils/keymapHandler";
    import {
        Geoman,
        type FeatureCreatedFwdEvent,
        type FeatureRemovedFwdEvent,
        type FeatureUpdatedFwdEvent,
        type GeoJsonImportFeature,
    } from "@geoman-io/maplibre-geoman-free";
    import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";

    let mapContainer = $state<HTMLDivElement>();
    let isApplyingRemoteChange = false;

    $effect(() => {
        if ($mapInstance && $currentStyle) {
            const styleUrl = MAP_STYLES[$currentStyle]?.url;
            if (styleUrl) {
                $mapInstance.setStyle(styleUrl);
            }
        }
    });

    onMount(() => {
        if (!mapContainer) return;

        // Get room from URL or default to random
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

        const { features: yFeatures, doc: yDoc } = initCollaboration(room)!;

        const initialStyle =
            MAP_STYLES[$currentStyle]?.url ||
            MAP_STYLES[MapStyle.Dark]?.url ||
            Object.values(MAP_STYLES)[0].url;

        const mapLib = new maplibregl.Map({
            container: mapContainer,
            style: initialStyle,
            center: [-3.7038, 40.4168], // Madrid
            zoom: 5,
            attributionControl: false, // Add manually to customize
        });

        mapLib.addControl(
            new maplibregl.AttributionControl({
                compact: false,
                customAttribution: "OpenFreeMap",
            }),
            "bottom-right",
        );

        const gmOptions = {
            settings: {
                controlsUiEnabledByDefault: false, // Hide all default controls
            },
        };

        // Initialize Geoman AFTER style loads (critical for remote styles)
        mapLib.on("style.load", async () => {
            const currentFeatures = $geomanInstance?.features.exportGeoJson();

            if ($geomanInstance) {
                await $geomanInstance.destroy();
            }

            const newGman = new Geoman(mapLib, gmOptions);
            geomanInstance.set(newGman);

            mapLib.once("render", () => {
                if (currentFeatures && currentFeatures.features.length > 0) {
                    $geomanInstance?.features.importGeoJson(currentFeatures);
                }
            });

            // Setup Collaboration Listeners
            mapLib.on("gm:create", (e: FeatureCreatedFwdEvent) => {
                if (isApplyingRemoteChange) return;
                const feature = e.feature;
                const geojson = feature.getGeoJson();
                // Ensure ID exists
                if (!geojson.id) geojson.id = crypto.randomUUID();
                yFeatures.set(geojson.id.toString(), geojson);
            });

            mapLib.on("gm:edit", (e: FeatureUpdatedFwdEvent) => {
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

            mapLib.on("gm:remove", (e: FeatureRemovedFwdEvent) => {
                if (isApplyingRemoteChange) return;
                const id = e.feature.getGeoJson().id;
                if (id) {
                    yFeatures.delete(id.toString());
                }
            });

            // Sync initial state from Yjs to Geoman
            const syncFromYjs = () => {
                isApplyingRemoteChange = true;
                
                const remoteFeatureIds = new Set(yFeatures.keys());
                const localFeatures = newGman.features.exportGeoJson().features;
                const localFeatureIds = new Set(localFeatures.map((f: any) => f.id?.toString()));

                // Remove features that exist locally but not in Yjs
                for (const localFeature of localFeatures) {
                    const id = localFeature.id?.toString();
                    if (id && !remoteFeatureIds.has(id)) {
                        newGman.features.delete(id);
                    }
                }

                // Add or update features from Yjs
                for (const [id, geojson] of yFeatures.entries()) {
                    if (localFeatureIds.has(id)) {
                        // Update existing feature: remove then re-add
                        newGman.features.delete(id);
                        newGman.features.importGeoJson(geojson as GeoJsonImportFeature);
                    } else {
                        // Add new feature
                        newGman.features.importGeoJson(geojson as GeoJsonImportFeature);
                    }
                }

                isApplyingRemoteChange = false;
            };

            // Watch for remote changes
            yFeatures.observe(() => {
                syncFromYjs();
            });

            // Initial sync
            syncFromYjs();
        });

        mapInstance.set(mapLib);

        // Setup keyboard event listener
        const keydownHandler = (e: KeyboardEvent) => handleKeyPress(e);
        window.addEventListener("keydown", keydownHandler);

        return () => {
            window.removeEventListener("keydown", keydownHandler);
            mapLib.remove();
            $collaborationStore.provider?.destroy();
            $collaborationStore.doc?.destroy();
        };
    });
</script>

<div bind:this={mapContainer} class="map-container">
    <DrawingToolbar />
    <NavigationToolbar />
    <StyleSwitcher />
    <KeyboardShortcutsHelp />
</div>

<style>
    .map-container {
        height: 100vh;
        width: 100%;
        background-color: var(--bg-primary);
    }

    /* Attribution Styling */
    :global(.maplibregl-ctrl-attrib) {
        background-color: var(--bg-secondary) !important;
        border: 1px solid var(--border) !important;
        border-right: none;
        border-bottom: none;
        color: var(--text-muted) !important;
        font-size: 0.7rem !important;
        padding: var(--spacing-xs) var(--spacing-sm) !important;
        border-radius: var(--radius-md) 0 0 0 !important;
        backdrop-filter: blur(4px);
    }

    :global(.maplibregl-ctrl-attrib a) {
        color: var(--accent) !important;
        text-decoration: none !important;
        transition: color var(--transition-base);
    }

    :global(.maplibregl-ctrl-attrib a:hover) {
        color: var(--accent-hover) !important;
        text-decoration: underline !important;
    }

    /* Hide the default compact attribution button if it appears */
    :global(.maplibregl-ctrl-attrib-button) {
        display: none !important;
    }

    /* MapLibre Popups (for consistency if used) */
    /* :global(.maplibregl-popup-content) {
        background-color: var(--bg-secondary) !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-md) !important;
        box-shadow: var(--shadow-lg) !important;
        padding: var(--spacing-md) !important;
    }

    :global(.maplibregl-popup-tip) {
        border-top-color: var(--border) !important;
    }

    :global(.maplibregl-popup-close-button) {
        color: var(--text-muted) !important;
        font-size: 1.25rem !important;
        padding: var(--spacing-xs) !important;
    }

    :global(.maplibregl-popup-close-button:hover) {
        background-color: transparent !important;
        color: var(--error) !important;
    } */
</style>
