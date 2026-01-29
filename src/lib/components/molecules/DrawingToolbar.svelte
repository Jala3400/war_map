<script lang="ts">
    import IconButton from "$lib/components/atoms/IconButton.svelte";
    import CircleIcon from "$lib/components/atoms/icons/CircleIcon.svelte";
    import CutIcon from "$lib/components/atoms/icons/CutIcon.svelte";
    import DragIcon from "$lib/components/atoms/icons/DragIcon.svelte";
    import EditIcon from "$lib/components/atoms/icons/EditIcon.svelte";
    import LineIcon from "$lib/components/atoms/icons/LineIcon.svelte";
    import MarkerIcon from "$lib/components/atoms/icons/MarkerIcon.svelte";
    import PolygonIcon from "$lib/components/atoms/icons/PolygonIcon.svelte";
    import RectangleIcon from "$lib/components/atoms/icons/RectangleIcon.svelte";
    import RotateIcon from "$lib/components/atoms/icons/RotateIcon.svelte";
    import SnapIcon from "$lib/components/atoms/icons/SnapIcon.svelte";
    import TrashIcon from "$lib/components/atoms/icons/TrashIcon.svelte";
    import { geomanInstance } from "$lib/stores/geomanStore";
    import { clearKeymaps, registerKeymap } from "$lib/stores/keymapStore";
    import { onDestroy } from "svelte";

    let activeMode = $state<string | null>(null);
    let snapEnabled = $state<boolean>(true);

    // Enable snapping when geoman instance is ready
    $effect(() => {
        if ($geomanInstance && snapEnabled) {
            $geomanInstance.enableMode("helper", "snapping");
        }
    });

    // Drawing modes (lowercase as per Geoman API)
    const drawingModes = [
        { id: "marker", icon: MarkerIcon, title: "Draw Marker (M)" },
        { id: "circle", icon: CircleIcon, title: "Draw Circle (C)" },
        { id: "rectangle", icon: RectangleIcon, title: "Draw Rectangle (R)" },
        { id: "polygon", icon: PolygonIcon, title: "Draw Polygon (P)" },
        { id: "line", icon: LineIcon, title: "Draw Line (L)" },
    ];

    // Edit modes
    const editModes = [
        { id: "edit", icon: EditIcon, title: "Edit Mode (E)" },
        { id: "drag", icon: DragIcon, title: "Drag Mode (D)" },
        { id: "rotate", icon: RotateIcon, title: "Rotate Mode (T)" },
        { id: "cut", icon: CutIcon, title: "Cut Polygon (X)" },
        { id: "remove", icon: TrashIcon, title: "Remove Mode (Delete)" },
    ];

    function toggleDrawMode(mode: string) {
        if (!$geomanInstance) return;

        // If clicking the active mode, disable it
        if (activeMode === mode) {
            $geomanInstance.disableDraw();
            activeMode = null;
            return;
        }

        // Disable any active mode first
        if (activeMode) {
            if (
                ["edit", "drag", "rotate", "cut", "remove"].includes(activeMode)
            ) {
                disableEditMode(activeMode);
            } else {
                $geomanInstance.disableDraw();
            }
        }

        // Enable the new drawing mode
        $geomanInstance.enableDraw(mode as any);
        activeMode = mode;
    }

    function toggleEditMode(mode: string) {
        if (!$geomanInstance) return;

        // If clicking the active mode, disable it
        if (activeMode === mode) {
            disableEditMode(mode);
            activeMode = null;
            return;
        }

        // Disable any active mode first
        if (activeMode) {
            if (
                ["edit", "drag", "rotate", "cut", "remove"].includes(activeMode)
            ) {
                disableEditMode(activeMode);
            } else {
                $geomanInstance.disableDraw();
            }
        }

        // Enable the new edit mode
        enableEditMode(mode);
        activeMode = mode;
    }

    function enableEditMode(mode: string) {
        if (!$geomanInstance) return;
        switch (mode) {
            case "edit":
                $geomanInstance.enableGlobalEditMode();
                break;
            case "drag":
                $geomanInstance.enableGlobalDragMode();
                break;
            case "rotate":
                $geomanInstance.enableGlobalRotateMode();
                break;
            case "cut":
                $geomanInstance.enableGlobalCutMode();
                break;
            case "remove":
                $geomanInstance.enableGlobalRemovalMode();
                break;
        }
    }

    function disableEditMode(mode: string) {
        if (!$geomanInstance) return;
        switch (mode) {
            case "edit":
                $geomanInstance.disableGlobalEditMode();
                break;
            case "drag":
                $geomanInstance.disableGlobalDragMode();
                break;
            case "rotate":
                $geomanInstance.disableGlobalRotateMode();
                break;
            case "cut":
                $geomanInstance.disableGlobalCutMode();
                break;
            case "remove":
                $geomanInstance.disableGlobalRemovalMode();
                break;
        }
    }

    function toggleSnap() {
        if (!$geomanInstance) return;

        if (snapEnabled) {
            $geomanInstance.disableMode("helper", "snapping");
            snapEnabled = false;
        } else {
            $geomanInstance.enableMode("helper", "snapping");
            snapEnabled = true;
        }
    }

    // Register keymaps
    $effect(() => {
        // Drawing mode shortcuts
        registerKeymap({
            id: "draw-marker",
            key: "m",
            description: "Draw Marker",
            category: "drawing",
            handler: () => toggleDrawMode("marker"),
        });

        registerKeymap({
            id: "draw-circle",
            key: "c",
            description: "Draw Circle",
            category: "drawing",
            handler: () => toggleDrawMode("circle"),
        });

        registerKeymap({
            id: "draw-rectangle",
            key: "r",
            description: "Draw Rectangle",
            category: "drawing",
            handler: () => toggleDrawMode("rectangle"),
        });

        registerKeymap({
            id: "draw-polygon",
            key: "p",
            description: "Draw Polygon",
            category: "drawing",
            handler: () => toggleDrawMode("polygon"),
        });

        registerKeymap({
            id: "draw-line",
            key: "l",
            description: "Draw Line",
            category: "drawing",
            handler: () => toggleDrawMode("line"),
        });

        // Edit mode shortcuts
        registerKeymap({
            id: "edit-mode",
            key: "e",
            description: "Edit Mode",
            category: "editing",
            handler: () => toggleEditMode("edit"),
        });

        registerKeymap({
            id: "drag-mode",
            key: "d",
            description: "Drag Mode",
            category: "editing",
            handler: () => toggleEditMode("drag"),
        });

        registerKeymap({
            id: "rotate-mode",
            key: "t",
            description: "Rotate Mode",
            category: "editing",
            handler: () => toggleEditMode("rotate"),
        });

        registerKeymap({
            id: "cut-mode",
            key: "x",
            description: "Cut Polygon",
            category: "editing",
            handler: () => toggleEditMode("cut"),
        });

        registerKeymap({
            id: "remove-mode",
            key: "Delete",
            description: "Remove Mode",
            category: "editing",
            handler: () => toggleEditMode("remove"),
        });

        // Helper tools
        registerKeymap({
            id: "toggle-snap",
            key: "s",
            description: "Toggle Snap",
            category: "general",
            handler: toggleSnap,
        });

        // Escape to cancel
        registerKeymap({
            id: "cancel-mode",
            key: "Escape",
            description: "Cancel Active Mode",
            category: "general",
            handler: () => {
                if (!$geomanInstance || !activeMode) return;
                if (
                    ["edit", "drag", "rotate", "cut", "remove"].includes(
                        activeMode,
                    )
                ) {
                    disableEditMode(activeMode);
                } else {
                    $geomanInstance.disableDraw();
                }
                activeMode = null;
            },
        });
    });

    onDestroy(() => {
        clearKeymaps();
    });
</script>

<div class="toolbar">
    <!-- Drawing Tools -->
    <div class="tool-group">
        {#each drawingModes as mode}
            <IconButton
                active={activeMode === mode.id}
                title={mode.title}
                onclick={() => toggleDrawMode(mode.id)}
            >
                <mode.icon size={16} />
            </IconButton>
        {/each}
    </div>

    <!-- Separator -->
    <div class="separator"></div>

    <!-- Edit Tools -->
    <div class="tool-group">
        {#each editModes as mode}
            <IconButton
                active={activeMode === mode.id}
                title={mode.title}
                onclick={() => toggleEditMode(mode.id)}
            >
                <mode.icon size={16} />
            </IconButton>
        {/each}
    </div>

    <!-- Separator -->
    <div class="separator"></div>

    <!-- Helper Tools -->
    <div class="tool-group">
        <IconButton
            active={snapEnabled}
            title="Toggle Snap to Nodes (S)"
            onclick={toggleSnap}
        >
            <SnapIcon size={16} />
        </IconButton>
    </div>
</div>

<style>
    .toolbar {
        position: absolute;
        top: var(--spacing-md);
        left: var(--spacing-md);
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
    }
</style>
