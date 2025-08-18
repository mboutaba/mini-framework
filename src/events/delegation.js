/**
 * mini Framework - Event Delegation
 * Efficient event handling for dynamic content
 */

export class EventDelegation {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.delegatedSelectors = new Map();
    }

    // Delegate events based on CSS selectors
    delegate(container, selector, eventType, handler) {
        const delegatedHandler = (event) => {
            const target = event.target.closest(selector);
            if (target && container.contains(target)) {
                const enhancedEvent = this.eventSystem.createEnhancedEvent(event, target);
                handler.call(target, enhancedEvent);
            }
        };

        this.eventSystem.bind(container, { [eventType]: delegatedHandler });

        // Store for cleanup
        const key = `${selector}-${eventType}`;
        if (!this.delegatedSelectors.has(container)) {
            this.delegatedSelectors.set(container, new Set());
        }
        this.delegatedSelectors.get(container).add(key);
    }

    // Remove delegated events
    undelegate(container, selector, eventType) {
        const key = `${selector}-${eventType}`;
        const containerSelectors = this.delegatedSelectors.get(container);

        if (containerSelectors) {
            containerSelectors.delete(key);
            if (containerSelectors.size === 0) {
                this.delegatedSelectors.delete(container);
            }
        }
    }

    // Generic helper methods for common patterns
    delegateFormSubmission(container, formSelector, callback) {
        this.delegate(container, formSelector, 'submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            callback(formData, event);
        });
    }

    delegateButtonClick(container, buttonSelector, callback) {
        this.delegate(container, buttonSelector, 'click', callback);
    }

    delegateInputChange(container, inputSelector, callback) {
        this.delegate(container, inputSelector, 'change', callback);
    }


}