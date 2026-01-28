<script lang="ts">
    import { currentStyle } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { onMount } from "svelte";
    import StyleSwitcher from "../molecules/StyleSwitcher.svelte";
    import "@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css"; // Essential for UI

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

        mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
        mapInstance.addControl(
            new maplibregl.AttributionControl({
                compact: false,
                customAttribution: "OpenFreeMap",
            }),
            "bottom-right",
        );

        // Geoman options
        const gmOptions = {
            settings: {
                controlsPosition: "top-right" as const,
            },
            controls: {
                draw: {
                    polygon: { uiEnabled: true },
                    line: { uiEnabled: true },
                    marker: { uiEnabled: true },
                },
                edit: {
                    rotate: { uiEnabled: true },
                    scale: { uiEnabled: true },
                },
            },
        };

        // Initialize Geoman AFTER style loads (critical for remote styles)
        mapInstance.on("style.load", async () => {
            const { Geoman } = await import("@geoman-io/maplibre-geoman-free");
            new Geoman(mapInstance, gmOptions);
        });

        map = mapInstance;

        return () => {
            mapInstance.remove();
        };
    });
</script>

<div bind:this={mapContainer} class="map-container">
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
        box-shadow: var(--shadow-md) !important;
    }

    :global(.maplibregl-ctrl-group button) {
        background-color: var(--bg-secondary) !important;
        border-bottom: 1px solid var(--border) !important;
    }

    :global(.maplibregl-ctrl-group button:last-child) {
        border-bottom: none !important;
    }

    :global(.maplibregl-ctrl-icon) {
        filter: invert(1) brightness(2);
    }

    :global(.maplibregl-ctrl-attrib) {
        background-color: rgba(0, 0, 0, 0.8) !important;
        color: var(--text-muted) !important;
        font-size: 0.625rem !important;
        padding: var(--spacing-xs) var(--spacing-sm) !important;
        border-radius: var(--radius-md) 0 0 0 !important;
    }

    :global(.maplibregl-ctrl-attrib a) {
        color: var(--accent) !important;
        text-decoration: none !important;
    }

    :global(.maplibregl-ctrl-attrib a:hover) {
        text-decoration: underline !important;
    }

    :global(.maplibregl-compact) {
        display: none !important;
    }
</style>
