/**
 * mini Framework - Events Module
 * Integrates all event-related functionality
 */

(function() {
    'use strict';

    // Create the main event system
    const eventSystem = {
        eventHandlers: new Map(),
        delegatedEvents: new Set(),
        elementRegistry: new WeakMap(),
        
        // Initialize event delegation
        init: function() {
            console.log('🔄 Events module initialized');
            
            const delegatedEventTypes = [
                'click', 'input', 'submit', 'keydown', 'keyup', 'keypress',
                'change', 'focus', 'blur', 'mouseenter', 'mouseleave',
                'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick'
            ];
            
            delegatedEventTypes.forEach(eventType => {
                if (!this.delegatedEvents.has(eventType)) {
                    document.addEventListener(eventType, this.handleDelegatedEvent.bind(this), true);
                    this.delegatedEvents.add(eventType);
                }
            });
            
            // Attach to mini if available
            if (window.mini) {
                window.mini.events = this;
            }
        },
        
        // Bind events to elements
        bind: function(element, eventConfig) {
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
        },
        
        // Handle delegated events
        handleDelegatedEvent: function(event) {
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
        },
        
        // Wrap event handlers
        wrapHandler: function(handler, element) {
            return (event) => {
                const enhancedEvent = this.createEnhancedEvent(event, element);
                return handler.call(element, enhancedEvent);
            };
        },
        
        // Create enhanced event object
        createEnhancedEvent: function(event, element) {
            return {
                ...event,
                originalEvent: event,
                preventDefault: () => event.preventDefault(),
                stopPropagation: () => event.stopPropagation(),
                currentTarget: element,
                getValue: () => element.value || element.textContent,
                setValue: (value) => {
                    if ('value' in element) {
                        element.value = value;
                    } else {
                        element.textContent = value;
                    }
                }
            };
        },
        
        // Get element ID for tracking
        getElementId: function(element) {
            if (!element._miniEventId) {
                element._miniEventId = 'el_' + Math.random().toString(36).substr(2, 9);
            }
            return element._miniEventId;
        },
        
        // Normalize event type
        normalizeEventType: function(eventType) {
            return eventType.startsWith('on') ? eventType.substring(2).toLowerCase() : eventType.toLowerCase();
        },
        
        // Unbind events
        unbind: function(element, eventType = null) {
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
        },
        
        // Convenience methods for common events
        onClick: function(element, handler) {
            this.bind(element, { click: handler });
        },
        
        onInput: function(element, handler) {
            this.bind(element, { input: handler });
        },
        
        onSubmit: function(element, handler) {
            this.bind(element, { submit: handler });
        },
        
        onKeydown: function(element, handler) {
            this.bind(element, { keydown: handler });
        },
        
        onChange: function(element, handler) {
            this.bind(element, { change: handler });
        },
        
        onFocus: function(element, handler) {
            this.bind(element, { focus: handler });
        },
        
        onBlur: function(element, handler) {
            this.bind(element, { blur: handler });
        },
        
        onDoubleClick: function(element, handler) {
            this.bind(element, { dblclick: handler });
        },
        
        // Cleanup
        cleanup: function(element) {
            this.unbind(element);
        }
    };

    // Make available globally
    window.miniEvents = eventSystem;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            eventSystem.init();
        });
    } else {
        // DOM is already ready
        setTimeout(function() {
            eventSystem.init();
        }, 0);
    }

})();