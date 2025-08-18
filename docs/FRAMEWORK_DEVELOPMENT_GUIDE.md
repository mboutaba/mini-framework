# Framework Development Guide - mini Project

## What is a Framework and What Are You Building?

### Framework vs Library - The Key Difference
- **Library**: You call its functions when you need them (you're in control)
- **Framework**: It calls your code when it needs to (framework is in control - "Inversion of Control")

### What You're Actually Building
You're creating a **JavaScript abstraction layer** that sits between developers and the browser's native APIs. Instead of developers writing complex DOM manipulation code, they'll use your simpler, more intuitive methods.

## The Framework Development Process

### Step 1: Create Abstraction Functions
Instead of developers writing:
```javascript
// Native DOM - complex and verbose
const element = document.createElement('div');
element.className = 'my-class';
element.textContent = 'Hello World';
document.body.appendChild(element);
```

They'll write:
```javascript
// Your framework - simple and clean
const element = mini.dom.createElement('div', { class: 'my-class' }, 'Hello World');
mini.dom.render(element, document.body);
```

### Step 2: Internal Object Representation
Your framework converts everything to JavaScript objects internally:
```javascript
// This is what your framework works with internally
{
  tag: 'div',
  attrs: { class: 'my-class' },
  children: ['Hello World']
}
```

### Step 3: Framework Controls the Flow
Your framework decides:
- When to create DOM elements
- When to update them
- How to handle events
- When to trigger state changes

## What You Need to Do - DOM Module

### Your Mission: Create `src/dom/` Module
You need to build functions that make DOM manipulation easier and more intuitive.

### Required Files to Create:

#### 1. `src/dom/element.js`
**Purpose**: Create and manage virtual elements
```javascript
// What you need to implement:
function createElement(tag, attributes, children) {
  // Returns a JavaScript object representing the element
}

function createTextNode(text) {
  // Returns a text node object
}
```

#### 2. `src/dom/attributes.js`
**Purpose**: Manage element attributes and properties
```javascript
// What you need to implement:
function setAttribute(element, name, value) {
  // Sets an attribute on your virtual element
}

function getAttribute(element, name) {
  // Gets an attribute from your virtual element
}

function addClass(element, className) {
  // Adds a CSS class
}
```

#### 3. `src/dom/manipulation.js`
**Purpose**: Handle element nesting and DOM tree operations
```javascript
// What you need to implement:
function appendChild(parent, child) {
  // Adds child to parent's children array
}

function removeChild(parent, child) {
  // Removes child from parent
}
```

#### 4. `src/dom/render.js`
**Purpose**: Convert your JavaScript objects to actual DOM elements
```javascript
// What you need to implement:
function render(virtualElement, container) {
  // Takes your JS object and creates real DOM elements
  // Inserts them into the container
}
```

### The Development Format/Process:

#### Phase 1: Design the API
1. Decide what functions developers will call
2. Define what parameters they take
3. Determine what they return

#### Phase 2: Implement Virtual Layer
1. Create functions that work with JavaScript objects
2. Don't touch the real DOM yet
3. Focus on data manipulation

#### Phase 3: Implement Rendering
1. Create functions that convert your objects to real DOM
2. Handle the actual browser API calls
3. Manage performance and updates

#### Phase 4: Integration
1. Connect your DOM module to the main framework
2. Update `src/index.js` to load your module
3. Test everything works together

## Practical Example - What You're Building

### Developer Uses Your Framework:
```javascript
// Developer writes this simple code
const todoItem = mini.dom.createElement('li', { class: 'todo-item' }, [
  mini.dom.createElement('input', { type: 'checkbox' }),
  mini.dom.createElement('span', {}, 'Buy groceries'),
  mini.dom.createElement('button', { class: 'delete' }, 'Delete')
]);

mini.dom.render(todoItem, document.querySelector('.todo-list'));
```

### Your Framework Internally:
1. **Creates object**: `{ tag: 'li', attrs: { class: 'todo-item' }, children: [...] }`
2. **Processes children**: Recursively handles nested elements
3. **Renders to DOM**: Converts to actual HTML elements
4. **Manages updates**: Handles changes efficiently

## Key Requirements for Your Implementation:

### 1. Object-Based Structure
Everything must work with this format:
```javascript
{
  tag: 'elementName',
  attrs: { attribute: 'value' },
  children: [/* child elements or text */]
}
```

### 2. Intuitive API
Your functions should be easier to use than native DOM:
- Fewer lines of code
- More readable
- Less error-prone

### 3. Framework Control
Your framework decides:
- When to update the DOM
- How to optimize performance
- How to handle complex operations

## Success Criteria:

### You'll Know You're Done When:
1. Developers can create elements without touching native DOM
2. Your API is simpler than `document.createElement`
3. Everything works with JavaScript objects internally
4. You can render these objects to actual DOM elements
5. The TodoMVC app can use your DOM functions

### Testing Your Work:
```javascript
// This should work when you're done:
const element = mini.dom.createElement('div', { id: 'test' }, 'Hello');
mini.dom.render(element, document.body);
// Should create: <div id="test">Hello</div>
```

## Next Steps After DOM Module:
1. **Events Module**: Handle clicks, inputs, etc.
2. **State Module**: Manage application data
3. **Routing Module**: Handle URL changes
4. **TodoMVC Implementation**: Use all modules together

Remember: You're not just writing functions - you're creating a new way for developers to interact with the browser. Your framework should make their lives easier and their code cleaner.
