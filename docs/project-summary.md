# mini Framework Project Summary

## What You Need to Do

You are tasked with creating a **custom JavaScript framework** from scratch and demonstrating its capabilities by building a TodoMVC application. This is a framework development project, not just an application project.

### Key Distinction: Framework vs Library
- **Library**: You call its methods (you're in control)
- **Framework**: It calls your code (inversion of control)

## Core Requirements

### 1. Framework Implementation
Your framework must implement these four core features:

#### A. DOM Abstraction
- Create a way to handle the DOM programmatically
- Transform HTML structures into JavaScript objects
- Example transformation:
  ```html
  <div class="nameSubm">
    <input type="text" placeholder="Insert Name" />
  </div>
  ```
  Should become:
  ```javascript
  {
    "tag": "div",
    "attrs": { "class": "nameSubm" },
    "children": [
      {
        "tag": "input",
        "attrs": {
          "type": "text",
          "placeholder": "Insert Name"
        }
      }
    ]
  }
  ```

**Possible approaches:**
- Virtual DOM (compare virtual vs real DOM, update only differences)
- Data Binding (synchronize two data sources)
- Templating (client-side data binding with JavaScript)

#### B. Routing System
- Synchronize application state with URL
- URL should change based on user actions
- State should change when URL changes
- Enable navigation between different views/pages

#### C. State Management
- Handle application state across the entire app
- State represents the outcome of all user actions since page load
- Make state accessible from any part of the application
- Multiple pages/components should be able to interact with the same state

#### D. Event Handling
- Create a custom event handling system
- **Cannot use** the standard `addEventListener()` method
- Handle user interactions: clicks, scrolling, key bindings, etc.
- Must be different from native DOM event handling

### 2. TodoMVC Application
Build a fully functional TodoMVC application using your framework that includes:

**Required Features:**
- Add new todos
- Check/uncheck todos (mark as complete/incomplete)
- Remove todos from the list
- Edit todos (double-click to edit)
- Filter todos: All, Active, Completed
- Clear completed todos
- Todo counter (shows remaining active todos)
- Footer appears when todos exist

**Technical Requirements:**
- Must match the structure and behavior of standard TodoMVC examples
- All classes, IDs, and DOM structure must correspond to TodoMVC standards
- URL must change when switching between filters (All/Active/Completed)
- Counter must update accurately based on todo states

### 3. Documentation
Create comprehensive documentation in a **markdown file** that includes:

#### Required Documentation Sections:
- **Overview**: Top-level explanation of framework features
- **How it Works**: Explanation of the framework's internal mechanisms
- **Code Examples** showing how to:
  - Create an element
  - Add attributes to an element
  - Create and handle events
  - Nest elements
- **Why Things Work**: Explanation of design decisions and architecture

The documentation should enable a new user to understand and use your framework without guessing.

## Constraints and Rules

### What You CANNOT Use:
- React, Angular, Vue, or any other high-level frameworks/libraries
- Must be built with vanilla JavaScript
- Cannot use standard `addEventListener()` for event handling

### What You MUST Provide:
- A folder structure that allows running the app from the root
- Clear, comprehensive documentation
- A working TodoMVC implementation
- Clean, well-structured code following good practices

## How You'll Be Evaluated

### Functional Requirements (Must Have):
1. Framework implemented without prohibited libraries
2. Documentation in markdown format with all required sections
3. TodoMVC with all standard features working correctly
4. Proper DOM structure matching TodoMVC standards
5. URL routing working for filter states
6. All interactive features functioning (add, edit, delete, filter, clear)

### Code Quality:
- Follows good coding practices
- Clean, readable, maintainable code
- Proper error handling

### Bonus Points:
- Performance comparable to other TodoMVC implementations
- Framework makes DOM manipulation easier than vanilla JS
- Framework simplifies routing compared to vanilla JS
- Efficient execution (good use of recursion, minimal unnecessary requests)
- Asynchronous operations for better performance
- Overall project quality and polish

## Getting Started Approach

1. **Plan your framework architecture** - decide on DOM abstraction method, state management pattern, routing approach, and event system
2. **Implement core framework features** one by one
3. **Create comprehensive documentation** as you build
4. **Build the TodoMVC application** using your framework
5. **Test thoroughly** against TodoMVC standards
6. **Optimize and polish** for performance and usability

## Success Criteria

Your project will be successful when:
- A developer can read your documentation and immediately start using your framework
- Your TodoMVC works identically to standard implementations
- Your framework demonstrates clear advantages over vanilla JavaScript
- The code is clean, efficient, and well-documented
- All functional requirements are met without using prohibited libraries

This is a comprehensive framework development project that will demonstrate your understanding of JavaScript, DOM manipulation, application architecture, and framework design principles.
