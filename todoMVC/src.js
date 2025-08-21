import { setRoutes, goTo } from "../framework/router.js";
import { buildElement, mount, update } from "../framework/dom.js";
import { useStore } from "../framework/store.js";

// App state
const [getInput, setInput] = useStore("input", "");
const [getTodos, setTodos] = useStore("todos", []);
const [getEditing, setEditing] = useStore("editing", null);
const [getEditText, setEditText] = useStore("editText", "");
const [getFilter, setFilter] = useStore("filter", "All");

function addTodo(e) {
  if (e.key === "Enter" && getInput().trim()) {
    if (getInput().trim().length <= 1) return;

    const todo = {
      text: getInput().trim(),
      id: Date.now(),
      done: false,
    };

    
    setTodos([...getTodos(), todo]);

   

    setInput("");
  }
}

function updateInput(e) {
  setInput(e.target.value);
}

function toggle(id) {
  const todos = getTodos().map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  setTodos(todos);
}

function remove(id) {
  setTodos(getTodos().filter(todo => todo.id !== id));
}

function clearDone() {
  setTodos(getTodos().filter(todo => !todo.done));
  // console.log(getTodos());
  // TodoApp();
}

function toggleAll() {
  const allDone = getTodos().every(todo => todo.done);
  const todos = getTodos().map(todo => ({
    ...todo,
    done: !allDone,
  }));
  setTodos(todos);
}

function startEdit(todo) {
  setEditing(todo.id);
  setEditText(todo.text);
}

function saveEdit(id) {
  const todos = getTodos().map(todo => {
    if (todo.id === id) {
      return {
        ...todo,
        text: getEditText().trim() || todo.text,
      };
    }
    return todo;
  });

  setTodos(todos);
  setEditing(null);
  setEditText("");
}

function editKeyDown(e, id) {
  if (e.key === "Enter") {
    saveEdit(id);
  }
}

function getFiltered(todos, filter) {
  switch (filter) {
    case "Active": return todos.filter(todo => !todo.done);
    case "Completed": return todos.filter(todo => todo.done);
    default: return todos;
  }
}

function TodoApp() {
  const todos = getTodos();
  const input = getInput();
  const filter = getFilter();
  const filtered = getFiltered(todos, filter);
  const editing = getEditing();
  const allDone = todos.length > 0 && todos.every(t => t.done);

  return {
    tag: "section",
    attrs: {
      class: "todoapp",
      id: "root"
    },
    children: [
      {
        tag: "header",
        attrs: {
          class: "header",
        },
        children: [
          { tag: "h1", children: ["todos"] },
          {
            tag: "div",
            attrs: { class: "input-container" },
            children: [
              {
                tag: "input",
                attrs: {
                  class: "new-todo",
                  type: "text",
                  value: input,
                  placeholder: "What needs to be done?",
                  oninput: updateInput,
                  onkeydown: addTodo,
                }
              }
            ]
          }
        ]
      },
      {
        tag: "section",
        attrs: { class: "main" },
        children: [
          ...(todos.length > 0 ? [{
            tag: "div",
            attrs: { class: "toggle-all-container" },
            children: [
              {
                tag: "input",
                attrs: {
                  class: "toggle-all",
                  type: "checkbox",
                  onclick: toggleAll,
                  checked: allDone
                }
              },
              {
                tag: "label",
                attrs: { class: "toggle-all-label" }
              }
            ]
          }] : []),
          {
            tag: "ul",
            attrs: { class: "todo-list" },
            children: filtered.map(todo => ({
              tag: "li",
              attrs: {
                class: `${todo.done ? "completed" : ""} ${editing === todo.id ? "editing" : ""}`,
                key: todo.id
              },
              children: [
                editing === todo.id ? {
                  tag: "input",
                  attrs: {
                    class: "edit",
                    type: "text",
                    value: getEditText(),
                    oninput: (e) => setEditText(e.target.value),
                    onkeydown: (e) => editKeyDown(e, todo.id),
                    onblur: () => saveEdit(todo.id),
                    autofocus: true
                  }
                } : {
                  tag: "div",
                  attrs: { class: "view" },
                  children: [
                    {
                      tag: "input",
                      attrs: {
                        class: "toggle",
                        type: "checkbox",
                        checked: todo.done,
                        onchange: () => toggle(todo.id)
                      }
                    },
                    {
                      tag: "label",
                      attrs: {
                        ondblclick: () => startEdit(todo)
                      },
                      children: [todo.text]
                    },
                    {
                      tag: "button",
                      attrs: {
                        class: "destroy",
                        onclick: () => remove(todo.id)
                      }
                    }
                  ]
                }
              ]
            }))
          }
        ]
      },
      ...(todos.length > 0 ? [{
        tag: "footer",
        attrs: { class: "footer" },
        children: [
          {
            tag: "span",
            attrs: { class: "todo-count" },
            children: [`${todos.filter(t => !t.done).length} items left!`]
          },
          {
            tag: "ul",
            attrs: { class: "filters" },
            children: [
              {
                tag: "li",
                children: [{
                  tag: "a",
                  attrs: {
                    class: filter === "All" ? "selected" : "",
                    href: "#/",
                    onclick: (e) => {
                      e.preventDefault();
                      goTo("/");
                    }
                  },
                  children: ["All"]
                }]
              },
              {
                tag: "li",
                children: [{
                  tag: "a",
                  attrs: {
                    class: filter === "Active" ? "selected" : "",
                    href: "#/active",
                    onclick: (e) => {
                      e.preventDefault();
                      goTo("/active");
                    }
                  },
                  children: ["Active"]
                }]
              },
              {
                tag: "li",
                children: [{
                  tag: "a",
                  attrs: {
                    class: filter === "Completed" ? "selected" : "",
                    href: "#/completed",
                    onclick: (e) => {
                      e.preventDefault();
                      goTo("/completed");
                    }
                  },
                  children: ["Completed"]
                }]
              }
            ]
          },
          {
            tag: "button",
            attrs: {
              class: "clear-completed",
              
              onclick: () => {
                      clearDone();
                      goTo("/active");
                      goTo(window.location.hash.slice(1) || "/");
                    }
            },
            children: ["Clear completed"]
          }
        ]
      }] : [])
    ]
  };
}

const app = document.getElementById("app");

mount(TodoApp, app);

setRoutes({
  "/": () => {
    setFilter("All");
    return TodoApp();
  },
  "/active": () => {
    setFilter("Active");
    return TodoApp();
  },
  "/completed": () => {
    setFilter("Completed");
    return TodoApp();
  },
});

if (!window.location.hash) {
  goTo("/");
}