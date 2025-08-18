/**
 * mini Framework - Events Module Entry Point
 * Main API for the event handling system
 */

import EventSystem from './eventSystem.js';
import { EventHandlers } from './handlers.js';
import { EventDelegation } from './delegation.js';

// Create the main event system instance
const eventSystem = new EventSystem();
const handlers = new EventHandlers(eventSystem);
const delegation = new EventDelegation(eventSystem);

// Main Events API
export const Events = {
    // System initialization
    init: (modules) => {
        eventSystem.setFrameworkModules(modules);
        return Events;
    },

    // Core binding methods
    bind: (element, config) => {
        eventSystem.bind(element, config);
        return Events;
    },

    unbind: (element, eventType) => {
        eventSystem.unbind(element, eventType);
        return Events;
    },

    // Declarative event methods
    onClick: (element, handler) => handlers.onClick(element, handler),
    onInput: (element, handler) => handlers.onInput(element, handler),
    onSubmit: (element, handler) => handlers.onSubmit(element, handler),
    onKeydown: (element, handler) => handlers.onKeydown(element, handler),
    onChange: (element, handler) => handlers.onChange(element, handler),
    onFocus: (element, handler) => handlers.onFocus(element, handler),
    onBlur: (element, handler) => handlers.onBlur(element, handler),
    onDoubleClick: (element, handler) => handlers.onDoubleClick(element, handler),

    // Event delegation
    delegate: (container, selector, eventType, handler) => {
        delegation.delegate(container, selector, eventType, handler);
        return Events;
    },

    undelegate: (container, selector, eventType) => {
        delegation.undelegate(container, selector, eventType);
        return Events;
    },

    // TodoMVC specific helpers
    bindTodoEvents: (container) => {
        delegation.delegateTodoEvents(container);
        return Events;
    },

    // Custom events
    emit: (element, eventType, detail) => {
        const customEvent = new CustomEvent(eventType, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(customEvent);
        return Events;
    },

    on: (element, eventType, handler) => {
        eventSystem.bind(element, { [eventType]: handler });
        return Events;
    },

    // Cleanup
    cleanup: (element) => {
        eventSystem.cleanup(element);
        return Events;
    },

    cleanupAll: (elements) => {
        elements.forEach(element => eventSystem.cleanup(element));
        return Events;
    },

    // System information
    getStats: () => eventSystem.getStats(),

    // Access to internal systems (for advanced usage)
    _system: eventSystem,
    _handlers: handlers,
    _delegation: delegation
};

// Default export
export default Events;