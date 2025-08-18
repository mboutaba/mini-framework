/**
 * mini Framework - Event Handler Management
 * Declarative event binding methods
 */

export class EventHandlers {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
    }

    onClick(element, handler) {
        this.eventSystem.bind(element, { click: handler });
        return this;
    }

    onInput(element, handler) {
        this.eventSystem.bind(element, { input: handler });
        return this;
    }

    onSubmit(element, handler) {
        this.eventSystem.bind(element, { submit: handler });
        return this;
    }

    onKeydown(element, handler) {
        this.eventSystem.bind(element, { keydown: handler });
        return this;
    }

    onChange(element, handler) {
        this.eventSystem.bind(element, { change: handler });
        return this;
    }

    onFocus(element, handler) {
        this.eventSystem.bind(element, { focus: handler });
        return this;
    }

    onBlur(element, handler) {
        this.eventSystem.bind(element, { blur: handler });
        return this;
    }

    onDoubleClick(element, handler) {
        this.eventSystem.bind(element, { dblclick: handler });
        return this;
    }

    // Method chaining support
    and() {
        return this;
    }

    // Bind multiple events at once
    bindMultiple(element, eventConfig) {
        this.eventSystem.bind(element, eventConfig);
        return this;
    }

    // Remove event handlers
    remove(element, eventType) {
        this.eventSystem.unbind(element, eventType);
        return this;
    }
}