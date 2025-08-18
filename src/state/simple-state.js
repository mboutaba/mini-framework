/**
 * mini Framework - Simple State Module
 *
 * A lightweight, generic state management system that provides:
 * - Centralized state container
 * - Immutable state updates
 * - Subscription system for state changes
 * - Configurable local storage persistence
 * - Deep object merging
 *
 * @module state/simple-state
 * @version 1.0.0
 * @authors Hezron, Phillip, Stephen and Shisia
 */

(function() {
    'use strict';

    /**
     * Default configuration for state management
     * @type {Object}
     */
    const defaultConfig = {
        initialState: {},
        storageKey: 'mini-state',
        enablePersistence: true,
        enableLogging: false
    };

    /** @type {Object} Current configuration */
    let config = { ...defaultConfig };

    /** @type {Object} Current application state */
    let state = {};

    /** @type {Array} Collection of subscriber callbacks */
    const subscribers = [];

    /**
     * Checks if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    function isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * State management object with methods for state operations
     * @namespace
     */
    const stateManager = {
        /**
         * Initializes the state module with configuration
         * @param {Object} userConfig - Configuration options
         * @param {Object} userConfig.initialState - Initial state object
         * @param {string} userConfig.storageKey - Key for localStorage persistence
         * @param {boolean} userConfig.enablePersistence - Whether to persist state
         * @param {boolean} userConfig.enableLogging - Whether to log state changes
         * @returns {Object} The state manager instance for chaining
         */
        init: function(userConfig = {}) {
            // Merge user config with defaults
            config = { ...defaultConfig, ...userConfig };

            // Set initial state
            state = { ...config.initialState };

            if (config.enableLogging) {
                console.log('🔄 State module initialized with config:', config);
            }

            // Load from localStorage if persistence is enabled
            if (config.enablePersistence) {
                this.loadFromStorage();
            }

            // Attach to mini if available
            if (window.mini) {
                window.mini.state = this;
            }

            return this;
        },
        
        /**
         * Gets current state or a specific path in the state
         * @param {string|null} path - Dot notation path to specific state value (e.g., 'todos.1.title')
         * @returns {*} The requested state or undefined if path doesn't exist
         */
        getState: function(path = null) {
            // Return a copy of the entire state if no path specified
            if (!path) return { ...state };
            
            // Handle dot notation paths
            const keys = path.split('.');
            let current = state;
            
            // Navigate through the path
            for (const key of keys) {
                if (current === null || current === undefined) return undefined;
                current = current[key];
            }
            
            // Return a copy if object to maintain immutability
            return (typeof current === 'object' && current !== null) ? 
                { ...current } : current;
        },
        
        /**
         * Updates the application state
         * @param {Object|Function} updates - Object to merge with state or function that returns new state
         * @param {string} actionType - Name of the action for debugging and tracking
         * @returns {Object} The new state
         * @throws {Error} If updates is not an object or function
         */
        setState: function(updates, actionType = 'SET_STATE') {
            // Validate input
            if (typeof updates !== 'object' && typeof updates !== 'function') {
                throw new Error('setState requires an object or function');
            }
            
            // Create a copy of the previous state for comparison
            const prevState = { ...state };
            
            // Apply updates based on type
            if (typeof updates === 'function') {
                try {
                    state = updates(state);
                } catch (error) {
                    console.error('Error in state update function:', error);
                    throw error; // Re-throw to allow caller to handle
                }
            } else {
                state = this.deepMerge(state, updates);
            }
            
            // Track last action for debugging
            this._lastAction = actionType;
            
            // Persist state changes
            this.saveToStorage();
            
            // Notify subscribers of state change
            this.notifySubscribers(prevState, state, actionType);
            
            return state;
        },
        
        /**
         * Subscribes to state changes
         * @param {Function} callback - Function to call when state changes
         * @returns {Function} Unsubscribe function
         * @throws {Error} If callback is not a function
         */
        subscribe: function(callback) {
            if (typeof callback !== 'function') {
                throw new Error('subscribe requires a function');
            }
            
            subscribers.push(callback);
            
            // Return unsubscribe function
            return () => {
                const index = subscribers.indexOf(callback);
                if (index > -1) {
                    subscribers.splice(index, 1);
                }
            };
        },
        
        /**
         * Notifies all subscribers of state changes
         * @param {Object} prevState - Previous state
         * @param {Object} newState - New state
         * @param {string} actionType - Type of action that caused the change
         * @private
         */
        notifySubscribers: function(prevState, newState, actionType) {
            subscribers.forEach(subscriber => {
                try {
                    subscriber(newState, prevState, actionType);
                } catch (error) {
                    console.error('Subscriber error:', error);
                    // Don't throw here to prevent one bad subscriber from breaking others
                }
            });
        },
        
        /**
         * Deep merges two objects recursively
         * @param {Object} target - Target object
         * @param {Object} source - Source object to merge into target
         * @returns {Object} New merged object
         */
        deepMerge: function(target, source) {
            // Create a new object to avoid modifying the target
            const result = { ...target };
            
            // Handle null or undefined source
            if (source === null || source === undefined) {
                return result;
            }
            
            // Iterate through source properties
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    // Recursively merge objects (but not arrays)
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        result[key] = this.deepMerge(result[key] || {}, source[key]);
                    } else {
                        // Direct assignment for primitives, arrays, and null
                        result[key] = source[key];
                    }
                }
            }
            
            return result;
        },
        
        /**
         * Saves state to localStorage
         * @returns {boolean} True if save was successful
         */
        saveToStorage: function() {
            if (!config.enablePersistence || !isStorageAvailable()) {
                return false;
            }

            try {
                localStorage.setItem(config.storageKey, JSON.stringify(state));
                return true;
            } catch (error) {
                console.error('Failed to save state to localStorage:', error);
                return false;
            }
        },
        
        /**
         * Loads state from localStorage
         * @returns {boolean} True if load was successful
         */
        loadFromStorage: function() {
            if (!config.enablePersistence || !isStorageAvailable()) {
                return false;
            }

            try {
                const savedState = localStorage.getItem(config.storageKey);
                if (!savedState) return false;

                const parsedState = JSON.parse(savedState);

                // Validate the loaded state
                if (!parsedState || typeof parsedState !== 'object') {
                    return false;
                }

                // Merge with initial state to ensure all required properties exist
                state = this.deepMerge(config.initialState, parsedState);
                return true;
            } catch (error) {
                console.error('Failed to load state from localStorage:', error);
                return false;
            }
        },
        
        /**
         * Resets state to initial values
         * @returns {Object} The reset state
         */
        reset: function() {
            state = { ...config.initialState };
            this.saveToStorage();
            this.notifySubscribers({}, state, 'RESET');
            return state;
        },

        /**
         * Gets basic statistics about the current state
         * @returns {Object} Statistics object
         */
        getStats: function() {
            return {
                stateKeys: Object.keys(state),
                subscriberCount: subscribers.length,
                storageEnabled: config.enablePersistence,
                storageKey: config.storageKey
            };
        },

        /**
         * Gets the current configuration
         * @returns {Object} Current configuration
         */
        getConfig: function() {
            return { ...config };
        }
    };

    // Make available globally with safety check
    if (typeof window !== 'undefined') {
        window.miniState = stateManager;
    }

    // Auto-initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                stateManager.init();
            });
        } else {
            // DOM is already ready - initialize on next tick to ensure
            // all dependencies have loaded
            setTimeout(function() {
                stateManager.init();
            }, 0);
        }
    }

})();