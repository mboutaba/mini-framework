/**
 * mini Framework - State Store
 * Global state management with immutability and validation
 */

export class StateStore {
    constructor(initialState = {}) {
        this.state = this.deepClone(initialState);
        this.subscribers = new Map();
        this.middleware = [];
        this.devMode = false;
        this.history = [];
        this.maxHistorySize = 50;

        // Initialize with default structure for TodoMVC
        this.initializeDefaultState();
    }

    initializeDefaultState() {
        const defaultState = {
            todos: {},
            filter: 'all',
            nextId: 1,
            editingId: null,
            ...this.state
        };

        this.state = defaultState;
        this.addToHistory('INIT', defaultState);
    }

    // Core state management
    getState(path = null) {
        if (!path) return this.deepClone(this.state);

        return this.getNestedValue(this.state, path);
    }

    setState(updates, actionType = 'SET_STATE') {
        if (!updates || typeof updates !== 'object') {
            throw new Error('setState requires an object');
        }

        const prevState = this.deepClone(this.state);
        const newState = this.applyUpdates(prevState, updates);

        // Validate state changes
        if (!this.validateState(newState)) {
            throw new Error('State validation failed');
        }

        this.state = newState;
        this.addToHistory(actionType, newState, prevState);

        // Notify subscribers
        this.notifySubscribers(prevState, newState, actionType);

        return this.state;
    }

    // Update specific paths in state
    updatePath(path, value, actionType = 'UPDATE_PATH') {
        const updates = this.createNestedUpdate(path, value);
        return this.setState(updates, actionType);
    }

    // Merge updates with existing state
    mergeState(updates, actionType = 'MERGE_STATE') {
        const mergedUpdates = this.deepMerge(this.state, updates);
        return this.setState(mergedUpdates, actionType);
    }

    // State validation
    validateState(state) {
        // Basic validation - can be extended
        if (!state || typeof state !== 'object') return false;

        // TodoMVC specific validation
        if ('todos' in state && typeof state.todos !== 'object') return false;
        if ('filter' in state && !['all', 'active', 'completed'].includes(state.filter)) return false;
        if ('nextId' in state && typeof state.nextId !== 'number') return false;

        return true;
    }

    // Utility methods
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    deepMerge(target, source) {
        const result = this.deepClone(target);

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    applyUpdates(state, updates) {
        if (typeof updates === 'function') {
            return updates(state);
        }

        return this.deepMerge(state, updates);
    }

    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current === null || current === undefined) return undefined;
            current = current[key];
        }

        return this.deepClone(current);
    }

    createNestedUpdate(path, value) {
        const keys = path.split('.');
        const update = {};
        let current = update;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return update;
    }

    // History management
    addToHistory(action, state, prevState = null) {
        const historyEntry = {
            action,
            state: this.deepClone(state),
            prevState: prevState ? this.deepClone(prevState) : null,
            timestamp: Date.now()
        };

        this.history.push(historyEntry);

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    getHistory() {
        return this.deepClone(this.history);
    }

    // Subscriber management
    notifySubscribers(prevState, newState, actionType) {
        this.subscribers.forEach((subscriber, id) => {
            try {
                if (subscriber.selector) {
                    const prevSelected = subscriber.selector(prevState);
                    const newSelected = subscriber.selector(newState);

                    if (!this.isEqual(prevSelected, newSelected)) {
                        subscriber.callback(newSelected, prevSelected, actionType);
                    }
                } else {
                    subscriber.callback(newState, prevState, actionType);
                }
            } catch (error) {
                console.error(`Subscriber ${id} error:`, error);
            }
        });
    }

    isEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // Development utilities
    enableDevMode() {
        this.devMode = true;
        this.logStateChange = (action, state, prevState) => {
            console.group(`🔄 State Change: ${action}`);
            console.log('Previous:', prevState);
            console.log('Current:', state);
            console.groupEnd();
        };
    }

    disableDevMode() {
        this.devMode = false;
        this.logStateChange = null;
    }

    getStats() {
        return {
            stateSize: JSON.stringify(this.state).length,
            subscriberCount: this.subscribers.size,
            historySize: this.history.length,
            devMode: this.devMode
        };
    }

    // Reset state
    reset(newState = {}) {
        this.state = this.deepClone(newState);
        this.history = [];
        this.initializeDefaultState();
        this.notifySubscribers({}, this.state, 'RESET');
    }

    // Cleanup
    destroy() {
        this.subscribers.clear();
        this.history = [];
        this.state = {};
        this.middleware = [];
    }
}