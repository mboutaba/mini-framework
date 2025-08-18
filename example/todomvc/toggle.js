// Fix for toggle and clear completed functionality using mini Events
function initializeToggleFix() {
    // Wait for mini Events to be available
    if (!window.mini || !window.mini.events) {
        setTimeout(initializeToggleFix, 100);
        return;
    }

    const events = window.mini.events;
    // Make toggle and clear completed functions globally available
    function makeGlobalFunctions() {
        if (typeof toggleTodo === 'function') {
            window.toggleTodo = toggleTodo;
        }
        
        if (typeof clearCompletedTodos === 'function') {
            window.clearCompletedTodos = clearCompletedTodos;
        }
    }
    
    // Try immediately and also after a delay to ensure app.js has loaded
    makeGlobalFunctions();
    setTimeout(makeGlobalFunctions, 500);
    
    // Direct event handler for toggle checkboxes using mini Events
    events.onClick(document.body, function(e) {
        // Handle toggle checkbox clicks
        if (e.target.classList.contains('toggle')) {
            const li = e.target.closest('li');
            if (li) {
                const id = parseInt(li.dataset.id);
                
                // Call the toggleTodo function if it exists
                if (typeof toggleTodo === 'function') {
                    toggleTodo(id);
                } else {
                    // Fallback: Toggle todo directly
                    const state = window.miniState;
                    if (state) {
                        const currentState = state.getState();
                        const todo = currentState.todos[id];
                        
                        if (todo) {
                            const newTodos = {...currentState.todos};
                            newTodos[id] = {
                                ...todo,
                                completed: !todo.completed
                            };
                            
                            state.setState({
                                todos: newTodos
                            }, 'TOGGLE_TODO');
                            
                            // Update UI directly as fallback
                            li.classList.toggle('completed', !todo.completed);
                        }
                    }
                }
            }
        }
        
        // Handle clear completed button clicks
        if (e.target.classList.contains('clear-completed')) {
            // Call the clearCompletedTodos function if it exists
            if (typeof clearCompletedTodos === 'function') {
                clearCompletedTodos();
            } else {
                // Fallback: Clear completed todos directly
                const state = window.miniState;
                if (state) {
                    const currentState = state.getState();
                    const newTodos = {...currentState.todos};
                    
                    // Remove completed todos
                    Object.keys(newTodos).forEach(id => {
                        if (newTodos[id].completed) {
                            delete newTodos[id];
                        }
                    });
                    
                    state.setState({
                        todos: newTodos
                    }, 'CLEAR_COMPLETED');
                    
                    // Update UI directly as fallback
                    document.querySelectorAll('.todo-list li.completed').forEach(li => {
                        li.classList.add('deleting');
                        setTimeout(() => li.remove(), 300);
                    });
                }
            }
        }
    });
    
    // Add inline handlers to toggle checkboxes
    function updateToggleHandlers() {
        document.querySelectorAll('.toggle').forEach(checkbox => {
            if (!checkbox.getAttribute('onclick')) {
                checkbox.setAttribute('onclick', `
                    const li = this.closest('li');
                    const id = parseInt(li.dataset.id);
                    if (typeof toggleTodo === 'function') {
                        toggleTodo(id);
                        return false;
                    }
                `);
            }
        });
        
        // Add handler to clear completed button
        const clearBtn = document.querySelector('.clear-completed');
        if (clearBtn && !clearBtn.getAttribute('onclick')) {
            clearBtn.setAttribute('onclick', `
                if (typeof clearCompletedTodos === 'function') {
                    clearCompletedTodos();
                    return false;
                }
            `);
        }
    }
    
    // Update handlers when DOM changes
    const observer = new MutationObserver(updateToggleHandlers);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial update
    updateToggleHandlers();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToggleFix);
} else {
    initializeToggleFix();
}

// Add direct inline handlers to toggle checkboxes
document.addEventListener('DOMContentLoaded', function() {
    // Function to update all toggle checkboxes
    function updateToggleCheckboxes() {
        document.querySelectorAll('.toggle').forEach(checkbox => {
            // Add direct onclick attribute that doesn't rely on any framework functions
            checkbox.setAttribute('onclick', `
                const li = this.closest('li');
                li.classList.toggle('completed', this.checked);
                
                const id = parseInt(li.dataset.id);
                const state = window.miniState;
                if (state) {
                    const currentState = state.getState();
                    const todo = currentState.todos[id];
                    if (todo) {
                        const newTodos = {...currentState.todos};
                        newTodos[id] = {
                            ...todo,
                            completed: this.checked
                        };
                        state.setState({
                            todos: newTodos
                        }, 'TOGGLE_TODO');
                    }
                }
            `);
        });
    }
    
    // Initial update
    updateToggleCheckboxes();
    
    // Update when DOM changes
    const observer = new MutationObserver(function(mutations) {
        updateToggleCheckboxes();
    });
    
    observer.observe(document.querySelector('.todo-list') || document.body, {
        childList: true,
        subtree: true
    });
});