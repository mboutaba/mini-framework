/**
 * Export todos to JSON file
 */
function exportTodos() {
    const state = window.miniState;
    if (!state) {
        console.error('State module not loaded');
        return;
    }
    
    const todos = state.getState().todos;
    if (!todos || Object.keys(todos).length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No todos to export', 'error');
        }
        return;
    }
    
    const exportData = {
        todos: todos,
        exportedAt: new Date().toISOString(),
        count: Object.keys(todos).length
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'todos-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    if (typeof showNotification === 'function') {
        showNotification('Todos exported successfully', 'success');
    }
}

// Make available in console for testing
window.exportTodos = exportTodos;