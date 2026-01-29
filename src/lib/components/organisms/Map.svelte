<script lang="ts">
    import DrawingToolbar from "$lib/components/molecules/DrawingToolbar.svelte";
    import KeyboardShortcutsHelp from "$lib/components/molecules/KeyboardShortcutsHelp.svelte";
    import NavigationToolbar from "$lib/components/molecules/NavigationToolbar.svelte";
    import StyleSwitcher from "$lib/components/molecules/StyleSwitcher.svelte";
    import { geomanInstance } from "$lib/stores/geomanStore";
    import { currentStyle, mapInstance } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";
    import { handleKeyPress } from "$lib/utils/keymapHandler";
    import { Geoman } from "@geoman-io/maplibre-geoman-free";
    import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";

    let mapContainer = $state<HTMLDivElement>();

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
        });

        mapInstance.set(mapLib);

        // Setup keyboard event listener
        const keydownHandler = (e: KeyboardEvent) => handleKeyPress(e);
        window.addEventListener("keydown", keydownHandler);

        return () => {
            window.removeEventListener("keydown", keydownHandler);
            mapLib.remove();
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
