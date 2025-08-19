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
    el.appendChild(createEl(newVNode));
    return;
  }
  if (!newVNode) {
    el.remove();
    return;
  }
  // Text node
  if (oldVNode.tag === '#text' || newVNode.tag === '#text') {
    if (oldVNode.tag !== newVNode.tag || oldVNode.text !== newVNode.text) {
      const newEl = createEl(newVNode);
      el.replaceWith(newEl);
    }
    return;
  }
  // Different tags -> replace
  if (oldVNode.tag !== newVNode.tag) {
    const newEl = createEl(newVNode);
    el.replaceWith(newEl);
    return;
  }
  // Update attributes
  const oldP = oldVNode.props || {};
  const newP = newVNode.props || {};
  for (const k of new Set([...Object.keys(oldP), ...Object.keys(newP)])) {
    if (oldP[k] !== newP[k]) setProp(el, k, newP[k]);
  }
  // Children (naive)
  const oldC = oldVNode.children || [];
  const newC = newVNode.children || [];
  const max = Math.max(oldC.length, newC.length);
  for (let i = 0; i < max; i++) {
    const childEl = el.childNodes[i];
    const o = oldC[i];
    const n = newC[i];
    if (!o && n) {
      el.appendChild(createEl(n));
      continue;
    }
    if (o && !n) {
      el.removeChild(childEl);
      continue;
    }
    if (!same(o, n)) {
      const newEl = createEl(n);
      el.replaceChild(newEl, childEl);
      continue;
    }
    // same -> recurse
    diff(childEl, o, n);
  }
  newVNode._el = el;
}
