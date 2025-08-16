// framework.js

class MyFramework {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.state = {};
    this.routes = {};
  }

  // Create virtual element
  createElement(vnode) {
    if (typeof vnode === "string") {
      return document.createTextNode(vnode);
    }

    const el = document.createElement(vnode.tag);

    // Add attributes
    for (let [key, value] of Object.entries(vnode.attrs || {})) {
      el.setAttribute(key, value);
    }

    // Add events (custom system)
    if (vnode.events) {
      for (let [event, handler] of Object.entries(vnode.events)) {
        el[`on${event}`] = handler;
      }
    }

    // Children
    (vnode.children || []).forEach(child => {
      el.appendChild(this.createElement(child));
    });

    return el;
  }

  // Render
  render(vnode) {
    this.root.innerHTML = "";
    this.root.appendChild(this.createElement(vnode));
  }

  // State management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (this.onStateChange) this.onStateChange(this.state);
  }

  // Routing system
  addRoute(path, viewFn) {
    this.routes[path] = viewFn;
  }

  navigate(path) {
    window.history.pushState({}, path, window.location.origin + path);
    this.render(this.routes[path](this.state));
  }
}
