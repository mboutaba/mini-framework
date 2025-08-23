import { useState } from "../framework/state.js";
import { renderApp } from "../framework/render.js";
import { useRoute, onRouteChange, navigate, initRouter } from "../framework/router.js";

// --- States ---
const [getInput, setInput] = useState("taskInput", "");
const [getTasks, setTasks] = useState("tasks", []);
const [getFilter, setFilter] = useState("filter", "all");
const [getEditing, setEditing] = useState("editing", null);

// Helper function to re-render
function update() {
  const appContainer = document.getElementById("app");
  renderApp(App, appContainer);
}

function App() {
  // --- Sync filter with route ---
  const route = useRoute();
  let filter = getFilter();
  
  // Update filter based on route
  let newFilter = "all";
  if (route === "/active") newFilter = "active";
  if (route === "/completed") newFilter = "completed";
  
  if (filter !== newFilter) {
    setFilter(newFilter);
    filter = newFilter;
  }

  const tasks = getTasks();
  const editing = getEditing();

  setInput(getInput());
  // filter tasks
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
      // --- Header ---
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
                if (e.key === "Enter" && getInput().trim().length >= 2) {
                  setTasks([
                    ...getTasks(),
                    { id: Date.now(), text: getInput().trim(), completed: false }
                  ]);
                  setInput("");
                
                  update();
                }
              }
            },
            children: []
          }
        ]
      },

      // --- Main section ---
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
                  props: { for: "toggle-all" },
                  children: ["Mark all as complete"]
                },
                {
                  type: "ul",
                  props: { class: "todo-list" },
                  children: visibleTasks.map((task, idx) => {
                    const realIdx = tasks.indexOf(task);

                    return {
                      type: "li",
                      props: {
                        key: task.id,
                        class: [
                          task.completed ? "completed" : "",
                          editing === realIdx ? "editing" : ""
                        ].filter(Boolean).join(" ")
                      },
                      children: [
                        {
                          type: "div",
                          props: { class: "view" },
                          children: [
                            {
                              type: "input",
                              props: {
                                id: realIdx,
                                class: "toggle",
                                type: "checkbox",
                                checked: task.completed,
                                onchange: () => {
                                  const newTasks = [...tasks];
                                  newTasks[realIdx].completed = !newTasks[realIdx].completed;
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
                                  setTimeout(() => {
                                    const editInput = document.querySelector(".edit");
                                    if (editInput) {
                                      editInput.focus();
                                      editInput.select();
                                    }
                                  }, 0);
                                }
                              },
                              children: [task.text]
                            },
                            {
                              type: "button",
                              props: {
                                class: "destroy",
                                onclick: () => {
                                  const newTasks = tasks.filter((_, i) => i !== realIdx);
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
                                    const newText = e.target.value.trim();
                                    if (newText) {
                                      const newTasks = [...tasks];
                                      newTasks[realIdx].text = newText;
                                      setTasks(newTasks);
                                    } else {
                                      // Delete if empty
                                      const newTasks = tasks.filter((_, i) => i !== realIdx);
                                      setTasks(newTasks);
                                    }
                                    setEditing(null);
                                    update();
                                  },
                                  onkeydown: (e) => {
                                    if (e.key === "Enter") {
                                      e.target.blur();
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

            // --- Footer ---
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
            }
          ]
        : [])
    ]
  };
}

// Initialize app
const appContainer = document.getElementById("app");
initRouter();
onRouteChange(() => renderApp(App, appContainer));
renderApp(App, appContainer);