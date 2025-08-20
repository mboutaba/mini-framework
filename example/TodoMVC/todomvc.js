// app/todomvc.js
import { h, render, update } from '../../src/minifw/vdom.js';
import { createStore } from '../../src/minifw/store.js';
import { createRouter } from '../../src/minifw/router.js';
import { createEvents } from '../../src/minifw/events.js';

// App setup using the framework primitives
const container = document.querySelector('#app');
const store = createStore({ todos: [], draft: '' });
const router = createRouter([
  { path: '/', view: 'home' },
  { path: '/:filter', view: 'home' },
  { path: '/404', view: 'notfound' }
]);
const events = createEvents(document);

// Actions (called via data-action / data-action-input)
const actions = {
  setDraft(v) { store.update({ draft: v.trimStart() }); },
  addTodo() {
    const text = store.get().draft.trim();
    if (!text) return;
    const t = { id: Date.now().toString(36), text, done: false };
    store.update({ todos: [t, ...store.get().todos], draft: '' });
  },
  toggle(id) {
    const todos = store.get().todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    store.update({ todos });
  },
  remove(id) {
    const todos = store.get().todos.filter(t => t.id !== id);
    store.update({ todos });
  },
  clearDone() {
    const todos = store.get().todos.filter(t => !t.done);
    store.update({ todos });
  },
  rename(id) {
    // const text = prompt('Rename item:');
    // console.log("ghghj");
    actions.startEdit(id);

    // if (text === null) return;
    // const todos = store.get().todos.map(t => t.id === id ? { ...t, text: text.trim() || t.text } : t);
    // store.update({ todos });
  },
  startEdit(id) {
    console.log("her");
    const todos = store.get().todos.map(t => t.id === id ? { ...t, editing: true } : t);
    store.update({ todos });
  },
  finishEdit(id, value) {
    console.log("here---");
    const todos = store.get().todos.map(t => {
      if (t.id !== id) return t;
      return { ...t, text: value.trim() || t.text, editing: false };
    });
    store.update({ todos });
  },
  toggleAll() {
    const todos = store.get().todos;
    const allDone = todos.every(t => t.done);
    const updated = todos.map(t => ({ ...t, done: !allDone }));
    store.update({ todos: updated });
  },
  clearCompleted() {
    const todos = store.get().todos.filter(t => !t.done);
    store.update({ todos });
  },

  go(path) { location.hash = path; }
};

// Declarative event bindings (different from addEventListener API)
events.bindActions((name, ...args) => {
  const fn = actions[name];
  if (typeof fn === 'function') fn(...args);
});

// Persist todos
(function persistTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem('minifw.todos') || 'null');
    if (saved && saved.todos) store.update({ ...store.get(), todos: saved.todos });
    store.subscribe((s) => localStorage.setItem('minifw.todos', JSON.stringify({ todos: s.todos })));
  } catch (e) { console.warn('persist failed', e); }
})();

function view({ state, route }) {

  const draft = state.draft;
  const todos = state.todos;
  console.log(state, "----------------------------");

  // derive filter from route
  const filter = ['all', 'active', 'completed'].includes(route.params?.filter)
    ? route.params.filter
    : 'all';

  // apply filter
  const filtered = todos.filter(t =>
    filter === 'all' ||
    (filter === 'active' && !t.done) ||
    (filter === 'completed' && t.done)
  );

  const left = todos.filter(t => !t.done).length;
  const right = todos.filter(t => t.done).length;

  return h('section', { className: 'todoapp' },

    // Header
    h('header', { className: 'header', 'data-testid': 'header' },
      h('h1', null, 'todos'),
      h('div', { className: 'input-container' },
        h('input', {
          className: 'new-todo',
          id: 'todo-input',
          type: 'text',
          'data-testid': 'text-input',
          placeholder: 'What needs to be done?',
          value: draft,
          'data-action-input': 'setDraft($value)'
        }),
        h('label', { className: 'visually-hidden', for: 'todo-input' }, 'New Todo Input')
      )
    ),

    // Main content
    h('main', { className: 'main', 'data-testid': 'main' },
      h('div', { className: 'toggle-all-container' },
        h('input', {
          className: 'toggle-all',
          type: 'checkbox',
          id: 'toggle-all',
          'data-testid': 'toggle-all',
          'data-action': 'toggleAll()'
        }),
        h('label', { className: 'toggle-all-label', for: 'toggle-all' }, 'Toggle All Input')
      ),
      h('ul', { className: 'todo-list', 'data-testid': 'todo-list' },
        ...filtered.map(t =>
          h('li', {
            className: t.done ? 'completed' : '',
            'data-testid': 'todo-item',
            'data-id': t.id
          },
            h('div', { className: 'view' },
              h('input', {
                className: 'toggle',
                type: 'checkbox',
                id: 'toggle-' + t.id,
                'data-testid': 'todo-item-toggle',
                ...(t.done ? { checked: true } : {}),
                'data-action': 'toggle("' + t.id + '")'
              }),
              t.editing ? h('input', {
                className: 'new-todo edit',
                id: 'todo-input',
                type: 'text',
                'data-testid': 'text-input',
                value: t.draftText ?? t.text,
                autofocus: true,
                id: 'edit-' + t.id,
                style: { display: t.displayEdit },
                // oninput: (e) => {
                //   const todos = store.get().todos.map(td =>
                //     td.id === t.id ? { ...td, draftText: e.target.value } : td
                //   );
                //   store.update({ todos });
                // },
                // onblur: (e) => actions.finishEdit(t.id, e.target.value),
                // onkeydown: (e) => {
                  
                //   console.log('keydown fired', e.key, t.id); 
                //   if (e.key === 'Enter') {
                //     actions.finishEdit(t.id, e.target.value)}
                // }
              })
                : h('label', {
                  'data-testid': 'todo-item-label',
                  "id": 'todo-' + t.id,
                  'data-action': 'rename("' + t.id + '")',
                }, t.text),
            )
          )
        )
      )
    ),

    // Footer
    h('footer', { className: 'footer', 'data-testid': 'footer' },
      h('span', { className: 'todo-count' }, left + ' item' + (left !== 1 ? 's' : '') + ' left!'),
      h('ul', { className: 'filters', 'data-testid': 'footer-navigation' },
        filterLink('all', filter),
        filterLink('active', filter),
        filterLink('completed', filter)
      ),
      h('button', {
        className: 'clear-completed',
        disabled: right === 0,
        'data-action': 'clearCompleted()'
      }, 'Clear completed')
    )
  );
}

function filterLink(name, active) {
  const href = name === 'all' ? '/' : '/' + name;
  return h('li', null,
    h('a', {
      href: '#' + href,
      className: active === name ? 'selected' : '',
      'data-action': 'go("' + href + '")'
    }, name)
  );
}


// Render cycle
function tick() {
  const vnode = view({ state: store.get(), route: router.current });
  if (!container._vnode) render(vnode, container);
  else update(container, vnode);
}
router.onChange = tick;
store.subscribe(tick);
setTimeout(tick, 0);

// Keyboard: Enter to add
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const a = document.activeElement;
    if (a && a.matches('input[type=\"text\"]')) actions.addTodo();
  }
});
