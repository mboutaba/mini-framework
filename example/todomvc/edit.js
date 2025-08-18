// Fix for double-click editing using mini Events
function initializeEditFix() {
    // Wait for mini Events to be available
    if (!window.mini || !window.mini.events) {
        setTimeout(initializeEditFix, 100);
        return;
    }

    const events = window.mini.events;

    // Direct event handler for double-click on labels using mini Events
    events.onDoubleClick(document.body, function(e) {
        if (e.target.tagName === 'LABEL' && e.target.closest('.todo-list')) {
            const li = e.target.closest('li');
            if (li) {
                const id = parseInt(li.dataset.id);
                li.classList.add('editing');
                const editInput = li.querySelector('.edit');
                if (editInput) {
                    editInput.focus();
                    editInput.selectionStart = 0;
                    editInput.selectionEnd = editInput.value.length;
                }
                
                // Update state
                if (window.miniState) {
                    window.miniState.setState({
                        editingId: id
                    }, 'START_EDITING');
                }
                
                e.preventDefault();
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEditFix);
} else {
    initializeEditFix();
}

// Fix for Enter key in edit mode
document.addEventListener('DOMContentLoaded', function() {
    // Direct event handler for edit inputs
    document.body.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('edit') && e.key === 'Enter') {
            e.preventDefault();
            
            const li = e.target.closest('li');
            if (li) {
                const id = parseInt(li.dataset.id);
                const newValue = e.target.value.trim();
                
                // Call finishEditing if it exists
                if (typeof finishEditing === 'function') {
                    finishEditing(id, newValue);
                } else {
                    // Fallback: Update todo directly
                    const state = window.miniState;
                    if (state) {
                        const currentState = state.getState();
                        const todo = currentState.todos[id];
                        
                        if (todo) {
                            if (newValue === '') {
                                // Delete todo if empty
                                const newTodos = {...currentState.todos};
                                delete newTodos[id];
                                state.setState({
                                    todos: newTodos,
                                    editingId: null
                                }, 'DELETE_TODO');
                            } else {
                                // Update todo
                                const newTodos = {...currentState.todos};
                                newTodos[id] = {
                                    ...todo,
                                    title: newValue,
                                    updatedAt: Date.now()
                                };
                                state.setState({
                                    todos: newTodos,
                                    editingId: null
                                }, 'EDIT_TODO');
                            }
                        }
                    }
                    
                    // Exit edit mode
                    li.classList.remove('editing');
                }
            }
        }
    });
    
    // Also add inline handlers to edit inputs
    function updateEditInputs() {
        const editInputs = document.querySelectorAll('.edit');
        editInputs.forEach(input => {
            if (!input.getAttribute('onkeydown')) {
                input.setAttribute('onkeydown', `
                    if(event.key === 'Enter') {
                        event.preventDefault();
                        const li = this.closest('li');
                        const id = parseInt(li.dataset.id);
                        const value = this.value.trim();
                        if(typeof finishEditing === 'function') {
                            finishEditing(id, value);
                        } else {
                            li.classList.remove('editing');
                        }
                    }
                `);
            }
        });
    }
    
    // Update edit inputs when todos are rendered
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                updateEditInputs();
            }
        });
    });
    
    const todoList = document.querySelector('.todo-list');
    if (todoList) {
        observer.observe(todoList, { childList: true, subtree: true });
        updateEditInputs();
    }
});