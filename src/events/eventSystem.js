/**
 * mini Framework - Core Event System
 * Alternative to addEventListener with framework integration
 */

class EventSystem {
    constructor() {
        this.eventHandlers = new Map();
        this.delegatedEvents = new Set();
        this.elementRegistry = new WeakMap();
        this.stateManager = null;
        this.domModule = null;

        this.initializeEventDelegation();
    }

    initializeEventDelegation() {
        const delegatedEventTypes = [
            'click', 'input', 'submit', 'keydown', 'keyup', 'keypress',
            'change', 'focus', 'blur', 'mouseenter', 'mouseleave',
            'mousedown', 'mouseup', 'touchstart', 'touchend'
        ];

        delegatedEventTypes.forEach(eventType => {
            if (!this.delegatedEvents.has(eventType)) {
                document.addEventListener(eventType, this.handleDelegatedEvent.bind(this), true);
                this.delegatedEvents.add(eventType);
            }
        });
    }

    setFrameworkModules({ stateManager, domModule }) {
        this.stateManager = stateManager;
        this.domModule = domModule;
    }

    bind(element, eventConfig) {
        if (!element || !eventConfig) return;

        // Handle virtual elements
        if (element && typeof element === 'object' && element.tag) {
            if (!element._events) element._events = {};
            Object.assign(element._events, eventConfig);
            return;
        }

        const elementId = this.getElementId(element);

        if (!this.eventHandlers.has(elementId)) {
            this.eventHandlers.set(elementId, new Map());
        }

        const elementHandlers = this.eventHandlers.get(elementId);

        Object.entries(eventConfig).forEach(([eventType, handler]) => {
            const normalizedEventType = this.normalizeEventType(eventType);

            if (!elementHandlers.has(normalizedEventType)) {
                elementHandlers.set(normalizedEventType, []);
            }

            const wrappedHandler = this.wrapHandler(handler, element);
            elementHandlers.get(normalizedEventType).push(wrappedHandler);

            this.elementRegistry.set(element, {
                id: elementId,
                events: elementHandlers
            });
        });
    }

    handleDelegatedEvent(event) {
        let target = event.target;

        while (target && target !== document) {
            const elementData = this.elementRegistry.get(target);

            if (elementData && elementData.events.has(event.type)) {
                const handlers = elementData.events.get(event.type);

                handlers.forEach(handler => {
                    try {
                        handler.call(target, event);
                    } catch (error) {
                        console.error('Event handler error:', error);
                    }
                });
            }

            target = target.parentElement;
        }
    }

    wrapHandler(handler, element) {
        return (event) => {
            const enhancedEvent = this.createEnhancedEvent(event, element);
            const result = handler.call(element, enhancedEvent);

            if (result && typeof result === 'object' && result.stateUpdate) {
                this.handleStateUpdate(result.stateUpdate);
            }

            return result;
        };
    }

    createEnhancedEvent(event, element) {
        return {
            ...event,
            originalEvent: event,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            currentTarget: element,

            updateState: (stateUpdate) => {
                if (this.stateManager) {
                    this.stateManager.setState(stateUpdate);
                }
                return { stateUpdate };
            },

            getState: (key) => {
                if (this.stateManager) {
                    return key ? this.stateManager.getState(key) : this.stateManager.getState();
                }
                return null;
            },

            getValue: () => element.value || element.textContent,
            setValue: (value) => {
                if ('value' in element) {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            }
        };
    }

    handleStateUpdate(stateUpdate) {
        if (this.stateManager) {
            if (typeof this.stateManager.setState === 'function') {
                this.stateManager.setState(stateUpdate);
            } else if (typeof this.stateManager.update === 'function') {
                this.stateManager.update(stateUpdate);
            }
        }
    }

    getElementId(element) {
        if (!element._miniEventId) {
            element._miniEventId = 'el_' + Math.random().toString(36).substr(2, 9);
        }
        return element._miniEventId;
    }

    normalizeEventType(eventType) {
        return eventType.startsWith('on') ? eventType.substring(2).toLowerCase() : eventType.toLowerCase();
    }

    unbind(element, eventType = null) {
        const elementData = this.elementRegistry.get(element);
        if (!elementData) return;

        if (eventType) {
            elementData.events.delete(this.normalizeEventType(eventType));
        } else {
            elementData.events.clear();
        }

        if (elementData.events.size === 0) {
            this.eventHandlers.delete(elementData.id);
            this.elementRegistry.delete(element);
        }
    }

    cleanup(element) {
        this.unbind(element);
    }

    destroy() {
        this.delegatedEvents.forEach(eventType => {
            document.removeEventListener(eventType, this.handleDelegatedEvent.bind(this), true);
        });

        this.eventHandlers.clear();
        this.delegatedEvents.clear();
        this.stateManager = null;
        this.domModule = null;
    }
}

export default EventSystem;