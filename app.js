// app.js

const app = new MyFramework("app");

// Define components
function Home() {
  return {
    tag: "div",
    attrs: { class: "home" },
    children: [
      { tag: "h1", children: ["Welcome Home"] },
      {
        tag: "button",
        attrs: { class: "go-todo" },
        events: { click: () => app.navigate("/todo") },
        children: ["Go to Todo"]
      }
    ]
  };
}

function TodoPage(state) {
  return {
    tag: "div",
    attrs: { class: "todo" },
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
          children: [todo]
        }))
      }
    ]
  };
}

// Add routes
app.addRoute("/", Home);
app.addRoute("/todo", TodoPage);

// Listen to state changes
app.onStateChange = (state) => {
  app.render(app.routes[window.location.pathname](state));
};

// Init app
app.setState({ todos: [] });
app.navigate("/");
