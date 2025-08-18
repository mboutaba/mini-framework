# mini Framework - Complete Documentation

## Introduction

mini is a lightweight JavaScript framework built from scratch with no external dependencies. It provides core features needed for modern web applications including DOM abstraction, state management, event handling, and routing.

This framework was designed to demonstrate how modern JavaScript frameworks work under the hood, while providing a practical tool for building applications like TodoMVC.

## Framework Architecture

mini consists of four core modules that work together:

1. **DOM Module**: Virtual DOM abstraction for element creation and manipulation
2. **State Module**: Centralized state management with reactive updates
3. **Events Module**: Custom event handling system with delegation
4. **Routing Module**: Hash-based routing for single-page applications

### Module Integration

The modules are designed to work together seamlessly:

- **DOM + Events**: Virtual elements can have event handlers attached
- **State + DOM**: UI updates when state changes
- **Routing + State**: Routes synchronize with application state
- **Events + State**: Event handlers can update state

## Getting Started

### Installation

Simply include the framework files in your HTML:

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

### Basic Usage

```javascript
// Wait for framework to initialize
document.addEventListener('DOMContentLoaded', function() {
  // Check if framework is ready
  if (mini.isReady()) {
    initApp();
  }
});

function initApp() {
  // Create a virtual element
  const vButton = miniDOM.createElement('button', {
    class: 'btn',
    onclick: () => alert('Hello mini!')
  }, 'Click Me');
  
  // Render to DOM
  miniDOM.render(vButton, document.getElementById('app'));
  
  // Initialize state
  miniState.setState({
    count: 0
  });
  
  // Subscribe to state changes
  miniState.subscribe(function(newState) {
    updateUI(newState);
  });
  
  // Set up routing
  mini.routing.registerRoute('home', showHome);
  mini.routing.registerRoute('about', showAbout);
  mini.routing.navigateTo('home');
}
```

## Building a Complete Application

The framework is designed to build complete applications like TodoMVC. Here's how the different modules work together:

### 1. Define Application State

```javascript
// Initialize state
miniState.setState({
  todos: {},
  filter: 'all',
  nextId: 1,
  editingId: null
});
```

### 2. Create UI Components

```javascript
// Create todo item component
function createTodoItem(todo) {
  return miniDOM.createElement('li', {
    'data-id': todo.id,
    class: todo.completed ? 'completed' : ''
  }, [
    miniDOM.createElement('div', { class: 'view' }, [
      miniDOM.createElement('input', {
        class: 'toggle',
        type: 'checkbox',
        checked: todo.completed
      }),
      miniDOM.createElement('label', {}, todo.title),
      miniDOM.createElement('button', { class: 'destroy' })
    ]),
    miniDOM.createElement('input', {
      class: 'edit',
      value: todo.title
    })
  ]);
}
```

### 3. Set Up Event Handlers

```javascript
// Set up event handlers
function setupEventHandlers() {
  const events = miniEvents;
  
  // New todo input
  const newTodoInput = document.querySelector('.new-todo');
  events.onKeydown(newTodoInput, function(e) {
    if (e.key === 'Enter') {
      const value = e.target.value.trim();
      if (value) {
        addTodo(value);
        e.target.value = '';
      }
    }
  });
  
  // Todo list events
  const todoList = document.querySelector('.todo-list');
  
  // Toggle todo
  events.bind(todoList, {
    click: function(e) {
      if (e.target.classList.contains('toggle')) {
        const li = e.target.closest('li');
        const id = parseInt(li.dataset.id);
        toggleTodo(id);
      }
    }
  });
  
  // Delete todo
  events.bind(todoList, {
    click: function(e) {
      if (e.target.classList.contains('destroy')) {
        const li = e.target.closest('li');
        const id = parseInt(li.dataset.id);
        deleteTodo(id);
      }
    }
  });
}
```

### 4. Implement State Changes

```javascript
// Add a new todo
function addTodo(title) {
  const state = miniState.getState();
  const id = state.nextId;
  
  miniState.setState({
    todos: {
      ...state.todos,
      [id]: {
        id: id,
        title: title,
        completed: false,
        createdAt: Date.now()
      }
    },
    nextId: id + 1
  }, 'ADD_TODO');
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
```

### 5. Set Up Routing

```javascript
// Set up routing
function setupRouting() {
  const router = mini.routing;
  
  // Register routes
  router.registerRoute('all', function() {
    setFilter('all');
  });
  
  router.registerRoute('active', function() {
    setFilter('active');
  });
  
  router.registerRoute('completed', function() {
    setFilter('completed');
  });
  
  // Default route
  if (!window.location.hash) {
    router.navigateTo('all');
  }
}

// Set filter
function setFilter(filter) {
  miniState.setState({ filter: filter });
}
```

### 6. Render UI Based on State

```javascript
// Subscribe to state changes
miniState.subscribe(function(newState) {
  renderTodos(newState.todos, newState.filter);
});

// Render todos
function renderTodos(todos, filter) {
  const todoList = document.querySelector('.todo-list');
  
  // Clear existing todos
  todoList.innerHTML = '';
  
  // Filter todos
  const filteredTodos = Object.values(todos).filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all' filter
  });
  
  // Create and append todo elements
  filteredTodos.forEach(todo => {
    const todoElement = createTodoItem(todo);
    miniDOM.render(todoElement, todoList);
  });
  
  // Update UI visibility
  updateUIVisibility(todos);
}
```

## Framework Features in Detail

For detailed documentation on each module, see:

- [DOM Module Documentation](DOM_MODULE_COMPLETE.md)
- [State Module Documentation](STATE_MODULE_COMPLETE.md)
- [Events Module Documentation](EVENTS_MODULE_COMPLETE.md)
- [Routing Module Documentation](ROUTING_MODULE_COMPLETE.md)

## Performance Considerations

mini is designed to be lightweight and efficient:

1. **Virtual DOM**: Minimizes actual DOM operations
2. **Event Delegation**: Reduces the number of event listeners
3. **Immutable State**: Makes state changes predictable and easier to debug
4. **Hash-Based Routing**: Simple and efficient without server configuration

## Browser Compatibility

mini works in all modern browsers (Chrome, Firefox, Safari, Edge) and does not require any polyfills for ES5+ environments.

## Extending the Framework

mini can be extended with additional modules:

- **Component System**: Add a component-based architecture
- **Form Handling**: Add form validation and submission helpers
- **Animation**: Add transition and animation helpers
- **Network**: Add AJAX/fetch wrappers

## Conclusion

mini demonstrates how modern JavaScript frameworks work under the hood while providing a practical tool for building applications. By understanding these core concepts, you'll gain insight into how larger frameworks like React, Vue, and Angular operate.