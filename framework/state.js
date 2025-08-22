import { update } from "./dom.js";
export let state = {};
let ready = false;
export function useState(key, initial) {
  if (!(key in state)) state[key] = initial;
  function get(){ return state[key]; }
  function set(v){ state[key] = v; if (ready) update(); }
  return [get, set];
}
export function setReady(){ ready = true; }
