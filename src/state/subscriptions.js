/**
 * mini Framework - State Subscriptions
 * Component subscription and reactivity system
 */

export class StateSubscriptions {
    constructor(store) {
        this.store = store;
        this.subscriptions = new Map();
        this.nextId = 1;
        this.renderQueue = new Set();
        this.isRendering = false;
        this.domModule = null;
    }

    setDomModule(domModule) {
        this.domModule = domModule;
    }

    // Subscribe to state changes
    subscribe(callback, selector = null) {
        const id = this.nextId++;

        const subscription = {
            id,
            callback,
            selector,
            active: true,
            lastValue: selector ? selector(this.store.getState()) : this.store.getState()
        };

        this.subscriptions.set(id, subscription);
        this.store.subscribers.set(id, subscription);

        return () => this.unsubscribe(id);
    }

    // Unsubscribe from state changes
    unsubscribe(id) {
        this.subscriptions.delete(id);
        this.store.subscribers.delete(id);
    }

    // Subscribe component to state
    subscribeComponent(component, selector = null) {
        const unsubscribe = this.subscribe((newState, prevState, actionType) => {
            this.scheduleComponentUpdate(component, newState, prevState, actionType);
        }, selector);

        // Store unsubscribe function on component
        if (component && typeof component === 'object') {
            component._unsubscribe = unsubscribe;
        }

        return unsubscribe;
    }

    // Schedule component update
    scheduleComponentUpdate(component, newState, prevState, actionType) {
        if (component && typeof component.update === 'function') {
            this.renderQueue.add({
                component,
                newState,
                prevState,
                actionType
            });

            this.flushRenderQueue();
        } else if (component && component.element) {
            // For DOM elements, trigger re-render
            this.scheduleElementUpdate(component.element, newState, prevState, actionType);
        }
    }

    // Schedule DOM element update
    scheduleElementUpdate(element, newState, prevState, actionType) {
        if (element && element._renderFunction) {
            this.renderQueue.add({
                element,
                renderFunction: element._renderFunction,
                newState,
                prevState,
                actionType
            });

            this.flushRenderQueue();
        }
    }

    // Flush render queue
    flushRenderQueue() {
        if (this.isRendering) return;

        this.isRendering = true;

        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            this.renderQueue.forEach(update => {
                try {
                    if (update.component && update.component.update) {
                        update.component.update(update.newState, update.prevState, update.actionType);
                    } else if (update.element && update.renderFunction) {
                        update.renderFunction(update.element, update.newState, update.prevState);
                    }
                } catch (error) {
                    console.error('Component update error:', error);
                }
            });

            this.renderQueue.clear();
            this.isRendering = false;
        });
    }

    // Create reactive property
    createReactiveProperty(target, property, selector) {
        let currentValue = selector(this.store.getState());

        const subscription = this.subscribe((newState) => {
            const newValue = selector(newState);
            if (newValue !== currentValue) {
                currentValue = newValue;
                target[property] = newValue;
            }
        }, selector);

        Object.defineProperty(target, property, {
            get: () => currentValue,
            set: (value) => {
                // Optionally update state when property is set
                console.warn(`Property ${property} is reactive and should be updated through state`);
            },
            enumerable: true,
            configurable: true
        });

        return subscription;
    }

    // Connect DOM element to state
    connectElement(element, stateKey, renderFunction) {
        element._renderFunction = renderFunction;
        element._stateKey = stateKey;

        const selector = stateKey ? (state) => state[stateKey] : null;

        return this.subscribe((newState, prevState, actionType) => {
            this.scheduleElementUpdate(element, newState, prevState, actionType);
        }, selector);
    }

    // TodoMVC specific subscriptions
    subscribeTodoList(element) {
        return this.subscribe((newState, prevState) => {
            if (this.domModule && this.domModule.updateTodoList) {
                this.domModule.updateTodoList(element, newState.todos, newState.filter);
            }
        }, (state) => ({ todos: state.todos, filter: state.filter }));
    }

    subscribeFilter(element) {
        return this.subscribe((newState, prevState) => {
            if (newState.filter !== prevState.filter) {
                this.updateFilterUI(element, newState.filter);
            }
        }, (state) => state.filter);
    }

    subscribeCounter(element) {
        return this.subscribe((newState) => {
            const activeCount = Object.values(newState.todos).filter(todo => !todo.completed).length;
            element.textContent = activeCount;
        }, (state) => Object.values(state.todos).filter(todo => !todo.completed).length);
    }

    updateFilterUI(element, filter) {
        const filters = element.querySelectorAll('.filter');
        filters.forEach(filterEl => {
            filterEl.classList.toggle('selected', filterEl.dataset.filter === filter);
        });
    }

    // Computed properties
    createComputed(selector, callback) {
        let currentValue = selector(this.store.getState());

        const subscription = this.subscribe((newState) => {
            const newValue = selector(newState);
            if (newValue !== currentValue) {
                const oldValue = currentValue;
                currentValue = newValue;
                callback(newValue, oldValue);
            }
        }, selector);

        return {
            get value() { return currentValue; },
            unsubscribe: subscription
        };
    }

    // Cleanup subscriptions
    cleanup(component) {
        if (component && component._unsubscribe) {
            component._unsubscribe();
            delete component._unsubscribe;
        }
    }

    cleanupAll() {
        this.subscriptions.forEach((subscription, id) => {
            this.unsubscribe(id);
        });
        this.renderQueue.clear();
    }

    // Get subscription stats
    getStats() {
        return {
            activeSubscriptions: this.subscriptions.size,
            renderQueueSize: this.renderQueue.size,
            isRendering: this.isRendering
        };
    }
}