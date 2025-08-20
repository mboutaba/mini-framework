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
    const t = { id: Date.now().toString(36), text, done:false };
    store.update({ todos: [t, ...store.get().todos], draft: '' });
  },
  toggle(id) {
    const todos = store.get().todos.map(t => t.id===id ? { ...t, done:!t.done } : t);
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
    const text = prompt('Rename item:');
    if (text===null) return;
    const todos = store.get().todos.map(t => t.id===id ? { ...t, text:text.trim() || t.text } : t);
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
(function persistTodos(){
  try {
    const saved = JSON.parse(localStorage.getItem('minifw.todos') || 'null');
    if (saved && saved.todos) store.update({ ...store.get(), todos: saved.todos });
    store.subscribe((s)=> localStorage.setItem('minifw.todos', JSON.stringify({ todos: s.todos })));
  } catch(e){ console.warn('persist failed', e); }
})();

function view({ state, route }) {
  const filter = ['all','active','completed'].includes(route.params?.filter) ? route.params.filter : 'all';
  const filtered = state.todos.filter(t => filter==='all' ? true : filter==='active' ? !t.done : t.done);
  const left = state.todos.filter(t=>!t.done).length;
  const right = state.todos.filter(t=>t.done).length;

  return h('div', { className: 'container' },
    h('h1', null, 'TodoMVC'),
    h('p', { className: 'muted' }, 'A tiny framework demo with Router, Store, Events and a virtual DOM'),
    h('div', { className: 'row' },
      h('input', { type:'text', placeholder:'What needs to be done?', value: state.draft, 'data-action-input':'setDraft($value)' }),
      h('button', { 'data-action': 'addTodo()' }, 'Add')
    ),
    h('div', { className: 'spacer' }),
    ...filtered.map(t =>
      h('div', { className: 'todo ' + (t.done ? 'done':''), 'data-id': t.id },
        h('input', { type:'checkbox', ...(t.done ? { checked: true } : {}), 'data-action':'toggle(\"'+t.id+'\")' }),
        h('div', { className:'label', style:'flex:1' }, t.text),
        h('button', { className:'ghost', 'data-action':'rename(\"'+t.id+'\")' }, 'Rename'),
        h('button', { className:'ghost', 'data-action':'remove(\"'+t.id+'\")' }, 'Delete'),
      )
    ),
    h('footer', null,
      h('div', null, h('span', { className:'chip' }, left + ' active'), ' ', h('span', { className:'chip' }, right + ' completed')),
      h('div', { className:'filters' },
        filterLink('all', filter),
        filterLink('active', filter),
        filterLink('completed', filter),
      ),
      h('button', { className:'ghost right', 'data-action':'clearDone()' }, 'Clear completed')
    ),
    h('p', { className:'muted' },
      h('small', { className:'code' }, 'Tips: type then press Enter to add. Filters: #/, #/active, #/completed. Data persists in localStorage.')
    )
  );
}

function filterLink(name, active){
  const href = name === 'all' ? '/' : '/' + name;
  return h('a', { href:'#'+href, className: (active===name ? 'active' : ''), 'data-action':'go(\"'+href+'\")' }, name);
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
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') {
    const a = document.activeElement;
    if (a && a.matches('input[type=\"text\"]')) actions.addTodo();
  }
});
