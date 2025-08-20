// src/minifw/events.js
// Declarative event layer (different API from addEventListener).
// One delegated listener per type; users call events.on(type, selector, handler).
export function createEvents(root = document) {
  const handlers = new Map(); // type -> Array<{selector, fn}>
  function ensure(type) {
    if (handlers.has(type)) return;
    handlers.set(type, []);
    root.addEventListener(type, (ev) => {
      const list = handlers.get(type);
      if (!list) return;
      for (const { selector, fn } of list) {
        const el = ev.target.closest(selector);
        if (el && root.contains(el)) {
          fn(ev, el);
        }
      }
    });
  }
  function on(type, selector, fn) {
    ensure(type);
    handlers.get(type).push({ selector, fn });
    return () => {
      const arr = handlers.get(type) || [];
      const i = arr.findIndex(x => x.selector === selector && x.fn === fn);
      if (i >= 0) arr.splice(i, 1);
    };
  }
  // Utility: action dispatcher for [data-action]=\"fn(args)\"
  function bindActions(dispatch) {
    on('click', '[data-action]', (ev, el) => {
      const expr = el.getAttribute('data-action');
      const { name, args } = parseAction(expr, el, ev);
      dispatch(name, ...args);
    });
    on('input', '[data-action-input]', (ev, el) => {
      const expr = el.getAttribute('data-action-input');
      const { name, args } = parseAction(expr, el, ev);
      dispatch(name, ...args);
    });
    on('submit', 'form[data-action-submit]', (ev, el) => {
      ev.preventDefault();
      const expr = el.getAttribute('data-action-submit');
      const { name, args } = parseAction(expr, el, ev);
      dispatch(name, ...args);
    });
    on('keydown', '[data-action-keydown]', (ev, el) => {
    const expr = el.getAttribute('data-action-keydown');
    const { name, args } = parseAction(expr, el, ev);
    dispatch(name, ...args);
  });
  }

  return { on, bindActions };
}

function parseAction(expr, el, ev) {
  const m = expr.match(/^\s*([a-zA-Z_$][\w$]*)\s*(?:\((.*)\))?\s*$/);
  if (!m) return { name: expr, args: [] };
  const name = m[1];
  const argsSrc = m[2] || '';
  const args = [];
  if (argsSrc.trim()) {
    const parts = splitArgs(argsSrc);
    for (const p of parts) {
      const t = p.trim();
      if (t === '$event') args.push(ev);
      else if (t === '$el') args.push(el);
      else if (t === '$value') args.push(el.value ?? el.getAttribute('data-value'));
      else if (/^[\"'`].*[\"'`]$/.test(t)) args.push(t.slice(1,-1));
      else if (/^\d+(?:\.\d+)?$/.test(t)) args.push(parseFloat(t));
      else if (t === 'true' || t === 'false') args.push(t === 'true');
      else args.push(t);
    }
  }
  return { name, args };
}

function splitArgs(s) {
  const out = []; let buf = ''; let q = null; let depth = 0;
  for (let i=0; i<s.length; i++) {
    const c = s[i];
    if (q) { buf += c; if (c===q && s[i-1] !== '\\') q=null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; buf += c; continue; }
    if (c === '(') { depth++; buf += c; continue; }
    if (c === ')') { depth--; buf += c; continue; }
    if (c === ',' && depth===0) { out.push(buf); buf=''; continue; }
    buf += c;
  }
  if (buf.trim()) out.push(buf);
  return out;
}
