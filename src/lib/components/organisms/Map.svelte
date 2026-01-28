<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { currentStyle } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";
    import StyleSwitcher from "../molecules/StyleSwitcher.svelte";

    let mapContainer: HTMLDivElement;
    let map: maplibregl.Map | undefined;

    $: if (map && $currentStyle) {
        const styleUrl = MAP_STYLES.find((s) => s.id === $currentStyle)?.url;
        if (styleUrl) {
            map.setStyle(styleUrl);
        }
    }

    onMount(() => {
        const initialStyle =
            MAP_STYLES.find((s) => s.id === $currentStyle)?.url ||
            MAP_STYLES.find((s) => s.id === MapStyle.Dark)?.url ||
            MAP_STYLES[0].url;

        map = new maplibregl.Map({
            container: mapContainer,
            style: initialStyle,
            center: [-3.7038, 40.4168], // Madrid
            zoom: 5,
            attributionControl: false, // Add manually to customize
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.addControl(
            new maplibregl.AttributionControl({
                compact: false,
                customAttribution: "OpenFreeMap",
            }),
            "bottom-right",
        );
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
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
        font-size: 10px !important;
        padding: 2px 8px !important;
        border-radius: 4px 0 0 0 !important;
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
