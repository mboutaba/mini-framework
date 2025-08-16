// app.js

const app = new MyFramework("app");

// Component Home
function Home() {
  return {
    tag: "div",
    children: [
      { tag: "h1", children: ["Welcome Home"] },
      {
        tag: "button",
        attrs: { class: "nav-link" },
        events: { click: () => app.navigate("/todo") },
        children: ["Go to Todo"]
      }
    ]
  };
}

// Component Todo
function TodoPage(state) {
  return {
    tag: "div",
    children: [
      { tag: "h1", children: ["Todo List"] },
      {
        tag: "input",
        attrs: { type: "text", id: "newTodo", placeholder: "Add todo..." }
      },
      {
        tag: "button",
        children: ["Add"],
        events: {
          click: () => {
            const input = document.getElementById("newTodo");
            if (input.value) {
              app.setState({ todos: [...(state.todos || []), input.value] });
              input.value = "";
            }
          }
        }
      },
      {
        tag: "ul",
        children: (state.todos || []).map(todo => ({
          tag: "li",
          children: [
            todo,
            {
              tag: "button",
              attrs: { class: "delete-btn" },
              children: ["X"],
              events: {
                click: () => {
                  const newTodos = state.todos.filter(t => t !== todo);
                  app.setState({ todos: newTodos });
                }
              }
            }
          ]
        }))
      }
    ]
  };
}

// Routes
app.addRoute("/", Home);
app.addRoute("/todo", TodoPage);

// Re-render when state changes
app.onStateChange = (state) => {
  app.render(app.routes[window.location.pathname](state));
};

// Init
app.setState({ todos: [] });
app.navigate("/");
