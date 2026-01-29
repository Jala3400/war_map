<script lang="ts">
    import { geomanInstance } from "$lib/stores/geomanStore";
    import { currentStyle } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";
    import { Geoman } from "@geoman-io/maplibre-geoman-free";
    import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";
    import DrawingToolbar from "../molecules/DrawingToolbar.svelte";
    import NavigationToolbar from "../molecules/NavigationToolbar.svelte";
    import StyleSwitcher from "../molecules/StyleSwitcher.svelte";

    let mapContainer = $state<HTMLDivElement>();
    let map = $state<maplibregl.Map>();

    $effect(() => {
        if (map && $currentStyle) {
            const styleUrl = MAP_STYLES[$currentStyle]?.url;
            if (styleUrl) {
                map.setStyle(styleUrl);
            }
        }
    });

    onMount(() => {
        if (!mapContainer) return;

        const initialStyle =
            MAP_STYLES[$currentStyle]?.url ||
            MAP_STYLES[MapStyle.Dark]?.url ||
            Object.values(MAP_STYLES)[0].url;

        const mapInstance = new maplibregl.Map({
            container: mapContainer,
            style: initialStyle,
            center: [-3.7038, 40.4168], // Madrid
            zoom: 5,
            attributionControl: false, // Add manually to customize
        });

        mapInstance.addControl(
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
        mapInstance.on("style.load", async () => {
            const currentFeatures = $geomanInstance?.features.exportGeoJson();

            if ($geomanInstance) {
                await $geomanInstance.destroy();
            }

            const newGman = new Geoman(mapInstance, gmOptions);
            geomanInstance.set(newGman);

            mapInstance.once("render", () => {
                if (currentFeatures && currentFeatures.features.length > 0) {
                    $geomanInstance?.features.importGeoJson(currentFeatures);
                }
            });
        });

        map = mapInstance;

        return () => {
            mapInstance.remove();
        };
    });
</script>

<div bind:this={mapContainer} class="map-container">
    <DrawingToolbar />
    <NavigationToolbar {map} />
    <StyleSwitcher />
</div>

<style>
    .map-container {
        height: 100vh;
        width: 100%;
        background-color: var(--bg-primary);
    }

    :global(.maplibregl-ctrl-group) {
        background-color: var(--bg-secondary) !important;
        border: 1px solid var(--border) !important;
        box-shadow: var(--shadow-lg) !important;
        border-radius: var(--radius-md) !important;
    }

    :global(.maplibregl-ctrl-group button) {
        background-color: var(--bg-secondary) !important;
        width: 2rem !important;
        height: 2rem !important;
        border: none !important;
        border-bottom: 1px solid var(--border) !important;
        transition: all var(--transition-base) !important;
    }

    :global(.maplibregl-ctrl-group button:last-child) {
        border-bottom: none !important;
    }

    :global(.maplibregl-ctrl-group button:hover) {
        background-color: var(--bg-tertiary) !important;
    }

    :global(.maplibregl-ctrl-group button:active) {
        background-color: var(--accent) !important;
    }

    /* Icons styling */
    :global(.maplibregl-ctrl-icon) {
        filter: invert(1) brightness(1.5) contrast(0.8);
        opacity: 0.7;
        transition: opacity var(--transition-base);
    }

    :global(.maplibregl-ctrl-group button:hover .maplibregl-ctrl-icon) {
        opacity: 1;
        filter: invert(1) brightness(2);
    }

    /* Geoman Specific Overrides */
    :global(.maplibregl-ctrl-group button.active) {
        background-color: var(--accent) !important;
    }

    :global(.maplibregl-ctrl-group button.active .maplibregl-ctrl-icon) {
        filter: brightness(0) invert(1);
        opacity: 1;
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
