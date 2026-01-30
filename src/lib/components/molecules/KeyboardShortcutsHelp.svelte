<script lang="ts">
    import { keymapStore } from "$lib/stores/keymapStore";
    import { formatKeyDisplay } from "$lib/utils/keymapHandler";
    import type { KeymapAction } from "$lib/stores/keymapStore";

    let showHelp = $state(false);

    // Group keymaps by category
    const groupedKeymaps = $derived.by(() => {
        const grouped: Record<string, KeymapAction[]> = {
            drawing: [],
            editing: [],
            navigation: [],
            general: [],
        };

        Object.values($keymapStore).forEach((action) => {
            grouped[action.category].push(action);
        });

        return grouped;
    });

    function toggleHelp() {
        showHelp = !showHelp;
    }

    // Register help keymap
    $effect(() => {
        import("$lib/stores/keymapStore").then(({ registerKeymap }) => {
            registerKeymap({
                id: "show-help",
                key: "?",
                modifiers: { shift: true },
                description: "Show Keyboard Shortcuts",
                category: "general",
                handler: toggleHelp,
            });
        });
    });

    // Close on Escape
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && showHelp) {
            showHelp = false;
            e.stopPropagation();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<button class="help-button" onclick={toggleHelp} title="Keyboard Shortcuts (?)">
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
</button>

{#if showHelp}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="help-overlay" onclick={toggleHelp}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="help-panel" onclick={(e) => e.stopPropagation()}>
            <div class="help-header">
                <h2>Keyboard Shortcuts</h2>
                <button class="close-button" onclick={toggleHelp}>×</button>
            </div>

            <div class="help-content">
                {#each Object.entries(groupedKeymaps) as [category, actions]}
                    {#if actions.length > 0}
                        <div class="category-section">
                            <h3>
                                {category.charAt(0).toUpperCase() +
                                    category.slice(1)}
                            </h3>
                            <div class="shortcuts-list">
                                {#each actions as action}
                                    <div class="shortcut-item">
                                        <span class="shortcut-description">
                                            {action.description}
                                        </span>
                                        <kbd class="shortcut-key">
                                            {formatKeyDisplay(
                                                action.key,
                                                action.modifiers,
                                            )}
                                        </kbd>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <div class="help-footer">
                Press <kbd>?</kbd> to toggle this help or <kbd>ESC</kbd> to close
            </div>
        </div>
    </div>
{/if}

<style>
    .help-button {
        position: absolute;
        top: 8rem;
        right: var(--spacing-md);
        z-index: 1000;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        transition: all var(--transition-base);
    }

    .help-button:hover {
        background-color: var(--bg-tertiary);
        transform: scale(1.05);
    }

    .help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .help-panel {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        max-width: 40em;
        width: 90%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .help-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .help-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: all var(--transition-base);
    }

    .close-button:hover {
        background-color: var(--bg-tertiary);
        color: var(--error);
    }

    .help-content {
        padding: var(--spacing-lg);
        overflow-y: auto;
        flex: 1;
    }

    .category-section {
        margin-bottom: var(--spacing-xl);
    }

    .category-section:last-child {
        margin-bottom: 0;
    }

    .category-section h3 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--accent);
        text-transform: capitalize;
    }

    .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        background-color: var(--bg-primary);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-light);
    }

    .shortcut-description {
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    .shortcut-key,
    kbd {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: "Monaco", "Menlo", "Courier New", monospace;
        font-size: 0.85rem;
        color: var(--text-primary);
        box-shadow: 0 2px 0 var(--border);
        min-width: 2rem;
        text-align: center;
    }

    .help-footer {
        padding: var(--spacing-md) var(--spacing-lg);
        border-top: 1px solid var(--border);
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .help-footer kbd {
        margin: 0 0.25rem;
    }

    /* Scrollbar styling */
    .help-content::-webkit-scrollbar {
        width: 8px;
    }

    .help-content::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: var(--radius-sm);
    }

    .help-content::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: var(--radius-sm);
    }

    .help-content::-webkit-scrollbar-thumb:hover {
        background: var(--text-muted);
    }
</style>
