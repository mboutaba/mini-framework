/**
 * Reset the TodoMVC app to its initial state
 * This is useful for testing and demonstrations
 */
function resetApp() {
    const state = window.miniState;
    
    if (!state) {
        console.error('State module not loaded');
        return;
    }
    
    // Clear localStorage
    try {
        localStorage.removeItem('mini-todos');
    } catch (e) {
        console.error('Failed to clear localStorage:', e);
    }
    
    // Reset to initial state
    state.setState({
        todos: {
            1: { id: 1, title: 'Learn mini Framework', completed: false, createdAt: Date.now() },
            2: { id: 2, title: 'Build TodoMVC app', completed: false, createdAt: Date.now() + 100 },
            3: { id: 3, title: 'Master JavaScript', completed: true, createdAt: Date.now() + 200, completedAt: Date.now() + 300 }
        },
        nextId: 4,
        filter: 'all',
        editingId: null
    }, 'RESET_APP');
    
    console.log('App reset to initial state');
    
    // Navigate to default route
    if (window.mini && window.mini.routing) {
        window.mini.routing.navigateTo('all');
    }
    
    // Focus the new todo input
    setTimeout(() => {
        const newTodoInput = document.querySelector('.new-todo');
        if (newTodoInput) {
            newTodoInput.focus();
        }
    }, 100);
    
    return true;
}

// Make available in console for testing
window.resetApp = resetApp;