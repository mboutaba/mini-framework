/**
 * mini Framework - State Actions
 * Action creators and mutation handlers
 */

export class StateActions {
    constructor(store) {
        this.store = store;
        this.actionCreators = new Map();
        this.middleware = [];
    }

    // Register action creators
    registerAction(name, creator) {
        this.actionCreators.set(name, creator);
    }

    // Execute action
    dispatch(actionName, payload) {
        const creator = this.actionCreators.get(actionName);
        if (!creator) {
            throw new Error(`Action "${actionName}" not found`);
        }

        const action = creator(payload);
        return this.processAction(action);
    }

    // Process action through middleware
    processAction(action) {
        let processedAction = action;

        // Apply middleware
        for (const middleware of this.middleware) {
            processedAction = middleware(processedAction, this.store);
        }

        // Execute the action
        if (typeof processedAction === 'function') {
            return processedAction(this.store.setState.bind(this.store), this.store.getState.bind(this.store));
        } else if (processedAction && processedAction.type) {
            return this.store.setState(processedAction.payload, processedAction.type);
        }

        return processedAction;
    }

    // Add middleware
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    // TodoMVC specific actions
    initializeTodoActions() {
        // Add todo
        this.registerAction('ADD_TODO', (text) => ({
            type: 'ADD_TODO',
            payload: (state) => {
                const id = state.nextId;
                return {
                    todos: {
                        ...state.todos,
                        [id]: {
                            id,
                            text: text.trim(),
                            completed: false,
                            createdAt: Date.now()
                        }
                    },
                    nextId: state.nextId + 1
                };
            }
        }));

        // Toggle todo
        this.registerAction('TOGGLE_TODO', (id) => ({
            type: 'TOGGLE_TODO',
            payload: (state) => {
                const todo = state.todos[id];
                if (!todo) return state;

                return {
                    todos: {
                        ...state.todos,
                        [id]: {
                            ...todo,
                            completed: !todo.completed
                        }
                    }
                };
            }
        }));

        // Delete todo
        this.registerAction('DELETE_TODO', (id) => ({
            type: 'DELETE_TODO',
            payload: (state) => {
                const { [id]: deleted, ...remainingTodos } = state.todos;
                return { todos: remainingTodos };
            }
        }));

        // Edit todo
        this.registerAction('EDIT_TODO', (id, text) => ({
            type: 'EDIT_TODO',
            payload: (state) => {
                const todo = state.todos[id];
                if (!todo) return state;

                return {
                    todos: {
                        ...state.todos,
                        [id]: {
                            ...todo,
                            text: text.trim()
                        }
                    }
                };
            }
        }));

        // Set filter
        this.registerAction('SET_FILTER', (filter) => ({
            type: 'SET_FILTER',
            payload: { filter }
        }));

        // Clear completed
        this.registerAction('CLEAR_COMPLETED', () => ({
            type: 'CLEAR_COMPLETED',
            payload: (state) => {
                const activeTodos = {};
                Object.values(state.todos).forEach(todo => {
                    if (!todo.completed) {
                        activeTodos[todo.id] = todo;
                    }
                });
                return { todos: activeTodos };
            }
        }));

        // Toggle all
        this.registerAction('TOGGLE_ALL', () => ({
            type: 'TOGGLE_ALL',
            payload: (state) => {
                const allCompleted = Object.values(state.todos).every(todo => todo.completed);
                const updatedTodos = {};

                Object.values(state.todos).forEach(todo => {
                    updatedTodos[todo.id] = {
                        ...todo,
                        completed: !allCompleted
                    };
                });

                return { todos: updatedTodos };
            }
        }));

        // Set editing
        this.registerAction('SET_EDITING', (id) => ({
            type: 'SET_EDITING',
            payload: { editingId: id }
        }));
    }

    // Async action support
    async dispatchAsync(actionName, payload) {
        const creator = this.actionCreators.get(actionName);
        if (!creator) {
            throw new Error(`Action "${actionName}" not found`);
        }

        const action = creator(payload);

        if (typeof action === 'function') {
            return await action(this.store.setState.bind(this.store), this.store.getState.bind(this.store));
        }

        return this.processAction(action);
    }

    // Batch actions
    batchActions(actions) {
        const updates = {};

        actions.forEach(({ actionName, payload }) => {
            const creator = this.actionCreators.get(actionName);
            if (creator) {
                const action = creator(payload);
                if (action && action.payload) {
                    Object.assign(updates, action.payload);
                }
            }
        });

        return this.store.setState(updates, 'BATCH_ACTIONS');
    }

    // Get all registered actions
    getActions() {
        return Array.from(this.actionCreators.keys());
    }
}