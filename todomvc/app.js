
import { h, mount, createStore, Router, Events } from "../../framework/index.js";

const STORAGE_KEY = "KOB.JS.todos";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const save = (todos) => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));

const initial = { todos: load(), route: "/" };
const reducers = {
  add(s, a) {
    if (!a.title.trim()) return s;
    const todos = [...s.todos, { id: crypto.randomUUID(), title: a.title.trim(), completed: false }];
    save(todos);
    return { ...s, todos };
  },
  toggle(s, a) {
    const todos = s.todos.map(t => t.id === a.id ? { ...t, completed: !t.completed } : t);
    save(todos);
    return { ...s, todos };
  },
  destroy(s, a) {
    const todos = s.todos.filter(t => t.id !== a.id);
    save(todos);
    return { ...s, todos };
  },
  edit(s, a) {
    const todos = s.todos.map(t => t.id === a.id ? { ...t, title: a.title } : t);
    save(todos);
    return { ...s, todos };
  },
  clearCompleted(s) {
    const todos = s.todos.filter(t => !t.completed);
    save(todos);
    return { ...s, todos };
  },
  toggleAll(s, a) {
    const todos = s.todos.map(t => ({ ...t, completed: a.value }));
    save(todos);
    return { ...s, todos };
  }
};
const store = createStore(initial, reducers);
const router = Router({ store, stateKey: "route" });

function filterTodos(todos, route) {
  if (route === "/active") return todos.filter(t => !t.completed);
  if (route === "/completed") return todos.filter(t => t.completed);
  return todos;
}

function pluralize(n, w) { return n === 1 ? w : w + "s"; }

function App(state) {
  const activeCount = state.todos.filter(t => !t.completed).length;
  const completedCount = state.todos.length - activeCount;

  const mainAttrs = { id: "main", style: { display: state.todos.length ? "" : "none" } };
  const footerAttrs = { id: "footer", style: { display: state.todos.length ? "" : "none" } };

  return h("div", {},
    h("section", mainAttrs,
      h("input", {
        id: "toggle-all",
        class: "toggle-all",
        type: "checkbox",
        ...(state.todos.length ? (activeCount === 0 ? { checked: true } : {}) : {}),
        on: { change: (e) => store.dispatch({ type: "toggleAll", value: e.target.checked }) }
      }),
      h("label", { for: "toggle-all" }, "Mark all as complete"),
      h("ul", { class: "todo-list", id: "list" },
        filterTodos(state.todos, state.route).map(todo => TodoItem(todo))
      )
    ),
    h("footer", footerAttrs,
      h("span", { class: "todo-count" },
        h("strong", {}, String(activeCount)),
        ` ${pluralize(activeCount, "item")} left`
      ),
      h("ul", { class: "filters" },
        h("li", {}, h("a", { class: state.route === "/" ? "selected" : "", href: "#/" }, "All")),
        h("li", {}, h("a", { class: state.route === "/active" ? "selected" : "", href: "#/active" }, "Active")),
        h("li", {}, h("a", { class: state.route === "/completed" ? "selected" : "", href: "#/completed" }, "Completed")),
      ),
      h("button", {
        class: "clear-completed",
        style: { visibility: completedCount ? "visible" : "hidden" },
        on: { click: () => store.dispatch({ type: "clearCompleted" }) }
      }, "Clear completed")
    )
  );
}

function TodoItem(todo) {
  const liAttrs = {
    ...(todo.completed ? { class: "completed" } : {}),
  };
  return h("li", liAttrs,
    h("div", { class: "view" },
      h("input", {
        class: "toggle",
        type: "checkbox",
        ...(todo.completed ? { checked: true } : {}),
        on: { change: () => store.dispatch({ type: "toggle", id: todo.id }) }
      }),
      h("label", {
        on: {
          dblclick: (e) => {
            const li = e.currentTarget.closest("li");
            li.classList.add("editing");
            const input = li.querySelector("input.edit");
            if (input) {
              input.value = todo.title;
              input.focus();
              input.setSelectionRange(todo.title.length, todo.title.length);
            }
          }
        }
      }, todo.title),
      h("button", { class: "destroy", on: { click: () => store.dispatch({ type: "destroy", id: todo.id }) } }, "×")
    ),
    h("input", {
      class: "edit",
      value: todo.title,
      on: {
        blur: (e) => commitEdit(e, todo),
        keydown: (e) => { if (e.key === "Enter") commitEdit(e, todo); if (e.key === "Escape") cancelEdit(e); }
      }
    })
  );
}

function commitEdit(e, todo) {
  const val = e.currentTarget.value.trim();
  const li = e.currentTarget.closest("li");
  if (li) li.classList.remove("editing");
  if (!val) {
    store.dispatch({ type: "destroy", id: todo.id });
  } else if (val !== todo.title) {
    store.dispatch({ type: "edit", id: todo.id, title: val });
  }
}

function cancelEdit(e) {
  const li = e.currentTarget.closest("li");
  if (li) li.classList.remove("editing");
}

const appNode = document.querySelector(".todoapp");
const { rerender } = mount(App, appNode, store);
store.subscribe(rerender);

(function bindHeader() {
  const input = document.getElementById("new-todo");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      store.dispatch({ type: "add", title: e.currentTarget.value });
      e.currentTarget.value = "";
    }
  });
})();

Events.on("@route", () => rerender());
