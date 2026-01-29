<script lang="ts">
    import IconButton from "$lib/components/atoms/IconButton.svelte";
    import CompassIcon from "$lib/components/atoms/icons/CompassIcon.svelte";
    import MinusIcon from "$lib/components/atoms/icons/MinusIcon.svelte";
    import PlusIcon from "$lib/components/atoms/icons/PlusIcon.svelte";
    import { registerKeymap } from "$lib/stores/keymapStore";
    import { mapInstance } from "$lib/stores/mapStore";

    let bearing = $state(0);

    $effect(() => {
        if (!$mapInstance) return;

        const updateRotation = () => {
            bearing = $mapInstance.getBearing();
        };

        $mapInstance.on("rotate", updateRotation);
        // Initial value
        updateRotation();

        return () => {
            $mapInstance.off("rotate", updateRotation);
        };
    });

    function zoomIn() {
        if (!$mapInstance) return;
        $mapInstance.zoomIn();
    }

    function zoomOut() {
        if (!$mapInstance) return;
        $mapInstance.zoomOut();
    }

    function resetNorth() {
        if (!$mapInstance) return;
        $mapInstance.resetNorth();
    }

    // Register navigation keymaps
    $effect(() => {
        registerKeymap({
            id: "zoom-in",
            key: "+",
            description: "Zoom In",
            category: "navigation",
            handler: zoomIn,
        });

        registerKeymap({
            id: "zoom-in-equals",
            key: "=",
            description: "Zoom In",
            category: "navigation",
            handler: zoomIn,
        });

        registerKeymap({
            id: "zoom-out",
            key: "-",
            description: "Zoom Out",
            category: "navigation",
            handler: zoomOut,
        });

        registerKeymap({
            id: "reset-north",
            key: "n",
            description: "Reset North",
            category: "navigation",
            handler: resetNorth,
        });
    });
</script>

<div class="navigation-toolbar">
    <div class="tool-group">
        <IconButton title="Zoom In (+)" onclick={zoomIn}>
            <PlusIcon size={16} />
        </IconButton>
        <IconButton title="Zoom Out (-)" onclick={zoomOut}>
            <MinusIcon size={16} />
        </IconButton>
    </div>

    <!-- Separator -->
    <div class="separator"></div>

    <div class="tool-group">
        <IconButton title="Reset North (N)" onclick={resetNorth}>
            <div style="transform: rotate({-bearing}deg); display: flex;">
                <CompassIcon size={16} />
            </div>
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
