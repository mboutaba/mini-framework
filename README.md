
# KOB.JS (Mini Framework)

A lightweight (~3 KB gzipped) microframework that gives you:

- **DOM abstraction** via a tiny Virtual DOM (`h`) and a diffing renderer.
- **Routing** syncing the URL hash (`#/path`) with application state.
- **State management** with a central store, `dispatch(action)` and `subscribe`.
- **Event handling** through a high-level API (`attrs.on`) and a global `Events` bus—no direct `addEventListener` required.

This repo includes a **TodoMVC** example built entirely with KOB.JS.

---

## Folder Structure

```
mini-framework/
├── framework/
│   ├── core.js       # VDOM, Store, Router, Events
│   └── index.js      # Barrel exports
├── todomvc/
│       ├── index.html
│       ├── app.js
│       └── styles.css
└── README.md
```

Open `todomvc/index.html` in a browser (double-click works) or start a static server at the repo root.

---

## Getting Started

### Include the framework

```html
<script type="module">
  import { h, mount, createStore, Router, Events } from "../../framework/index.js";
  // your code...
</script>
```

### Create elements

```js
const view = () =>
  h("div", { class: "box", style: { padding: "8px" } },
    h("h1", {}, "Hello KOB.JS"),
    h("button", { on: { click: () => alert("Clicked!") } }, "Click me")
  );
```

### Nest elements

Just compose `h()` calls. Children can be arrays, strings, numbers or other VNodes.

```js
h("ul", {},
  items.map(x => h("li", {}, x.title))
);
```

### Add attributes

Attributes go in the second argument (an object). Styles can be objects. `class`/`className` are supported; `data-*` attributes work too.

```js
h("input", { type: "text", placeholder: "Your name", "data-test": "name" });
```

### Events (no `addEventListener`)

Use the `on` attribute to attach events. Handlers receive the native event.

```js
h("button", { on: { click: (ev) => console.log("ok", ev) } }, "OK");
```

You also have a simple pub/sub bus:

```js
import { Events } from "../../framework/index.js";
const unsub = Events.on("saved", (payload) => console.log("Saved", payload));
Events.emit("saved", { id: 1 });
unsub();
```

### State Management

Create a store with an initial state and a reducers map.

```js
const store = createStore(
  { count: 0 },
  {
    increment: (s) => ({ ...s, count: s.count + 1 }),
    setCount: (s, a) => ({ ...s, count: a.value })
  }
);

store.subscribe((next) => console.log("state:", next));
store.dispatch({ type: "increment" });
store.dispatch({ type: "setCount", value: 10 });
```

### Rendering / Mounting

`mount(view, container, store)` calls your `view(state)` and keeps it up to date when you re-render (e.g., after state changes).

```js
const view = (state) => h("div", {}, `Count: ${state.count}`);
const { rerender } = mount(view, document.getElementById("app"), store);
store.subscribe(rerender); // trigger VDOM patch on state changes
```

### Router

Hash-based router that syncs `state.route` with the address bar.

```js
const store = createStore({ route: "/" });
const router = Router({ store, stateKey: "route" });
Events.on("@route", ({ path }) => console.log("navigated to", path));

// Navigate programmatically:
router.setRoute("/about"); // URL becomes #/about, state.route updates automatically
```

---

## Why it works this way

- **Virtual DOM** keeps rendering deterministic: your `view(state)` returns a plain object tree; the framework diffs and patches the real DOM for you.
- **Single source of truth** via the store reduces ad-hoc DOM reads/writes.
- **Hash router** requires no server config, and is enough for small SPAs.
- **High-level events** (`attrs.on` and `Events`) make your code declarative and testable, avoiding direct `addEventListener` in app code.

---

## TodoMVC with KOB.JS

See `examples/todomvc/` for a complete implementation featuring:
- Add, toggle, delete todos
- Filter routes: `#/`, `#/active`, `#/completed`
- Edit in place (double click), clear completed
- Persist to `localStorage`

Open `examples/todomvc/index.html` to try it.
```

