// Simple VDOM + centralized event delegation
let currentVDOM = null;
let rootFunc = null;
export let container = null;

const eventRegistry = { click: {}, input: {}, keydown: {}, dblclick: {}, blur: {} };
let handlerId = 1;

function ensureGlobalListener(type) {
  if (!document._listeners) document._listeners = {};
  if (document._listeners[type]) return;
  document._listeners[type] = true;
  document.addEventListener(type, (e) => {
    let el = e.target;
    while (el && el !== document) {
      const id = el.getAttribute && el.getAttribute('data-evt-' + type);
      if (id) {
        const fn = eventRegistry[type][id];
        if (fn) return fn.call(el, e);
      }
      el = el.parentNode;
    }
  }, true);
}

function registerEvent(type, fn) {
  ensureGlobalListener(type);
  const id = String(handlerId++);
  eventRegistry[type][id] = fn;
  return id;
}

export function buildElement(vnode) {
  if (vnode === undefined || vnode === null) return document.createTextNode('');
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  const el = document.createElement(vnode.tag || 'div');
  const attrs = vnode.attrs || {};
  for (const [k,v] of Object.entries(attrs)) {
    if (k.startsWith('on') && typeof v === 'function') {
      const ev = k.slice(2).toLowerCase();
      const id = registerEvent(ev, v);
      el.setAttribute('data-evt-' + ev, id);
    } else if (k === 'className') {
      el.className = v;
    } else if (k === 'checked') {
      el.checked = !!v;
    } else if (k === 'value') {
      el.value = v;
    } else if (k === 'dataset' && typeof v === 'object') {
      for (const [dk,dv] of Object.entries(v)) el.dataset[dk] = dv;
    } else if (k === 'for') {
      el.htmlFor = v;
    } else {
      el.setAttribute(k, v);
    }
  }
  (vnode.children || []).forEach(child => el.appendChild(buildElement(child)));
  return el;
}

function hasChanged(a,b) {
  if (typeof a !== typeof b) return true;
  if (typeof a === 'string' || typeof a === 'number') return a !== b;
  if (!a || !b) return a !== b;
  return a.tag !== b.tag;
}

export function patchElement(parent, newNode, oldNode, index = 0) {
  const current = parent.childNodes[index];
  if (!oldNode) {
    parent.appendChild(buildElement(newNode));
    return;
  }
  if (!newNode) {
    if (current) parent.removeChild(current);
    return;
  }
  if (hasChanged(newNode, oldNode)) {
    parent.replaceChild(buildElement(newNode), current);
    return;
  }
  if (typeof newNode === 'string' || typeof newNode === 'number') {
    if (current.nodeValue !== String(newNode)) current.nodeValue = String(newNode);
    return;
  }
  // Update attributes simple diff
  const newAttrs = newNode.attrs || {};
  const oldAttrs = oldNode.attrs || {};
  for (const k of Object.keys(oldAttrs)) {
    if (!(k in newAttrs)) {
      if (k.startsWith('on')) {
        const ev = k.slice(2).toLowerCase();
        if (current.removeAttribute) current.removeAttribute('data-evt-' + ev);
      } else if (k === 'className') current.className = '';
      else current.removeAttribute(k);
    }
  }
  for (const [k,v] of Object.entries(newAttrs)) {
    if (k.startsWith('on') && typeof v === 'function') {
      const ev = k.slice(2).toLowerCase();
      const id = registerEvent(ev, v);
      current.setAttribute('data-evt-' + ev, id);
    } else if (k === 'className') current.className = v;
    else if (k === 'checked') current.checked = !!v;
    else if (k === 'value') current.value = v;
    else if (k === 'dataset' && typeof v === 'object') {
      for (const [dk,dv] of Object.entries(v)) current.dataset[dk] = dv;
    } else if (k === 'for') current.htmlFor = v;
    else current.setAttribute(k, v);
  }

  const newKids = newNode.children || [];
  const oldKids = oldNode.children || [];
  if (newKids.length !== oldKids.length) {
    current.innerHTML = '';
    newKids.forEach((c) => current.appendChild(buildElement(c)));
    return;
  }
  for (let i=0;i<newKids.length;i++) patchElement(current, newKids[i], oldKids[i], i);
}

export function mount(component, element) {
  container = element;
  rootFunc = component;
  currentVDOM = rootFunc();
  container.appendChild(buildElement(currentVDOM));
  window.onhashchange = () => { if (typeof window.handleRoute === 'function') window.handleRoute(); };
  window.onload = () => { if (typeof window.handleRoute === 'function') window.handleRoute(); };
  if (typeof window.setReady === 'function') window.setReady();
}

export function update() {
  const newVDOM = rootFunc();
  patchElement(container, newVDOM, currentVDOM, 0);
  currentVDOM = newVDOM;
}

export function getVDOM(){ return currentVDOM; }
export function setVDOM(v){ currentVDOM = v; }
