// Simple hash-based router for the mini-framework
// Usage: import { useRoute, initRouter } from './router.js'

let currentRoute = window.location.hash.slice(1) || '/';
let listeners = [];

export function useRoute() {
  return currentRoute;
}

export function onRouteChange(listener) {
  listeners.push(listener);
}

export function navigate(path) {
  if (path !== currentRoute) {
    window.location.hash = path;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', () => {
    currentRoute = window.location.hash.slice(1) || '/';
    listeners.forEach(fn => fn(currentRoute));
  });
}
