// Convert VDOM object → real DOM

let oldVDOM = null;



function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  // apply props (attributes + events)
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("on")) {
      el[key.toLowerCase()] = value; // e.g. onclick, oninput
    } else {
      el.setAttribute(key, value);
    }
  }

  // render children
  if(vnode.children){
  vnode.children.forEach((child) => {
    el.appendChild(createElement(child));
  });
  }
  
  return el;
}


// Render function (replace old DOM for now, diff comes later)
export function renderApp(component, appContainer) {

  appContainer.innerHTML = ""; // clear
  appContainer.appendChild(createElement(component()));

}



// function diff(oldNode, newNode, parentDom) {
//   // Text nodes
//   if (typeof newNode === "string") {
//     if (!oldNode) {
//       const textDom = document.createTextNode(newNode);
//       parentDom.appendChild(textDom);
//       newNode.dom = textDom;
//     } else if (oldNode.type === undefined) { 
//       // oldNode is also text
//       oldNode.dom.textContent = newNode;
//       newNode.dom = oldNode.dom;
//     }
//     return;
//   }

//   // New element node
//   if (!oldNode) {
//     const newDom = createElement(newNode); // creates DOM and sets props/events
//     parentDom.appendChild(newDom);
//     newNode.dom = newDom;
//     return; // don't run props update loop
//   }

//   // Remove node
//   if (!newNode) {
//     parentDom.removeChild(oldNode.dom);
//     return;
//   }

//   // Replace node if type changed
//   if (oldNode.type !== newNode.type) {
//     const newDom = createElement(newNode);
//     parentDom.replaceChild(newDom, oldNode.dom);
//     newNode.dom = newDom;
//     return;
//   }

//   // Reuse DOM
//   const dom = (newNode.dom = oldNode.dom);

  
//   console.log("this is dom", dom)
//   // Only run props loop on real elements (not text)
//   if (typeof oldNode !== "string") {
//     const oldProps = oldNode.props || {};
//     const newProps = newNode.props || {};

//     // Remove old props
//     for (const key in oldProps) {
//       if (!(key in newProps)) {
//         if (key.startsWith("on")) dom[key.toLowerCase()] = null;
//         else dom.removeAttribute(key);
//       }
//     }

//     // Set new/changed props
//     for (const key in newProps) {
//       if (key.startsWith("on")) {
//         dom[key.toLowerCase()] = newProps[key];
//       } else if (oldProps[key] !== newProps[key]) {
//         dom.setAttribute(key, newProps[key]);
//       }
//     }
//   }

//   // Diff children recursively
//   const oldChildren = oldNode.children || [];
//   const newChildren = newNode.children || [];
//   const maxLen = Math.max(oldChildren.length, newChildren.length);

//   for (let i = 0; i < maxLen; i++) {
//     diff(oldChildren[i], newChildren[i], dom);
//   }
// }
