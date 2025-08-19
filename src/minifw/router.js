// src/minifw/router.js
// Tiny hash router with :params
export function createRouter(routes) {
  const norm = (h) => (h || location.hash).replace(/^#/, '') || '/';
  const compiled = routes.map(r => compile(r.path, r));

  function compile(path, route) {
    const keys = [];
    const re = new RegExp('^' + path.replace(/:[^/]+/g, (m) => {
      keys.push(m.slice(1)); return '([^/]+)';
    }) + '$');
    return { re, keys, route };
  }

  function match(path) {
    for (const { re, keys, route } of compiled) {
      const m = path.match(re);
      if (m) {
        const params = {};
        keys.forEach((k, i) => params[k] = decodeURIComponent(m[i+1]));
        return { ...route, params, path };
      }
    }
    const not = routes.find(r => r.path === '/404') || routes[0];
    return { ...not, params: {}, path };
  }

  const api = {
    current: match(norm()),
    go(to) { location.hash = to; },
    onChange: () => {}
  };

  function apply() {
    api.current = match(norm());
    api.onChange(api.current);
  }

  window.addEventListener('hashchange', apply);
  setTimeout(apply, 0);
  return api;
}
