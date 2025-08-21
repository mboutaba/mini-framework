import { patchElement, container, getVDOM, setVDOM } from "./dom.js";

let routes = {};


export function setRoutes(routeMap) {
   
  routes = routeMap;
  handleRoute();
}

export function handleRoute() {
  const path = window.location.hash.slice(1) || "/";
  const component = routes[path];
  
  
  
  if (component) {
    const newVDOM = component();
    setVDOM(null);
    patchElement(container, newVDOM, null);
    setVDOM(newVDOM);
  } else {
    console.warn("No route found:", path);
  }
}

export function goTo(path) {
  window.location.hash = path;
}

