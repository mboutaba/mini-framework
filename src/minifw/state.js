// src/minifw/state.js
// Simple immutable state with subscribe and set/update helpers
export function createState(initial) {
  let state = deepFreeze(initial);
  const subs = new Set();

  function get() { return state; }
  function set(nextOrUpdater) {
    const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(state) : nextOrUpdater;
    state = deepFreeze(next);
    subs.forEach(fn => fn(state));
  }
  function update(patch) {
    set({ ...state, ...patch });
  }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  return { get, set, update, subscribe };
}

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const k of Object.keys(obj)) deepFreeze(obj[k]);
  }
  return obj;
}
