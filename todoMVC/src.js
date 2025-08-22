import { useState } from "/framework/state.js";
import { renderApp } from "/framework/render.js";

// --- States ---
const [getInput, setInput] = useState("taskInput", "");
const [getTasks, setTasks] = useState("tasks", []);
const [getFilter, setFilter] = useState("filter", "all");
const [getEditing, setEditing] = useState("editing", null); // store index of editing todo

function App() {
  const appContainer = document.getElementById("app");

  const tasks = getTasks();
  const filter = getFilter();
  const editing = getEditing();

  // Filtered tasks
  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const remaining = tasks.filter((t) => !t.completed).length;

  return {
    type: "section",
    props: { class: "todoapp" },
    children: [
      // Header + new task input
      {
        type: "header",
        props: { class: "header" },
        children: [
          { type: "h1", props: {}, children: ["todos"] },
          {
            type: "input",
            props: {
              class: "new-todo",
              placeholder: "What needs to be done?",
              autofocus: true,
              value: getInput(),
              oninput: (e) => setInput(e.target.value),
              onkeydown: (e) => {
                if (e.key === "Enter" && getInput().trim()) {
                  setTasks([...tasks, { text: getInput(), completed: false }]);
                  setInput("");
                  renderApp(App, appContainer);
                }
              }
            },
            children: []
          }
        ]
      },

      // Main section (only if tasks exist)
      ...(tasks.length > 0
        ? [
            {
              type: "section",
              props: { class: "main" },
              children: [
                {
                  type: "input",
                  props: {
                    id: "toggle-all",
                    class: "toggle-all",
                    type: "checkbox",
                    checked: tasks.every((t) => t.completed),
                    onchange: () => {
                      const allDone = tasks.every((t) => t.completed);
                      setTasks(tasks.map((t) => ({ ...t, completed: !allDone })));
                      renderApp(App, appContainer);
                    }
                  },
                  children: []
                },
                {
                  type: "label",
                  props: { for: "toggle-all" },
                  children: ["Mark all as complete"]
                },
                {
                  type: "ul",
                  props: { class: "todo-list" },
                  children: visibleTasks.map((task, idx) => {
                    const realIdx = tasks.indexOf(task); // map visible idx → actual index

                    return {
                      type: "li",
                      props: {
                        class:
                          (task.completed ? "completed " : "") +
                          (editing === realIdx ? "editing" : "")
                      },
                      children: [
                        {
                          type: "div",
                          props: { class: "view" },
                          children: [
                            {
                              type: "input",
                              props: {
                                class: "toggle",
                                type: "checkbox",
                                checked: task.completed,
                                onchange: () => {
                                  const newTasks = [...tasks];
                                  newTasks[realIdx].completed =
                                    !newTasks[realIdx].completed;
                                  setTasks(newTasks);
                                  renderApp(App, appContainer);
                                }
                              },
                              children: []
                            },
                            {
                              type: "label",
                              props: {
                                ondblclick: () => {
                                  setEditing(realIdx);
                                  renderApp(App, appContainer);
                                }
                              },
                              children: [task.text]
                            },
                            {
                              type: "button",
                              props: {
                                class: "destroy",
                                onclick: () => {
                                  const newTasks = tasks.filter(
                                    (_, i) => i !== realIdx
                                  );
                                  setTasks(newTasks);
                                  renderApp(App, appContainer);
                                }
                              },
                              children: []
                            }
                          ]
                        },
                        // If editing → show input
                        ...(editing === realIdx
                          ? [
                              {
                                type: "input",
                                props: {
                                  class: "edit",
                                  value: task.text,
                                  autofocus: true,
                                  onblur: (e) => {
                                    const newTasks = [...tasks];
                                    newTasks[realIdx].text = e.target.value.trim() || task.text;
                                    setTasks(newTasks);
                                    setEditing(null);
                                    renderApp(App, appContainer);
                                  },
                                  onkeydown: (e) => {
                                    if (e.key === "Enter") {
                                      const newTasks = [...tasks];
                                      newTasks[realIdx].text =
                                        e.target.value.trim() || task.text;
                                      setTasks(newTasks);
                                      setEditing(null);
                                      renderApp(App, appContainer);
                                    }
                                    if (e.key === "Escape") {
                                      setEditing(null);
                                      renderApp(App, appContainer);
                                    }
                                  }
                                },
                                children: []
                              }
                            ]
                          : [])
                      ]
                    };
                  })
                }
              ]
            },

            // Footer
            {
              type: "footer",
              props: { class: "footer" },
              children: [
                {
                  type: "span",
                  props: { class: "todo-count" },
                  children: [
                    { type: "strong", props: {}, children: [remaining] },
                    ` item${remaining !== 1 ? "s" : ""} left`
                  ]
                },
                {
                  type: "ul",
                  props: { class: "filters" },
                  children: [
                    {
                      type: "li",
                      children: [
                        {
                          type: "a",
                          props: {
                            class: filter === "all" ? "selected" : "",
                            href: "#/",
                            onclick: () => {
                              setFilter("all");
                              renderApp(App, appContainer);
                            }
                          },
                          children: ["All"]
                        }
                      ]
                    },
                    {
                      type: "li",
                      children: [
                        {
                          type: "a",
                          props: {
                            class: filter === "active" ? "selected" : "",
                            href: "#/active",
                            onclick: () => {
                              setFilter("active");
                              renderApp(App, appContainer);
                            }
                          },
                          children: ["Active"]
                        }
                      ]
                    },
                    {
                      type: "li",
                      children: [
                        {
                          type: "a",
                          props: {
                            class: filter === "completed" ? "selected" : "",
                            href: "#/completed",
                            onclick: () => {
                              setFilter("completed");
                              renderApp(App, appContainer);
                            }
                          },
                          children: ["Completed"]
                        }
                      ]
                    }
                  ]
                },
                ...(tasks.some((t) => t.completed)
                  ? [
                      {
                        type: "button",
                        props: {
                          class: "clear-completed",
                          onclick: () => {
                            setTasks(tasks.filter((t) => !t.completed));
                            renderApp(App, appContainer);
                          }
                        },
                        children: ["Clear completed"]
                      }
                    ]
                  : [])
              ]
            }
          ]
        : [])
    ]
  };
}

const appContainer = document.getElementById("app");
renderApp(App, appContainer);
