/**
 * mini Framework - State Module Entry Point
 * Main API for state management system
 */

import { StateStore } from './store.js';
import { StateActions } from './actions.js';
import { StateSubscriptions } from './subscriptions.js';
import { StatePersistence } from './persistence.js';

// Create main state management instance
let stateInstance = null;

export const State = {
    // Initialize state system
    init: (initialState = {}, options = {}) => {
        if (stateInstance) {
            console.warn('State already initialized');
            return State;
        }

        const store = new StateStore(initialState);
        const actions = new StateActions(store);
        const subscriptions = new StateSubscriptions(store);
        const persistence = new StatePersistence(store, options.storageKey);

        // Initialize TodoMVC actions
        actions.initializeTodoActions();

        // Initialize persistence if enabled
        if (options.persistence !== false) {
            persistence.initialize();
        }

        // Enable dev mode if specified
        if (options.devMode) {
            store.enableDevMode();
        }

        stateInstance = {
            store,
            actions,
            subscriptions,
            persistence
        };

        return State;
    },

    // Core state operations
    getState: (path) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.store.getState(path);
    },

    setState: (updates, actionType) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.store.setState(updates, actionType);
    },

    updatePath: (path, value) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.store.updatePath(path, value);
    },

    // Action dispatching
    dispatch: (actionName, payload) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.actions.dispatch(actionName, payload);
    },

    dispatchAsync: (actionName, payload) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.actions.dispatchAsync(actionName, payload);
    },

    // Subscriptions
    subscribe: (callback, selector) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.subscribe(callback, selector);
    },

    subscribeComponent: (component, selector) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.subscribeComponent(component, selector);
    },

    connectElement: (element, stateKey, renderFunction) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.connectElement(element, stateKey, renderFunction);
    },

    // TodoMVC specific subscriptions
    subscribeTodoList: (element) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.subscribeTodoList(element);
    },

    subscribeFilter: (element) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.subscribeFilter(element);
    },

    subscribeCounter: (element) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.subscribeCounter(element);
    },

    // Computed properties
    createComputed: (selector, callback) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.subscriptions.createComputed(selector, callback);
    },

    // Persistence
    saveState: () => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.persistence.saveState();
    },

    loadState: () => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.persistence.loadState();
    },

    exportState: () => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.persistence.exportState();
    },

    importState: (jsonString) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.persistence.importState(jsonString);
    },

    // Utilities
    reset: (newState) => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.store.reset(newState);
    },

    getHistory: () => {
        if (!stateInstance) throw new Error('State not initialized');
        return stateInstance.store.getHistory();
    },

    getStats: () => {
        if (!stateInstance) throw new Error('State not initialized');
        return {
            store: stateInstance.store.getStats(),
            subscriptions: stateInstance.subscriptions.getStats(),
            persistence: stateInstance.persistence.getStorageInfo()
        };
    },

    // Module integration
    setDomModule: (domModule) => {
        if (!stateInstance) throw new Error('State not initialized');
        stateInstance.subscriptions.setDomModule(domModule);
    },

    // Development utilities
    enableDevMode: () => {
        if (!stateInstance) throw new Error('State not initialized');
        stateInstance.store.enableDevMode();
    },

    disableDevMode: () => {
        if (!stateInstance) throw new Error('State not initialized');
        stateInstance.store.disableDevMode();
    },

    // Cleanup
    cleanup: (component) => {
        if (!stateInstance) return;
        stateInstance.subscriptions.cleanup(component);
    },

    cleanupAll: () => {
        if (!stateInstance) return;
        stateInstance.subscriptions.cleanupAll();
    },

    destroy: () => {
        if (!stateInstance) return;
        stateInstance.store.destroy();
        stateInstance.persistence.destroy();
        stateInstance = null;
    },

    // Internal access (for framework integration)
    _getInstance: () => stateInstance
};

// Default export
export default State;