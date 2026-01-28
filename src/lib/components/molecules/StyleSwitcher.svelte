<script lang="ts">
    import { currentStyle } from "$lib/stores/mapStore";
    import { MAP_STYLES, MapStyle } from "$lib/types/map";

    function setStyle(id: MapStyle) {
        currentStyle.set(id);
    }
</script>

<div class="style-switcher">
    {#each Object.entries(MAP_STYLES) as [id, style]}
        <button
            class:active={$currentStyle === id}
            onclick={() => setStyle(id as MapStyle)}
            title={style.label}
        >
            {style.label}
        </button>
    {/each}
</div>

<style>
    .style-switcher {
        position: absolute;
        top: var(--spacing-md);
        left: var(--spacing-md);
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        background-color: var(--bg-secondary);
        padding: var(--spacing-xs);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
    }

    button {
        background: none;
        border: 1px solid transparent;
        color: var(--text-primary);
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        border-radius: var(--radius-sm);
        text-align: left;
        transition: all var(--transition-base);
    }

    button:hover {
        background-color: var(--bg-tertiary);
    }

    button.active {
        background-color: var(--accent);
        color: var(--text-primary);
    }
</style>
