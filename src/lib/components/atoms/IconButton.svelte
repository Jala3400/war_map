<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        onclick,
        active = false,
        disabled = false,
        title = "",
        children,
        class: className = "",
    }: {
        onclick?: () => void;
        active?: boolean;
        disabled?: boolean;
        title?: string;
        children: Snippet;
        class?: string;
    } = $props();
</script>

<button
    {onclick}
    {title}
    {disabled}
    class="icon-button {className}"
    class:active
    class:disabled
>
    {@render children()}
</button>

<style>
    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        background-color: var(--bg-secondary);
        border: none;
        border-bottom: 1px solid var(--border);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-base);
        opacity: 0.7;
        outline: none;
    }

    .icon-button:last-child {
        border-bottom: none;
    }

    .icon-button:hover:not(.disabled) {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        opacity: 1;
    }

    .icon-button:active:not(.disabled) {
        background-color: var(--accent);
        color: var(--text-primary);
    }

    .icon-button.active {
        background-color: var(--accent);
        color: var(--text-primary);
        opacity: 1;
    }

    .icon-button.disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
</style>
