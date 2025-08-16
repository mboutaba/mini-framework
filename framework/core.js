
/*
  KOB.JS - a tiny microframework for DOM abstraction, routing,
  state management and event handling.
*/
export function h(tag, attrs = {}, ...children) {
  const flat = [];
  (function flatPush(arr) {
    for (const c of arr) {
      if (Array.isArray(c)) flatPush(c);
      else flat.push(c);
    }
  })(children);

  return { tag, attrs: attrs || {}, children: flat.map(c => (
    typeof c === "string" || typeof c === "number"
      ? { tag: "__text__", text: String(c) }
      : c
  )) };
}

function setAttr(el, name, value) {
  if (name === "style" && typeof value === "object") {
    Object.assign(el.style, value);
    return;
  }
  if (name.startsWith("data-")) {
    el.setAttribute(name, value);
    return;
  }
  if (name === "class" || name === "className") {
    el.setAttribute("class", value);
    return;
  }
  if (name === "on") {
    return;
  }
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, value === true ? "" : value);
  }
}

function bindEvents(el, on) {
  if (!on) return;
  for (const [event, handler] of Object.entries(on)) {
    const wrapped = (ev) => {
      handler(ev);
      Events.emit("@dom:" + event, { ev, el });
    };
    el.addEventListener(event, wrapped);
  }
}

function createElement(vnode) {
  if (vnode.tag === "__text__") {
    return document.createTextNode(vnode.text ?? "");
  }
  const el = document.createElement(vnode.tag);
  const { attrs = {}, children = [] } = vnode;
  for (const [k, v] of Object.entries(attrs)) {
    setAttr(el, k, v);
  }
  bindEvents(el, attrs.on);
  for (const c of children) {
    el.appendChild(createElement(c));
  }
  return el;
}

function changed(a, b) {
  return (
    typeof a !== typeof b ||
    (a.tag !== b.tag) ||
    (a.tag === "__text__" && a.text !== b.text)
  );
}

function updateAttributes(el, oldAttrs = {}, newAttrs = {}) {
  for (const name of Object.keys(oldAttrs)) {
    if (!(name in newAttrs)) {
      if (name === "on") continue;
      el.removeAttribute(name);
    }
  }
  for (const [name, value] of Object.entries(newAttrs)) {
    if (name === "on") continue;
    if (oldAttrs[name] !== value) {
      setAttr(el, name, value);
    }
  }
}

function patch(parent, el, oldVNode, newVNode, index = 0) {
  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
    return;
  }
  if (!newVNode) {
    parent.removeChild(parent.childNodes[index]);
    return;
  }
  if (changed(oldVNode, newVNode)) {
    parent.replaceChild(createElement(newVNode), parent.childNodes[index]);
    return;
  }
  if (newVNode.tag !== "__text__") {
    updateAttributes(parent.childNodes[index], oldVNode.attrs, newVNode.attrs);
    if ((oldVNode.attrs && oldVNode.attrs.on) !== (newVNode.attrs && newVNode.attrs.on)) {
      const fresh = createElement(newVNode);
      parent.replaceChild(fresh, parent.childNodes[index]);
      return;
    }
  }
  const oldLen = oldVNode.children?.length ?? 0;
  const newLen = newVNode.children?.length ?? 0;
  const len = Math.max(oldLen, newLen);
  for (let i = 0; i < len; i++) {
    patch(parent.childNodes[index], parent.childNodes[index]?.childNodes?.[i], oldVNode.children?.[i], newVNode.children?.[i], i);
  }
}

export function mount(view, container, store = null) {
  let tree = null;
  function render() {
    const nextTree = view(store ? store.getState() : undefined);
    if (tree === null) {
      const el = createElement(nextTree);
      container.innerHTML = "";
      container.appendChild(el);
      tree = nextTree;
      return;
    }
    patch(container, container.firstChild, tree, nextTree, 0);
    tree = nextTree;
  }
  render();
  return { rerender: render };
}

export const Events = (() => {
  const map = new Map();
  return {
    on(name, fn) {
      const list = map.get(name) || [];
      list.push(fn);
      map.set(name, list);
      return () => {
        const arr = map.get(name) || [];
        const idx = arr.indexOf(fn);
        if (idx >= 0) arr.splice(idx, 1);
      };
    },
    emit(name, payload) {
      (map.get(name) || []).forEach(fn => fn(payload));
    }
  };
})();

export function createStore(initialState = {}, reducers = {}) {
  let state = structuredClone(initialState);
  const listeners = new Set();
  function getState() { return state; }
  function setState(next) {
    state = typeof next === "function" ? next(state) : next;
    listeners.forEach(l => l(state));
  }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function dispatch(action) {
    const type = action?.type;
    if (!type || !reducers[type]) { console.warn("Unknown action:", action); return; }
    const next = reducers[type](state, action);
    setState(next);
  }
  return { getState, setState, subscribe, dispatch };
}

export function Router({ routes, store, stateKey = "route" }) {
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    return raw;
  }
  function setRoute(path) {
    if (location.hash !== "#" + path) location.hash = path;
  }
  function onChange() {
    const path = parseHash();
    if (store) {
      store.setState(prev => ({ ...prev, [stateKey]: path }));
    }
    Events.emit("@route", { path });
  }
  window.addEventListener("hashchange", onChange);
  window.addEventListener("load", onChange);
  return { setRoute, onChange };
}
