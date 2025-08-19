# MiniFW — A mini Web Framework (Router • Store • Events • Virtual DOM)

**Goal:** Provide a small, teachable framework that abstracts the DOM, routing, state, and events — and a TodoMVC built on top. No external libraries.

---

## Folder Structure (run from project root)

```
minifw/
├─ index.html               # Entry: loads the TodoMVC app
├─ styles/
│  └─ todomvc.css           # Minimal styling
├─ src/
│  └─ minifw/
│     ├─ vdom.js            # Virtual DOM: h(), render(), update()
│     ├─ store.js           # State management
│     ├─ router.js          # Hash router with :params
│     ├─ events.js          # Declarative event system (no addEventListener usage by the user)
│     └─ index.js           # (Optional aggregator)
├─ app/
│  └─ todomvc.js            # The TodoMVC app using the framework
├─ serve.py                 # Simple static server (optional)
└─ run.sh                   # Helper to launch a static server
```

> **How to run:** open `index.html` in a modern browser, or start a local server:
>
> ```bash
> # Python 3
> python3 serve.py
> # or
> bash run.sh
> ```
> Then visit `http://localhost:8000`.

---

## Framework Features

### 1) Abstracting the DOM (Virtual DOM)
We model UI as **plain JS objects** (virtual nodes) and generate/patch the real DOM efficiently.

- `h(tag, props, ...children)` builds a virtual node:
  ```js
  const card = h('div', { className:'card' },
    h('h2', null, 'Title'),
    h('button', { 'data-action':'save()' }, 'Save')
  );
  ```

- `render(vnode, container)` mounts a tree once.
- `update(container, nextVNode)` diffs against the previous tree and updates only what changed.

This approach mirrors describing HTML as JSON-like objects, as required:

```json
{
  "tag": "div",
  "attrs": { "class": "nameSubm" },
  "children": [
    { "tag": "input", "attrs": { "type": "text", "placeholder": "Insert Name" } },
    { "tag": "input", "attrs": { "type": "submit", "placeholder": "Submit" } }
  ]
}
```

With MiniFW you express the same structure using `h()`.

---

### 2) Routing System (URL ↔ State)
`createRouter(routes)` keeps the **URL hash** in sync with the current view and extracts `:params`.

```js
const router = createRouter([
  { path: '/', view: Home },
  { path: '/profile/:id', view: Profile },
  { path: '/404', view: NotFound }
]);
router.onChange = (current) => {
  // current = { path, params, view }
  tick();
};
router.go('/profile/42'); // updates location.hash
```

Changing the URL triggers `onChange`, which you use to re-render your app.

---

### 3) State Management
`createStore(initial)` manages app state immutably, with subscriptions:

```js
const store = createStore({ count: 0 });
store.subscribe((state) => console.log('state changed', state));
store.update({ count: store.get().count + 1 });          // shallow merge
store.set((prev) => ({ ...prev, ready: true }));         // full replace via updater
const state = store.get();                                // read
```

Because state is immutable (deep-frozen), accidental mutations are caught early.

---

### 4) Event Handling (Declarative, not addEventListener)
Users **do not** call `addEventListener` directly. Instead, they use a small **declarative layer**:

- Register global, delegated handlers:
  ```js
  const events = createEvents(document);
  events.on('click', '.btn-primary', (ev, el) => { /* ... */ });
  ```

- Or use **data-action** syntax that dispatches to your actions table:
  ```html
  <button data-action="save('draft')">Save</button>
  <input data-action-input="setTitle($value)">
  <form data-action-submit="submitForm()"></form>
  ```

Supported special args: `$value`, `$event`, `$el`, numbers, quoted strings, booleans.

This is different from `addEventListener` because you declare **what** should happen on certain selectors/types, and the framework installs **one delegated listener per event type** for you.

---

## How It Works (Why)
- **Virtual DOM** lets you describe UI as data and apply minimal changes, instead of manually touching DOM nodes.
- **Router** makes the URL the single source of truth for which view to show; state and URL stay in sync.
- **Store** centralizes state so any view can read/subscribe/update, solving cross-page sharing.
- **Events** are declarative and consistent (one place to wire logic), with a custom API that avoids direct `addEventListener` usage by app code.

---

## Code Examples

### Create an element
```js
const box = h('div', { className:'box', id:'a1' },
  h('span', null, 'Hello'),
  h('button', { 'data-action':'ping()' }, 'Ping')
);
render(box, document.querySelector('#root'));
```

### Create an event
```js
const events = createEvents(document);
events.on('click', '#root .box button', (ev, el) => alert('pong'));
```

### Nest elements
```js
const nested = h('ul', null,
  h('li', null, 'One'),
  h('li', null, 'Two', h('strong', null, ' (bold)'))
);
```

### Add attributes
```js
const input = h('input', { type:'text', placeholder:'Insert Name', value: 'Alice' });
```

---

## TodoMVC (Built with MiniFW)

Open `index.html` to see the app. Features:
- Add, toggle, rename, delete todos
- Filters: `#/`, `#/active`, `#/completed`
- Persistent storage (localStorage)
- Accessible classes/ids similar to the canonical TodoMVC

Look at `app/todomvc.js` to see how the app composes **router + store + events + vdom**.

---

## Minimal “Getting Started” (from scratch)

```html
<div id="root"></div>
<script type="module">
  import { h, render, update } from './src/minifw/vdom.js';
  import { createStore } from './src/minifw/store.js';
  import { createRouter } from './src/minifw/router.js';
  import { createEvents } from './src/minifw/events.js';

  const store = createStore({ clicks: 0 });
  const router = createRouter([{ path:'/', view:'home' }]);
  const events = createEvents(document);

  function view() {
    return h('div', null,
      h('h2', null, 'Clicks: ', store.get().clicks),
      h('button', { 'data-action': 'inc()' }, 'Increment')
    );
  }

  events.bindActions((name)=> { if (name==='inc') store.update({ clicks: store.get().clicks + 1 }); });
  const root = document.querySelector('#root');
  function tick(){ const v = view(); if(!root._vnode) render(v, root); else update(root, v); }
  router.onChange = tick; store.subscribe(tick); setTimeout(tick, 0);
</script>
```

---

## Notes / Limitations

- The Virtual DOM diff here is intentionally small and index-based; for large lists use `props.key` for more predictable updates.
- The router is hash-based for simplicity (`#/path`). History API could be added later.
- Events layer is delegated; for non-bubbling events you may need to attach at a closer root or extend the system.

---

Happy hacking! 🚀
