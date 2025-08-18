// Direct fix for toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add direct native event listeners to handle toggle clicks
    document.addEventListener('click', function(event) {
        // Handle toggle checkbox clicks
        if (event.target.classList.contains('toggle')) {
            const li = event.target.closest('li');
            if (li) {
                const id = parseInt(li.dataset.id);
                
                // Toggle completed state directly in the DOM
                li.classList.toggle('completed');
                
                // Update state directly
                const state = window.miniState;
                if (state) {
                    const currentState = state.getState();
                    const todo = currentState.todos[id];
                    
                    if (todo) {
                        const newCompleted = !todo.completed;
                        const newTodos = {...currentState.todos};
                        newTodos[id] = {
                            ...todo,
                            completed: newCompleted,
                            completedAt: newCompleted ? Date.now() : null
                        };
                        
                        state.setState({
                            todos: newTodos
                        }, 'TOGGLE_TODO');
                        
                        console.log(`Todo ${newCompleted ? 'completed' : 'marked active'}: ID ${id}`);
                    }
                }
            }
        }
    }, true); // Use capture phase to ensure this runs before other handlers
    
    // Add direct native event listener for clear completed
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('clear-completed')) {
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
                
                // Remove completed items from DOM
                document.querySelectorAll('.todo-list li.completed').forEach(li => {
                    li.remove();
                });
                
                console.log('Cleared completed todos');
            }
        }
    }, true); // Use capture phase
});