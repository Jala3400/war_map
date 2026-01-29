<script lang="ts">
    import type maplibregl from "maplibre-gl";
    import IconButton from "../atoms/IconButton.svelte";
    import CompassIcon from "../atoms/icons/CompassIcon.svelte";
    import MinusIcon from "../atoms/icons/MinusIcon.svelte";
    import PlusIcon from "../atoms/icons/PlusIcon.svelte";

    let { map }: { map: maplibregl.Map | undefined } = $props();

    function zoomIn() {
        if (!map) return;
        map.zoomIn();
    }

    function zoomOut() {
        if (!map) return;
        map.zoomOut();
    }

    function resetNorth() {
        if (!map) return;
        map.resetNorth();
    }
</script>

<div class="navigation-toolbar">
    <div class="tool-group">
        <IconButton title="Zoom In" onclick={zoomIn}>
            <PlusIcon size={16} />
        </IconButton>
        <IconButton title="Zoom Out" onclick={zoomOut}>
            <MinusIcon size={16} />
        </IconButton>
    </div>

    <!-- Separator -->
    <div class="separator"></div>

    <div class="tool-group">
        <IconButton title="Reset North" onclick={resetNorth}>
            <CompassIcon size={16} />
        </IconButton>
    </div>
</div>

<style>
    .navigation-toolbar {
        position: absolute;
        top: var(--spacing-md);
        right: var(--spacing-md);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
    }

    .tool-group {
        display: flex;
        flex-direction: column;
    }

    .separator {
        height: 2px;
        background-color: var(--border-light);
        margin: var(--spacing-xs) 0;
    }
</style>
