# Keyboard Shortcuts

This document describes the keyboard shortcuts (keymaps) available in the map application.

## Built-in Shortcuts

### Drawing Tools
- **M** - Draw Marker
- **C** - Draw Circle
- **R** - Draw Rectangle
- **P** - Draw Polygon
- **L** - Draw Line

### Editing Tools
- **E** - Edit Mode (modify shapes)
- **D** - Drag Mode (move shapes)
- **T** - Rotate Mode (rotate shapes)
- **X** - Cut Polygon Mode
- **Delete** - Remove Mode (delete shapes)

### Navigation
- **+** or **=** - Zoom In
- **-** - Zoom Out
- **N** - Reset North (reset map rotation)

### General
- **S** - Toggle Snap to Nodes
- **Escape** - Cancel Active Mode
- **?** (Shift+/) - Show/Hide Keyboard Shortcuts Help Panel

## Using the Keymap System

### Registering Custom Keymaps

You can register custom keyboard shortcuts in your components:

```typescript
import { registerKeymap } from "$lib/stores/keymapStore";

registerKeymap({
    id: "my-custom-action",
    key: "h",
    modifiers: { ctrl: true },  // Optional: ctrl, shift, alt
    description: "My Custom Action",
    category: "general",  // drawing, editing, navigation, or general
    handler: () => {
        // Your custom action
    }
});
```

### Unregistering Keymaps

```typescript
import { unregisterKeymap } from "$lib/stores/keymapStore";

unregisterKeymap("my-custom-action");
```

### Enabling/Disabling Keymaps

```typescript
import { keymapEnabled } from "$lib/stores/keymapStore";

// Disable all keymaps
keymapEnabled.set(false);

// Enable all keymaps
keymapEnabled.set(true);
```

### Accessing the Keymap Store

```typescript
import { keymapStore } from "$lib/stores/keymapStore";

// Get all registered keymaps
$keymapStore  // Object with all keymap actions
```

## Implementation Details

### Architecture

The keymap system consists of:

1. **keymapStore.ts** - Store for managing keyboard shortcuts
2. **keymapHandler.ts** - Utility for handling keyboard events
3. **KeyboardShortcutsHelp.svelte** - UI component for displaying shortcuts

### Key Features

- **Context-aware**: Keymaps are ignored when typing in input fields
- **Modifier support**: Supports Ctrl, Shift, and Alt modifiers
- **Categorized**: Shortcuts are organized by category for better UX
- **Dynamic**: Keymaps can be registered/unregistered at runtime
- **Visual feedback**: Help panel shows all available shortcuts
- **No conflicts**: Each key combination can only be registered once

### Events Handling

The keymap handler:
1. Listens for `keydown` events on the window
2. Checks if keymaps are enabled
3. Ignores events from input fields
4. Builds a key combination string from the event
5. Looks up and executes the matching keymap action
6. Prevents default behavior if a match is found

## Tips

- Press **?** anytime to see all available keyboard shortcuts
- The active mode will be shown in the toolbar with a highlighted button
- Press **Escape** to cancel any active drawing or editing mode
- Keymaps work globally throughout the application
- Custom keymaps are cleaned up when components are destroyed
