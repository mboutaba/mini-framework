let oldVDOM = null;

function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  // apply props (attributes + events)
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("on")) {
      el[key.toLowerCase()] = value; // e.g. onclick, oninput
    } else {
      el.setAttribute(key, value);
    }
  }

  // render children
  if (vnode.children) {
    vnode.children.forEach((child) => {
      el.appendChild(createElement(child));
    });
  }

  return el;
}

// Helper: compare props
function updateProps(dom, oldProps = {}, newProps = {}) {
  // Remove old props
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith("on")) {
        dom[key.toLowerCase()] = null;
      } else {
        dom.removeAttribute(key);
      }
    }
  }
  // Set new props
  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith("on")) {
        dom[key.toLowerCase()] = newProps[key];
      } else {
        dom.setAttribute(key, newProps[key]);
      }
    }
  }
}

// Diff function
function diff(parent, newVNode, oldVNode, index = 0) {
  const existingDom = parent.childNodes[index];

  // Case 1: old node doesn't exist
  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
    return;
  }

  // Case 2: new node doesn't exist
  if (!newVNode) {
    parent.removeChild(existingDom);
    return;
  }

  // Case 3: both are strings (text nodes)
  if (typeof newVNode === "string" && typeof oldVNode === "string") {
    if (newVNode !== oldVNode) {
      const newDom = document.createTextNode(newVNode);
      parent.replaceChild(newDom, existingDom);
    }
    return;
  }

  // Case 4: node type changed
  if (newVNode.type !== oldVNode.type) {
    parent.replaceChild(createElement(newVNode), existingDom);
    return;
  }

  // Case 5: update props
  updateProps(existingDom, oldVNode.props, newVNode.props);

  // Case 6: diff children
  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    diff(existingDom, newChildren[i], oldChildren[i], i);
  }
}

// Render function with diffing
export function renderApp(component, appContainer) {
  const newVDOM = component();

  if (oldVDOM === null) {
    appContainer.innerHTML = "";
    appContainer.appendChild(createElement(newVDOM));
  } else {
    diff(appContainer, newVDOM, oldVDOM);
  }

  oldVDOM = newVDOM;
}