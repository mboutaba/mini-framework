# mini Framework (kob.js)

A lightweight, modular JavaScript framework for building web applications with state management, event handling, DOM manipulation, and routing.

## Features

- **🔄 State Management** - Configurable state container with persistence
- **🎯 Event System** - Event delegation and custom event handling
- **🏗️ DOM Utilities** - Element creation, manipulation, and rendering
- **🛣️ Routing** - Simple client-side routing
- **💾 Persistence** - Configurable localStorage integration
- **🔧 Modular** - Use only the modules you need

## Quick Start

### 1. Include the Framework

```html
<!-- Core Framework -->
<script src="src/index.js"></script>

<!-- DOM Module -->
<script src="src/dom/element.js"></script>
<script src="src/dom/attributes.js"></script>
<script src="src/dom/manipulation.js"></script>
<script src="src/dom/render.js"></script>
<script src="src/dom/index.js"></script>

<!-- Events Module -->
<script src="src/events/events.js"></script>

<!-- State Module -->
<script src="src/state/simple-state.js"></script>

<!-- Routing Module -->
<script src="src/routing/router.js"></script>
```

### 2. Initialize State Management

```javascript
// Configure state for your application
const stateConfig = {
    initialState: {
        count: 0,
        items: []
    },
    storageKey: 'my-app-state',
    enablePersistence: true,
    enableLogging: false
};

// Initialize state manager
window.mini.state.init(stateConfig);
const state = window.mini.state;

// Subscribe to state changes
state.subscribe(function(newState, prevState, actionType) {
    console.log('State changed:', actionType, newState);
    render(); // Update your UI
});
```

### 3. Update State

```javascript
// Function-based updates (recommended)
state.setState(function(currentState) {
    return {
        ...currentState,
        count: currentState.count + 1
    };
}, 'INCREMENT');

// Object-based updates (for simple changes)
state.setState({ count: 5 }, 'SET_COUNT');
```

## State Management API

### Configuration Options

- `initialState` - Initial state object
- `storageKey` - Key for localStorage persistence
- `enablePersistence` - Enable/disable localStorage
- `enableLogging` - Enable/disable console logging

### Methods

- `init(config)` - Initialize with configuration
- `getState()` - Get current state
- `setState(updates, actionType)` - Update state
- `subscribe(callback)` - Subscribe to changes
- `reset()` - Reset to initial state
- `getStats()` - Get framework statistics

## Examples

### Counter App
```bash
# Open examples/counter/index.html
```

### TodoMVC App
```bash
# Open examples/todomvc/index.html
```

## Architecture

The framework is designed to be:

- **Generic** - No hardcoded application logic
- **Configurable** - Customize behavior through configuration
- **Modular** - Use only what you need
- **Lightweight** - Minimal overhead
- **Standards-compliant** - Works with modern browsers

## Migration from v1.0

If you're upgrading from the previous version:

1. **State initialization** now requires configuration
2. **Storage keys** are configurable
3. **TodoMVC-specific code** has been removed from core modules
4. **Event delegation** is now generic

See the examples for updated usage patterns.

---

**Built by PoSSH Team**
```
P - People (Phillip)
O - of (Ouma)
S - Strength (Stephen)
S - Strategy (Shisia)
    &
H - Honor (Hezron)
```