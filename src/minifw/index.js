// src/minifw/index.js
export { h, render, update } from './vdom.js';
export { createStore } from './store.js';
export { createRouter } from './router.js';
export { createEvents } from './events.js';

// Boot helper to wire store + router + renderer + events
export function createApp({ root, routes, initState, view, actions, title='MiniFW App' }) {
  const container = typeof root === 'string' ? document.querySelector(root) : root;
  document.title = title;

  const { h, render, update } = awaitImport(); // local alias if bundlers rewrite? left as is.

  const store = createStore(initState);
  const router = createRouter(routes);
  const events = createEvents(document);

  // Action dispatcher
  const act = Object.assign({}, actions);
  function dispatch(name, ...args) {
    const fn = act[name];
    if (typeof fn === 'function') return fn(...args);
    console.warn('Unknown action:', name);
  }
  events.bindActions(dispatch);

  // Render cycle
  function tick() {
    const vnode = view({ state: store.get(), route: router.current, actions: dispatch, h });
    if (!container._vnode) render(vnode, container);
    else update(container, vnode);
  }
  router.onChange = tick;
  store.subscribe(tick);
  setTimeout(tick, 0);

  // LocalStorage helper
  function persist(key, select, merge) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) store.set(merge(store.get(), saved));
      store.subscribe((s)=> localStorage.setItem(key, JSON.stringify(select(s))));
    } catch(e){ console.warn('persist failed', e); }
  }

  return { store, router, events, actions: dispatch, persist };
}

// Simple shim to avoid circular import confusion in some environments.
function awaitImport(){ return { h: null, render: null, update: null }; }
