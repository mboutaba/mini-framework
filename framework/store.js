import { update } from "./dom.js";

export let state = {};
 
let ready = false;

export function useStore(key, initialValue) {
  if (!(key in state)) {    
    state[key] = initialValue;
  }

  function get() {
    return state[key];
  }
  
  function set(newValue) {
    state[key] = newValue;
    if (ready) {
      update();
    }
  }

  return [get, set];
}

export function setReady() {
  ready = true;
}