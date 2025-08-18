/**
 * mini Framework - Simple DOM Rendering
 * Converts virtual DOM objects to actual DOM elements for testing
 */

(function() {
    'use strict';

    /**
     * Simple render function - converts virtual DOM to real DOM
     * This is just for testing the virtual DOM operations
     * 
     * @param {Object} virtualElement - Virtual DOM element
     * @param {HTMLElement} container - Where to render it
     * @returns {HTMLElement} The created DOM element
     */
    function render(virtualElement, container) {
        if (!virtualElement || !virtualElement._isVirtualElement) {
            throw new Error('render: virtualElement must be a virtual element');
        }

        if (!container || !container.nodeType) {
            throw new Error('render: container must be a DOM element');
        }

        // Convert virtual element to real DOM
        const domElement = createDOMElement(virtualElement);
        
        // Clear container and add new element
        container.innerHTML = '';
        container.appendChild(domElement);
        
        return domElement;
    }

    /**
     * Creates a real DOM element from virtual element
     * Handles text nodes, regular elements, attributes, and events
     * 
     * @param {Object} virtualElement - Virtual element to convert
     * @returns {HTMLElement|Text} Real DOM element
     */
    function createDOMElement(virtualElement) {
        // Handle text nodes
        if (virtualElement._isTextNode) {
            return document.createTextNode(virtualElement.text || '');
        }

        // Create the element
        const element = document.createElement(virtualElement.tag);

        // Apply attributes
        if (virtualElement.attrs) {
            Object.keys(virtualElement.attrs).forEach(name => {
                const value = virtualElement.attrs[name];
                
                if (name.startsWith('on') && typeof value === 'function') {
                    // Handle events (onclick, onchange, etc.)
                    const eventName = name.substring(2).toLowerCase();
                    element.addEventListener(eventName, value);
                } else if (name === 'className') {
                    // Handle className -> class
                    element.setAttribute('class', value);
                } else if (typeof value === 'boolean') {
                    // Handle boolean attributes (checked, disabled, etc.)
                    if (value) {
                        element.setAttribute(name, name);
                    }
                } else if (value !== null && value !== undefined) {
                    // Handle regular attributes
                    element.setAttribute(name, String(value));
                }
            });
        }

        // Add children
        if (virtualElement.children) {
            virtualElement.children.forEach(child => {
                const childElement = createDOMElement(child);
                element.appendChild(childElement);
            });
        }

        return element;
    }

    // Export the render functions
    const DOMRender = {
        render,
        createDOMElement
    };

    // Make available globally for testing
    if (typeof window !== 'undefined') {
        window.miniDOMRender = DOMRender;
    }

    // Also support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DOMRender;
    }

})();
