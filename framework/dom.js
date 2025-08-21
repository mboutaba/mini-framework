import { handleRoute } from "./router.js";
import { setReady } from "./store.js";

let currentVDOM = null;
let rootFunc = null;
export let container = null;

export function getVDOM() {
  return currentVDOM;
}

export function setVDOM(vdom) {
  currentVDOM = vdom;
}

export function mount(component, element) {
  rootFunc = component;
  container = element;
  currentVDOM = rootFunc();
  container.appendChild(buildElement(currentVDOM));



  window.onhashchange = handleRoute;
  window.onload = handleRoute;

  setReady();
}

export function update() {
  const newVDOM = rootFunc();
  patchElement(container, newVDOM, currentVDOM);
  currentVDOM = newVDOM;
}




export function buildElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.tag);

  if (vnode.attrs) {
    for (const [key, value] of Object.entries(vnode.attrs)) {
      if (key.startsWith("on") && typeof value === "function") {
        el[key.toLowerCase()] = value;
      } else if (key === "value") {
        el.value = value;
      } else if (key === "checked") {
        el.checked = value;
      }  else {
        el.setAttribute(key, value);
      }
    }
  }

  if (vnode.children) {
    vnode.children.forEach((child) => {
      el.appendChild(buildElement(child));
    });
  }

  return el;
}

function hasChanged(node1, node2) {
  return (
    typeof node1 !== typeof node2 ||
    (typeof node1 === "string" && node1 !== node2) ||
    node1.tag !== node2.tag
  );
}

function updateAttrs(el, newAttrs, oldAttrs) {
  for (const [key, value] of Object.entries(newAttrs)) {
    if (key.startsWith("on") && typeof value === "function") {
      const event = key.toLowerCase();
      if (oldAttrs[key] !== value) {
        el[event] = value;
      }
    } else {
      if (key === "value") {
        if (el.value !== value) {
          el.value = value;
        }
      } else if (key === "checked") {
        el.checked = value;
      } else if (oldAttrs[key] !== value) {
        el.setAttribute(key, value);
      }
    }
  }

  for (const key of Object.keys(oldAttrs)) {
    if (!(key in newAttrs)) {
      if (key.startsWith("on") && typeof oldAttrs[key] === "function") {
        const event = key.toLowerCase();
        el[event] = null;
      } else if (key === "checked") {
        el.checked = false;
      } else {
        el.removeAttribute(key);
      }
    }
  }
}

export function patchElement(parent, newNode, oldNode, index = 0) {

  const current = parent.childNodes[index];

  if (!oldNode) {
    if (!current) {
      parent.appendChild(buildElement(newNode));
    } else {
      parent.replaceChild(buildElement(newNode), current);
    }
    // Remove extra DOM nodes if newKids is shorter than oldKids or actual DOM
    
  } else if (!newNode) {
    if (current) parent.removeChild(current);

  } else if (hasChanged(newNode, oldNode)) {
    parent.replaceChild(buildElement(newNode), current);

  } else if (newNode.tag) {
    updateAttrs(current, newNode.attrs || {}, oldNode.attrs || {});

    const newKids = newNode.children || [];
    const oldKids = oldNode.children || [];
    const maxLen = Math.max(newKids.length, oldKids.length);

    for (let i = 0; i < maxLen; i++) {
      patchElement(current, newKids[i], oldKids[i], i);
    }
  }
}