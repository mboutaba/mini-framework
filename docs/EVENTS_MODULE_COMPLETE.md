# mini Framework - Events Module

## Overview
The Events Module provides a custom event handling system that replaces the standard `addEventListener` method. It offers event delegation, declarative event binding, and integration with the state management system.

## Core Concepts

### Custom Event System
The Events Module creates its own event handling system that wraps native DOM events, providing enhanced functionality.

### Event Delegation
Events are delegated to container elements, improving performance by reducing the number of event listeners.

### Enhanced Event Objects
Event objects are enhanced with additional methods and properties for easier interaction.

### State Integration
Events can directly update application state when integrated with the State Management module.

## API Reference

### Module Initialization

#### `init()`
Initializes the events module.

```javascript
miniEvents.init();
```

### Event Binding

#### `bind(element, eventConfig)`
Binds events to an element.

```javascript
// Bind multiple events
miniEvents.bind(todoItem, {
  click: handleClick,
  dblclick: handleDoubleClick,
  keydown: handleKeyDown
});

// Bind to virtual elements
const button = miniDOM.createElement('button', {}, 'Click Me');
miniEvents.bind(button, {
  click: () => alert('Button clicked!')
});
```

#### `unbind(element, eventType = null)`
Unbinds events from an element.

```javascript
// Unbind specific event
miniEvents.unbind(element, 'click');

// Unbind all events
miniEvents.unbind(element);
```

### Convenience Methods

#### `onClick(element, handler)`
Binds a click event handler.

```javascript
miniEvents.onClick(button, function(e) {
  console.log('Button clicked!');
});
```

#### `onInput(element, handler)`
Binds an input event handler.

```javascript
miniEvents.onInput(inputField, function(e) {
  console.log('Input value:', e.target.value);
});
```

#### `onSubmit(element, handler)`
Binds a submit event handler.

```javascript
miniEvents.onSubmit(form, function(e) {
  e.preventDefault();
  submitForm();
});
```

#### `onKeydown(element, handler)`
Binds a keydown event handler.

```javascript
miniEvents.onKeydown(inputField, function(e) {
  if (e.key === 'Enter') {
    submitForm();
  }
});
```

#### `onChange(element, handler)`
Binds a change event handler.

```javascript
miniEvents.onChange(selectBox, function(e) {
  console.log('Selected:', e.target.value);
});
```

#### `onFocus(element, handler)`
Binds a focus event handler.

```javascript
miniEvents.onFocus(inputField, function(e) {
  highlightField(e.target);
});
```

#### `onBlur(element, handler)`
Binds a blur event handler.

```javascript
miniEvents.onBlur(inputField, function(e) {
  validateField(e.target);
});
```

#### `onDoubleClick(element, handler)`
Binds a double-click event handler.

```javascript
miniEvents.onDoubleClick(todoItem, function(e) {
  startEditing(e.target);
});
```

### Event Delegation

#### `delegate(container, selector, eventType, handler)`
Delegates an event to elements matching a selector.

```javascript
miniEvents.delegate(todoList, 'li', 'click', function(e) {
  console.log('Todo item clicked:', e.target);
});
```

#### `undelegate(container, selector, eventType)`
Removes a delegated event.

```javascript
miniEvents.undelegate(todoList, 'li', 'click');
```

### Cleanup

#### `cleanup(element)`
Removes all event handlers from an element.

```javascript
miniEvents.cleanup(element);
```

## Enhanced Event Object

The event object passed to handlers includes additional properties and methods:

```javascript
miniEvents.onClick(button, function(e) {
  // Original event
  const originalEvent = e.originalEvent;
  
  // Standard methods
  e.preventDefault();
  e.stopPropagation();
  
  // Enhanced methods
  const value = e.getValue(); // Get element value
  e.setValue('New value'); // Set element value
  
  // State integration (when connected to state module)
  e.updateState({ filter: 'active' });
  const todos = e.getState('todos');
});
```

## How It Works

1. **Event Delegation**: Instead of attaching event listeners to individual elements, the Events Module attaches listeners to container elements and uses event bubbling to handle events.

2. **Event Registry**: The module maintains a registry of elements and their event handlers.

3. **Event Wrapping**: Native DOM events are wrapped with enhanced event objects that provide additional functionality.

4. **Event Propagation**: Events bubble up the DOM tree, allowing for efficient event delegation.

## Example: TodoMVC Event Handling

```javascript
// Initialize events module
miniEvents.init();

// Get DOM elements
const todoList = document.querySelector('.todo-list');
const newTodoInput = document.querySelector('.new-todo');
const clearCompletedButton = document.querySelector('.clear-completed');

// Add new todo on Enter
miniEvents.onKeydown(newTodoInput, function(e) {
  if (e.key === 'Enter') {
    const value = e.target.value.trim();
    if (value) {
      addTodo(value);
      e.target.value = '';
    }
  }
});

// Toggle todo completion
miniEvents.bind(todoList, {
  click: function(e) {
    if (e.target.classList.contains('toggle')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      toggleTodo(id);
    }
  }
});

// Delete todo
miniEvents.bind(todoList, {
  click: function(e) {
    if (e.target.classList.contains('destroy')) {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      deleteTodo(id);
    }
  }
});

// Edit todo on double-click
miniEvents.bind(todoList, {
  dblclick: function(e) {
    if (e.target.tagName === 'LABEL') {
      const li = e.target.closest('li');
      const id = parseInt(li.dataset.id);
      startEditing(id);
    }
  }
});

// Clear completed todos
miniEvents.onClick(clearCompletedButton, function() {
  clearCompletedTodos();
});
```

## Best Practices

1. **Use Event Delegation**: Delegate events to container elements when handling multiple similar elements.

2. **Clean Up Event Handlers**: Use `cleanup()` to remove event handlers when elements are removed.

3. **Prefer Declarative Methods**: Use convenience methods like `onClick()` for better readability.

4. **Handle Event Errors**: Wrap event handler code in try/catch blocks to prevent unhandled exceptions.

5. **Avoid Inline Event Handlers**: Keep event logic separate from element creation for better maintainability.