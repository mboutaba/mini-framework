import { useState } from "/framework/state.js";
import { renderApp } from "/framework/render.js";
import { useRoute, onRouteChange, navigate, initRouter } from "/framework/router.js";

// --- States ---
const [getInput, setInput] = useState("taskInput", "");
const [getTasks, setTasks] = useState("tasks", []);
const [getFilter, setFilter] = useState("filter", "all");
const [getEditing, setEditing] = useState("editing", null); // index of todo being edited

function App() {
  // Sync filter with route
  const route = useRoute();
  let filter = getFilter();
  if (route === "/" && filter !== "all") setFilter("all");
  if (route === "/active" && filter !== "active") setFilter("active");
  if (route === "/completed" && filter !== "completed") setFilter("completed");
  filter = getFilter();

  const appContainer = document.getElementById("app");
  const tasks = getTasks();
  const editing = getEditing();

  // filter tasks
  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const remaining = tasks.filter((t) => !t.completed).length;

  // helper to trigger re-render
  const update = () => renderApp(App, appContainer);

  return {
    type: "section",
    props: { class: "todoapp" },
    children: [
      // Header
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
                  update();
                }
              }
            },
            children: []
          }
        ]
      },

      // Main section
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
                      update();
                    }
                  },
                  children: []
                },
                {
                  type: "label",
                  props: { htmlFor: "toggle-all" },
                  children: ["Mark all as complete"]
                },
                {
                  type: "ul",
                  props: { class: "todo-list" },
                  children: visibleTasks.map((task, idx) => {
                    const realIdx = tasks.indexOf(task); // map visible idx → actual idx

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
                                  update();
                                }
                              },
                              children: []
                            },
                            {
                              type: "label",
                              props: {
                                ondblclick: () => {
                                  setEditing(realIdx);
                                  update();
                                  requestAnimationFrame(() => {
                                    const editInput =
                                      document.querySelector(".edit");
                                    if (editInput) editInput.focus();
                                  });
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
                                  update();
                                }
                              },
                              children: []
                            }
                          ]
                        },
                        ...(editing === realIdx
                          ? [
                              {
                                type: "input",
                                props: {
                                  class: "edit",
                                  value: task.text,
                                  onblur: (e) => {
                                    const newTasks = [...tasks];
                                    newTasks[realIdx].text =
                                      e.target.value.trim() || task.text;
                                    setTasks(newTasks);
                                    setEditing(null);
                                    update();
                                  },
                                  onkeydown: (e) => {
                                    if (e.key === "Enter") {
                                      const newTasks = [...tasks];
                                      newTasks[realIdx].text =
                                        e.target.value.trim() || task.text;
                                      setTasks(newTasks);
                                      setEditing(null);
                                      update();
                                    }
                                    if (e.key === "Escape") {
                                      setEditing(null);
                                      update();
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
                    `${remaining} item${remaining !== 1 ? "s" : ""} left`
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
                            onclick: (e) => {
                              e.preventDefault();
                              navigate("/");
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
                            onclick: (e) => {
                              e.preventDefault();
                              navigate("/active");
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
                            onclick: (e) => {
                              e.preventDefault();
                              navigate("/completed");
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
                            update();
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
initRouter();
onRouteChange(() => renderApp(App, appContainer));
renderApp(App, appContainer);
