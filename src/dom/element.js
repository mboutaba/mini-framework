/**
 * mini Framework - DOM Element Creation
 * Task 1: Create element creation function (createElement equivalent)
 * Task 4: Create text content management
 */

(function() {
    'use strict';

    // Counter for unique element IDs
    let elementIdCounter = 0;

    /**
     * Creates a virtual DOM element
     * @param {string} tag - HTML tag name (div, span, button, etc.)
     * @param {Object} attributes - Element attributes and properties
     * @param {string|Array|Object} children - Child elements or text content
     * @returns {Object} Virtual DOM element
     */
    function createElement(tag, attributes, children) {
        if (!tag || typeof tag !== 'string') {
            throw new Error('createElement: tag must be a non-empty string');
        }

        const attrs = attributes || {};
        const normalizedChildren = normalizeChildren(children);

        return {
            tag: tag.toLowerCase(),
            attrs: Object.assign({}, attrs),
            children: normalizedChildren,
            _isVirtualElement: true,
            _id: generateElementId()
        };
    }

    /**
     * Creates a virtual text node
     * @param {string} text - Text content
     * @returns {Object} Virtual text node
     */
    function createTextNode(text) {
        return {
            tag: '#text',
            text: String(text || ''),
            _isVirtualElement: true,
            _isTextNode: true,
            _id: generateElementId()
        };
    }

    /**
     * Normalizes children into array format
     * @param {*} children - Various children formats
     * @returns {Array} Normalized children array
     */
    function normalizeChildren(children) {
        if (!children) return [];
        
        if (!Array.isArray(children)) {
            children = [children];
        }

        return children.map(child => {
            if (typeof child === 'string' || typeof child === 'number') {
                return createTextNode(child);
            } else if (child && child._isVirtualElement) {
                return child;
            } else {
                console.warn('Invalid child element:', child);
                return createTextNode('');
            }
        });
    }

    /**
     * Generates unique element ID
     * @returns {string} Unique ID
     */
    function generateElementId() {
        return 'mini-' + (++elementIdCounter);
    }

    /**
     * Checks if object is a virtual element
     * @param {*} obj - Object to check
     * @returns {boolean} True if virtual element
     */
    function isVirtualElement(obj) {
        return obj && obj._isVirtualElement === true;
    }

    /**
     * Checks if object is a text node
     * @param {*} obj - Object to check
     * @returns {boolean} True if text node
     */
    function isTextNode(obj) {
        return obj && obj._isTextNode === true;
    }

    // Export the element creation functions
    const DOMElement = {
        createElement,
        createTextNode,
        isVirtualElement,
        isTextNode
    };

    // Make available globally
    if (typeof window !== 'undefined') {
        window.miniDOMElement = DOMElement;
    }

    // Support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DOMElement;
    }

})();
