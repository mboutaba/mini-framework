/**
 * Verify TodoMVC structure has all required classes and IDs
 * This ensures compatibility with TodoMVC spec
 */
function verifyTodoMVCStructure() {
    const requiredElements = [
        { selector: '.todoapp', name: 'Main TodoApp container' },
        { selector: '.header', name: 'Header section' },
        { selector: '.new-todo', name: 'New todo input' },
        { selector: '.main', name: 'Main section' },
        { selector: '.toggle-all', name: 'Toggle all checkbox' },
        { selector: '#toggle-all', name: 'Toggle all checkbox ID' },
        { selector: '.todo-list', name: 'Todo list' },
        { selector: '.footer', name: 'Footer' },
        { selector: '.todo-count', name: 'Todo count' },
        { selector: '.filters', name: 'Filters' },
        { selector: '.clear-completed', name: 'Clear completed button' },
        { selector: '.info', name: 'Info footer' }
    ];
    
    const todoItemClasses = [
        '.toggle', '.destroy', '.edit', '.view'
    ];
    
    console.group('TodoMVC Structure Verification');
    
    let allValid = true;
    
    // Check required elements
    requiredElements.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            console.log(`✅ Found ${item.name}`);
        } else {
            console.error(`❌ Missing ${item.name} (${item.selector})`);
            allValid = false;
        }
    });
    
    // Check filter links
    const filterLinks = document.querySelectorAll('.filters a');
    if (filterLinks.length === 3) {
        console.log('✅ Found all filter links');
    } else {
        console.error(`❌ Expected 3 filter links, found ${filterLinks.length}`);
        allValid = false;
    }
    
    // Check todo item structure if any todos exist
    const todoItems = document.querySelectorAll('.todo-list li');
    if (todoItems.length > 0) {
        const firstTodo = todoItems[0];
        todoItemClasses.forEach(cls => {
            if (firstTodo.querySelector(cls)) {
                console.log(`✅ Todo item has ${cls}`);
            } else {
                console.error(`❌ Todo item missing ${cls}`);
                allValid = false;
            }
        });
    }
    
    if (allValid) {
        console.log('✅ All TodoMVC structure requirements met!');
    } else {
        console.error('❌ Some TodoMVC structure requirements are missing!');
    }
    
    console.groupEnd();
    
    return allValid;
}