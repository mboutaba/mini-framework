/**
 * mini Framework - State Persistence
 * localStorage integration for state persistence
 */

export class StatePersistence {
    constructor(store, key = 'mini_state') {
        this.store = store;
        this.storageKey = key;
        this.enabled = this.isStorageAvailable();
        this.autoSave = true;
        this.debounceTimeout = null;
        this.debounceDelay = 300;
    }

    // Check if localStorage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Save state to localStorage
    saveState(state = null) {
        if (!this.enabled) return false;

        const stateToSave = state || this.store.getState();

        try {
            const serialized = JSON.stringify(stateToSave);
            localStorage.setItem(this.storageKey, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }

    // Load state from localStorage
    loadState() {
        if (!this.enabled) return null;

        try {
            const serialized = localStorage.getItem(this.storageKey);
            if (serialized === null) return null;

            return JSON.parse(serialized);
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    }

    // Initialize persistence
    initialize() {
        if (!this.enabled) return;

        // Load saved state
        const savedState = this.loadState();
        if (savedState) {
            this.store.setState(savedState, 'LOAD_PERSISTED_STATE');
        }

        // Setup auto-save
        if (this.autoSave) {
            this.setupAutoSave();
        }
    }

    // Setup automatic saving
    setupAutoSave() {
        this.store.subscribers.set('persistence', {
            callback: (newState) => {
                this.debouncedSave(newState);
            },
            selector: null
        });
    }

    // Debounced save to prevent excessive localStorage writes
    debouncedSave(state) {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            this.saveState(state);
        }, this.debounceDelay);
    }

    // Clear saved state
    clearSavedState() {
        if (!this.enabled) return false;

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear saved state:', error);
            return false;
        }
    }

    // Enable/disable auto-save
    setAutoSave(enabled) {
        this.autoSave = enabled;

        if (enabled) {
            this.setupAutoSave();
        } else {
            this.store.subscribers.delete('persistence');
        }
    }

    // Get storage info
    getStorageInfo() {
        if (!this.enabled) return { available: false };

        try {
            const used = JSON.stringify(this.store.getState()).length;
            const available = this.isStorageAvailable();

            return {
                available,
                used,
                key: this.storageKey,
                autoSave: this.autoSave
            };
        } catch (error) {
            return { available: false, error: error.message };
        }
    }

    // Export state as JSON
    exportState() {
        const state = this.store.getState();
        const exported = {
            state,
            timestamp: Date.now(),
            version: '1.0.0'
        };

        return JSON.stringify(exported, null, 2);
    }

    // Import state from JSON
    importState(jsonString) {
        try {
            const imported = JSON.parse(jsonString);

            if (imported.state) {
                this.store.setState(imported.state, 'IMPORT_STATE');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }

    // Cleanup
    destroy() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.store.subscribers.delete('persistence');
    }
}