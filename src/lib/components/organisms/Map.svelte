<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";

    let mapContainer: HTMLDivElement;
    let map: maplibregl.Map | undefined;

    onMount(() => {
        map = new maplibregl.Map({
            container: mapContainer,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: [
                            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                        ],
                        tileSize: 256,
                        attribution:
                            "&copy; OpenStreetMap contributors &copy; CARTO",
                    },
                },
                layers: [
                    {
                        id: "osm",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: [-3.7038, 40.4168], // Madrid
            zoom: 5,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });
</script>

<div bind:this={mapContainer} class="map-container"></div>

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

    :global(.maplibregl-compact) {
        display: none !important;
    }
</style>
