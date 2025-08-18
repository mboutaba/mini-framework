/**
 * Check if localStorage is available
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
 * Save todos to localStorage
 * @param {Object} todos - Todos object to save
 * @returns {boolean} True if saved successfully
 */
function saveTodosToStorage(todos) {
    if (!isStorageAvailable()) {
        console.warn('localStorage is not available, todos will not be saved');
        return false;
    }
    
    try {
        const dataToSave = {
            todos: todos,
            savedAt: Date.now()
        };
        localStorage.setItem('mini-todos-data', JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Failed to save todos to localStorage:', error);
        return false;
    }
}

/**
 * Load todos from localStorage
 * @returns {Object|null} Todos object or null if not found
 */
function loadTodosFromStorage() {
    if (!isStorageAvailable()) {
        console.warn('localStorage is not available, todos will not be loaded');
        return null;
    }
    
    try {
        const savedData = localStorage.getItem('mini-todos-data');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData && parsedData.todos) {
                return parsedData.todos;
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to load todos from localStorage:', error);
        return null;
    }
}