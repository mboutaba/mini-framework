/**
 * mini Framework - Routing System (Hash-based)
 * Handles route registration, matching, and route change events
 */

(function() {
    'use strict';

    // Internal route table
    const routes = {};
    let currentRoute = null;
    let onRouteChange = null;

    // Register a route and its handler
    function registerRoute(path, handler) {
        routes[path] = handler;
    }

    // Match the current hash to a route
    function matchRoute(hash) {
        return routes[hash] || null;
    }

    // Navigate to a route (updates hash)
    function navigateTo(path) {
        if (window.location.hash !== '#' + path) {
            window.location.hash = '#' + path;
        } else {
            // If already on the route, manually trigger
            handleRouteChange();
        }
    }

    // Handle browser back/forward
    function back() {
        window.history.back();
    }
    function forward() {
        window.history.forward();
    }

    // Main route change handler
    function handleRouteChange() {
        const hash = window.location.hash.replace(/^#/, '') || 'all';
        const handler = matchRoute(hash);
        currentRoute = hash;
        if (typeof handler === 'function') {
            handler(hash);
        }
        if (typeof onRouteChange === 'function') {
            onRouteChange(hash);
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);

    // Handle initial route on page load
    window.addEventListener('DOMContentLoaded', handleRouteChange);

    // Allow integration with state management
    function setRouteChangeListener(fn) {
        onRouteChange = fn;
    }

    // Initialize the router
    function init() {
        console.log('🔄 Router module initialized');
        // Trigger initial route handling
        handleRouteChange();
        return true;
    }

    // Export router API
    const Router = {
        init,
        registerRoute,
        navigateTo,
        back,
        forward,
        setRouteChangeListener,
        getCurrentRoute: function() { return currentRoute; }
    };

    // Attach to mini if available
    if (typeof window !== 'undefined' && window.mini) {
        window.mini.routing = Router;
    }

    // Support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Router;
    }

})(); 