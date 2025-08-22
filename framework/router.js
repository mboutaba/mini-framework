import { patchElement, container, getVDOM, setVDOM } from "./dom.js";
let routes = {};
export function setRoutes(map) {
  routes = map;
  handleRoute();
}
export function handleRoute() {
  const path = window.location.hash.replace('#','') || '/';
  const component = routes[path];
  if (component) {
    const newVDOM = component();
    setVDOM(null);
    patchElement(container, newVDOM, null, 0);
    setVDOM(newVDOM);
  } else if (routes['/']) {
    const newVDOM = routes['/']();
    setVDOM(null);
    patchElement(container, newVDOM, null, 0);
    setVDOM(newVDOM);
  }
}
export function goTo(path){ window.location.hash = path; }
