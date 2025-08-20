// src/minifw/vdom.js
// Minimal Virtual DOM: h(), render(), diff()
export function h(tag, props = {}, ...children) {
  // Normalize children (flatten, convert primitives to text nodes)
  const flat = [];
  (function flatPush(arr){
    for (const c of arr) {
      if (Array.isArray(c)) flatPush(c);
      else if (c === null || c === undefined || c === false) {}
      else if (typeof c === 'string' || typeof c === 'number') flat.push({ tag: '#text', text: String(c) });
      else flat.push(c);
    }
  })(children);
  return { tag, props: props || {}, children: flat };
}

function setProp(el, name, value) {
  if (name === 'className') { el.setAttribute('class', value); return; }
  if (name.startsWith('data-')) { el.setAttribute(name, value); return; }
  if (name === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
    el.value = value;
    return;
  }
  if (value === true) el.setAttribute(name, '');
  else if (value === false || value == null) el.removeAttribute(name);
  else el.setAttribute(name, value);
}

function createEl(vnode) {
  if (vnode.tag === '#text') return document.createTextNode(vnode.text || '');
  const el = document.createElement(vnode.tag);
  for (const [k, v] of Object.entries(vnode.props || {})) setProp(el, k, v);
  for (const c of (vnode.children || [])) el.appendChild(createEl(c));
  vnode._el = el;
  return el;
}

function same(a, b) {
  return a && b && a.tag === b.tag && (a.props?.key ?? null) === (b.props?.key ?? null);
}

export function render(vnode, container) {
  const dom = createEl(vnode);
  container.innerHTML = '';
  container.appendChild(dom);
  container._vnode = vnode;
}

export function update(container, nextVNode) {
  const prev = container._vnode;
  if (!prev) return render(nextVNode, container);
  const el = container.firstChild;
  diff(el, prev, nextVNode);
  container._vnode = nextVNode;
}

// A very small keyed-by-index diff. Good enough for learning/demo.
function diff(el, oldVNode, newVNode) {
  if (!oldVNode) {
    // No old vnode -> just create
    el.appendChild(createEl(newVNode));
    return;
  }

  if (!newVNode) {
    // No new vnode -> remove element
    if (el.parentNode) el.parentNode.removeChild(el);
    return;
  }

  // Text node
  if (oldVNode.tag === '#text' || newVNode.tag === '#text') {
    if (oldVNode.tag !== newVNode.tag || oldVNode.text !== newVNode.text) {
      const newEl = createEl(newVNode);
      el.replaceWith(newEl);
      newVNode._el = newEl;
    } else {
      newVNode._el = el;
    }
    return;
  }

  // Different tags -> replace
  if (oldVNode.tag !== newVNode.tag) {
    const newEl = createEl(newVNode);
    el.replaceWith(newEl);
    newVNode._el = newEl;
    return;
  }

  // Update attributes
  const oldP = oldVNode.props || {};
  const newP = newVNode.props || {};
  for (const key of new Set([...Object.keys(oldP), ...Object.keys(newP)])) {
    if (oldP[key] !== newP[key]) setProp(el, key, newP[key]);
  }

  // Update children
  const oldC = oldVNode.children || [];
  const newC = newVNode.children || [];
  const min = Math.min(oldC.length, newC.length);

  // Update existing children
  for (let i = 0; i < min; i++) {
    const childEl = el.childNodes[i];
    diff(childEl, oldC[i], newC[i]);
  }

  // Append new children
  for (let i = min; i < newC.length; i++) {
    el.appendChild(createEl(newC[i]));
  }

  // Remove extra old children
  for (let i = oldC.length - 1; i >= min; i--) {
    const childEl = el.childNodes[i];
    if (childEl) el.removeChild(childEl);
  }

  newVNode._el = el;
}

// Helper: check if two nodes are “same” (can be shallow)
// function same(a, b) {
//   return a && b && a.tag === b.tag && a.key === b.key;
// }
