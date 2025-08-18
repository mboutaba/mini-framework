# mini Framework - State Management Module

## Overview
The State Management module provides a centralized store for application state with reactive updates, immutable state handling, and local storage persistence. It enables components to share and react to state changes across the application.

## Core Concepts

### Centralized State
All application state is stored in a single object, making it easier to track changes and debug.

### Immutable Updates
State is never directly modified. Instead, new state objects are created with the changes applied.

### Subscription System
Components can subscribe to state changes and react accordingly.

### Persistence
State can be saved to and loaded from localStorage for persistence across page reloads.

## API Reference

### State Initialization

#### `init()`
Initializes the state module and loads state from localStorage if available.

```javascript
miniState.init();
```

### State Access

#### `getState(path = null)`
Gets the current state or a specific path in the state.

```javascript
// Get entire state
const state = miniState.getState();

// Get specific value
const todos = miniState.getState('todos');

// Get nested value
const todoTitle = miniState.getState('todos.1.title');
```

### State Updates

#### `setState(updates, actionType = 'SET_STATE')`
Updates the application state.

```javascript
// Update with object
miniState.setState({ 
  filter: 'active',
  editingId: 2
});

// Update with function
miniState.setState(state => ({
  ...state,
  todos: {
    ...state.todos,
    [id]: { ...state.todos[id], completed: true }
  }
}));

// With action type for debugging
miniState.setState({ filter: 'completed' }, 'SET_FILTER');
```

### Subscriptions

#### `subscribe(callback)`
Subscribes to state changes.

```javascript
// Subscribe to all state changes
const unsubscribe = miniState.subscribe((newState, prevState, actionType) => {
  console.log('State changed:', actionType);
  renderApp(newState);
});

// Later, unsubscribe when no longer needed
unsubscribe();
```

### Persistence

#### `saveToStorage()`
Saves state to localStorage.

```javascript
miniState.saveToStorage();
```

#### `loadFromStorage()`
Loads state from localStorage.

```javascript
miniState.loadFromStorage();
```

### State Reset

#### `reset()`
Resets state to initial values.

```javascript
miniState.reset();
```

### Utilities

#### `getStats()`
Gets statistics about the current state.

```javascript
const stats = miniState.getStats();
console.log(`Active todos: ${stats.activeCount}`);
```

## TodoMVC State Structure

For the TodoMVC application, the state is structured as follows:

```javascript
{
  // Todo items indexed by ID
  todos: {
    1: { id: 1, title: 'Learn mini', completed: false, createdAt: 1625097600000 },
    2: { id: 2, title: 'Build TodoMVC', completed: true, createdAt: 1625184000000 }
  },
  
  // Current filter: 'all', 'active', or 'completed'
  filter: 'all',
  
  // Next available ID for new todos
  nextId: 3,
  
  // ID of todo currently being edited, or null
  editingId: null
}
```

## How It Works

1. **State Initialization**: The state module initializes with default values and loads any saved state from localStorage.

2. **State Updates**: When `setState` is called, the module:
   - Creates a copy of the previous state
   - Applies updates (either directly or via a function)
   - Saves the new state to localStorage
   - Notifies all subscribers

3. **Subscriptions**: Components subscribe to state changes and receive the new state, previous state, and action type.

4. **Immutability**: All state updates create new objects rather than modifying existing ones, making it easier to track changes and implement undo/redo functionality.

## Example: Todo Management

```javascript
// Initialize state
miniState.init();

// Add a new todo
function addTodo(title) {
  const state = miniState.getState();
  const id = state.nextId;
  
  miniState.setState({
    todos: {
      ...state.todos,
      [id]: {
        id,
        title,
        completed: false,
        createdAt: Date.now()
      }
    },
    nextId: id + 1
  }, 'ADD_TODO');
  
  return id;
}

// Toggle todo completion
function toggleTodo(id) {
  const state = miniState.getState();
  const todo = state.todos[id];
  
  if (!todo) return;
  
  miniState.setState({
    todos: {
      ...state.todos,
      [id]: {
        ...todo,
        completed: !todo.completed
      }
    }
  }, 'TOGGLE_TODO');
}

// Delete a todo
function deleteTodo(id) {
  const state = miniState.getState();
  const newTodos = { ...state.todos };
  
  delete newTodos[id];
  
  miniState.setState({
    todos: newTodos
  }, 'DELETE_TODO');
}

// Subscribe to state changes
miniState.subscribe((newState) => {
  renderTodos(newState.todos, newState.filter);
});
```

## Best Practices

1. **Use Action Types**: Always provide meaningful action types for debugging.

2. **Minimize State Updates**: Batch related changes into a single update.

3. **Keep State Normalized**: Avoid deeply nested state structures.

4. **Use Selectors**: Create helper functions to extract specific data from state.

5. **Validate State**: Ensure state updates maintain the expected structure.