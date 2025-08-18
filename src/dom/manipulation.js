/**
 * mini Framework - DOM Manipulation
 * Task 3: Add support for element nesting (appendChild equivalent)
 * Task 6: Add element removal functionality
 * Task 7: Create utility functions for common DOM operations
 */

(function() {
    'use strict';

    /**
     * Appends a child element to a parent element
     * @param {Object} parent - Parent virtual element
     * @param {Object} child - Child virtual element to append
     */
    function appendChild(parent, child) {
        if (!parent || !parent._isVirtualElement) {
            throw new Error('appendChild: parent must be a virtual element');
        }
        
        if (!child || !child._isVirtualElement) {
            throw new Error('appendChild: child must be a virtual element');
        }
        
        if (!parent.children) {
            parent.children = [];
        }
        
        parent.children.push(child);
    }

    /**
     * Removes a child element from a parent element
     * @param {Object} parent - Parent virtual element
     * @param {Object} child - Child virtual element to remove
     * @returns {boolean} True if child was removed
     */
    function removeChild(parent, child) {
        if (!parent || !parent._isVirtualElement) {
            throw new Error('removeChild: parent must be a virtual element');
        }
        
        if (!child || !child._isVirtualElement) {
            throw new Error('removeChild: child must be a virtual element');
        }
        
        if (!parent.children) {
            return false;
        }
        
        const index = parent.children.indexOf(child);
        if (index > -1) {
            parent.children.splice(index, 1);
            return true;
        }
        
        return false;
    }

    /**
     * Inserts a child element before a reference element
     * @param {Object} parent - Parent virtual element
     * @param {Object} newChild - New child to insert
     * @param {Object} referenceChild - Reference child to insert before
     */
    function insertBefore(parent, newChild, referenceChild) {
        if (!parent || !parent._isVirtualElement) {
            throw new Error('insertBefore: parent must be a virtual element');
        }
        
        if (!newChild || !newChild._isVirtualElement) {
            throw new Error('insertBefore: newChild must be a virtual element');
        }
        
        if (!parent.children) {
            parent.children = [];
        }
        
        if (!referenceChild) {
            // If no reference child, append to end
            appendChild(parent, newChild);
            return;
        }
        
        const index = parent.children.indexOf(referenceChild);
        if (index > -1) {
            parent.children.splice(index, 0, newChild);
        } else {
            // Reference child not found, append to end
            appendChild(parent, newChild);
        }
    }

    /**
     * Inserts a child element after a reference element
     * @param {Object} parent - Parent virtual element
     * @param {Object} newChild - New child to insert
     * @param {Object} referenceChild - Reference child to insert after
     */
    function insertAfter(parent, newChild, referenceChild) {
        if (!parent || !parent._isVirtualElement) {
            throw new Error('insertAfter: parent must be a virtual element');
        }
        
        if (!newChild || !newChild._isVirtualElement) {
            throw new Error('insertAfter: newChild must be a virtual element');
        }
        
        if (!parent.children) {
            parent.children = [];
        }
        
        if (!referenceChild) {
            // If no reference child, append to end
            appendChild(parent, newChild);
            return;
        }
        
        const index = parent.children.indexOf(referenceChild);
        if (index > -1) {
            parent.children.splice(index + 1, 0, newChild);
        } else {
            // Reference child not found, append to end
            appendChild(parent, newChild);
        }
    }

    /**
     * Replaces a child element with a new element
     * @param {Object} parent - Parent virtual element
     * @param {Object} newChild - New child element
     * @param {Object} oldChild - Old child element to replace
     * @returns {boolean} True if replacement was successful
     */
    function replaceChild(parent, newChild, oldChild) {
        if (!parent || !parent._isVirtualElement) {
            throw new Error('replaceChild: parent must be a virtual element');
        }
        
        if (!newChild || !newChild._isVirtualElement) {
            throw new Error('replaceChild: newChild must be a virtual element');
        }
        
        if (!oldChild || !oldChild._isVirtualElement) {
            throw new Error('replaceChild: oldChild must be a virtual element');
        }
        
        if (!parent.children) {
            return false;
        }
        
        const index = parent.children.indexOf(oldChild);
        if (index > -1) {
            parent.children[index] = newChild;
            return true;
        }
        
        return false;
    }

    /**
     * Removes all children from an element
     * @param {Object} element - Virtual element to clear
     */
    function clearChildren(element) {
        if (!element || !element._isVirtualElement) {
            throw new Error('clearChildren: element must be a virtual element');
        }
        
        element.children = [];
    }

    /**
     * Gets the first child of an element
     * @param {Object} element - Virtual element
     * @returns {Object|null} First child or null
     */
    function getFirstChild(element) {
        if (!element || !element._isVirtualElement || !element.children) {
            return null;
        }
        
        return element.children.length > 0 ? element.children[0] : null;
    }

    /**
     * Gets the last child of an element
     * @param {Object} element - Virtual element
     * @returns {Object|null} Last child or null
     */
    function getLastChild(element) {
        if (!element || !element._isVirtualElement || !element.children) {
            return null;
        }
        
        return element.children.length > 0 ? element.children[element.children.length - 1] : null;
    }

    /**
     * Gets all children of an element
     * @param {Object} element - Virtual element
     * @returns {Array} Array of child elements
     */
    function getChildren(element) {
        if (!element || !element._isVirtualElement) {
            return [];
        }
        
        return element.children ? [...element.children] : [];
    }

    /**
     * Gets the number of children
     * @param {Object} element - Virtual element
     * @returns {number} Number of children
     */
    function getChildCount(element) {
        if (!element || !element._isVirtualElement || !element.children) {
            return 0;
        }
        
        return element.children.length;
    }

    /**
     * Checks if element has children
     * @param {Object} element - Virtual element
     * @returns {boolean} True if element has children
     */
    function hasChildren(element) {
        return getChildCount(element) > 0;
    }

    /**
     * Finds a child element by a predicate function
     * @param {Object} element - Virtual element to search in
     * @param {Function} predicate - Function to test each child
     * @returns {Object|null} Found child or null
     */
    function findChild(element, predicate) {
        if (!element || !element._isVirtualElement || !element.children) {
            return null;
        }
        
        return element.children.find(predicate) || null;
    }

    /**
     * Finds all child elements matching a predicate function
     * @param {Object} element - Virtual element to search in
     * @param {Function} predicate - Function to test each child
     * @returns {Array} Array of matching children
     */
    function findChildren(element, predicate) {
        if (!element || !element._isVirtualElement || !element.children) {
            return [];
        }
        
        return element.children.filter(predicate);
    }

    // Export the manipulation functions
    const DOMManipulation = {
        appendChild,
        removeChild,
        insertBefore,
        insertAfter,
        replaceChild,
        clearChildren,
        getFirstChild,
        getLastChild,
        getChildren,
        getChildCount,
        hasChildren,
        findChild,
        findChildren
    };

    // Make available globally
    if (typeof window !== 'undefined') {
        window.miniDOMManipulation = DOMManipulation;
    }

    // Support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DOMManipulation;
    }

})();
