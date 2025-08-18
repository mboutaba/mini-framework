// Direct fix for edit inputs
(function() {
    // Function to replace all edit inputs with new ones that have direct event handlers
    function fixEditInputs() {
        document.querySelectorAll('.edit').forEach(input => {
            // Skip if already fixed
            if (input.dataset.fixed) return;
            
            // Create new input element
            const newInput = document.createElement('input');
            newInput.className = 'edit';
            newInput.value = input.value;
            newInput.placeholder = input.placeholder || 'Edit todo and press Enter';
            newInput.dataset.fixed = 'true';
            
            // Copy attributes
            Array.from(input.attributes).forEach(attr => {
                if (attr.name !== 'onkeydown' && attr.name !== 'class' && attr.name !== 'value') {
                    newInput.setAttribute(attr.name, attr.value);
                }
            });
            
            // Add direct event handlers
            newInput.addEventListener('keydown', function(e) {
                const li = this.closest('li');
                const id = parseInt(li.dataset.id);
                
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = this.value.trim();
                    
                    // Try to use framework function
                    if (typeof finishEditing === 'function') {
                        finishEditing(id, value);
                    } else {
                        // Direct implementation
                        li.classList.remove('editing');
                        
                        // Update state
                        const state = window.miniState;
                        if (state && value) {
                            const currentState = state.getState();
                            const todo = currentState.todos[id];
                            
                            if (todo) {
                                const newTodos = {...currentState.todos};
                                newTodos[id] = {
                                    ...todo,
                                    title: value
                                };
                                
                                state.setState({
                                    todos: newTodos,
                                    editingId: null
                                }, 'EDIT_TODO');
                                
                                // Update label text
                                const label = li.querySelector('label');
                                if (label) {
                                    label.textContent = value;
                                }
                            }
                        }
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    
                    // Try to use framework function
                    if (typeof cancelEditing === 'function') {
                        cancelEditing();
                    } else {
                        // Direct implementation
                        li.classList.remove('editing');
                        
                        // Update state
                        const state = window.miniState;
                        if (state) {
                            state.setState({
                                editingId: null
                            }, 'CANCEL_EDIT');
                        }
                    }
                }
            });
            
            // Replace the original input
            if (input.parentNode) {
                input.parentNode.replaceChild(newInput, input);
            }
        });
    }
    
    // Run immediately and also after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixEditInputs);
    } else {
        fixEditInputs();
    }
    
    // Also run periodically to catch any new elements
    setInterval(fixEditInputs, 500);
})();