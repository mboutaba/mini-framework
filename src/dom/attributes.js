/**
 * mini Framework - DOM Attributes Management
 * Task 2: Implement attribute management (setAttribute, getAttribute, etc.)
 * Task 5: Implement basic CSS class management
 */

(function() {
    'use strict';

    /**
     * Sets an attribute on a virtual element
     * @param {Object} element - Virtual DOM element
     * @param {string} name - Attribute name
     * @param {*} value - Attribute value
     */
    function setAttribute(element, name, value) {
        if (!element || !element._isVirtualElement) {
            throw new Error('setAttribute: element must be a virtual element');
        }
        
        if (!element.attrs) {
            element.attrs = {};
        }
        
        element.attrs[name] = value;
    }

    /**
     * Gets an attribute from a virtual element
     * @param {Object} element - Virtual DOM element
     * @param {string} name - Attribute name
     * @returns {*} Attribute value
     */
    function getAttribute(element, name) {
        if (!element || !element._isVirtualElement) {
            throw new Error('getAttribute: element must be a virtual element');
        }
        
        return element.attrs ? element.attrs[name] : undefined;
    }

    /**
     * Removes an attribute from a virtual element
     * @param {Object} element - Virtual DOM element
     * @param {string} name - Attribute name
     */
    function removeAttribute(element, name) {
        if (!element || !element._isVirtualElement) {
            throw new Error('removeAttribute: element must be a virtual element');
        }
        
        if (element.attrs && element.attrs.hasOwnProperty(name)) {
            delete element.attrs[name];
        }
    }

    /**
     * Checks if element has an attribute
     * @param {Object} element - Virtual DOM element
     * @param {string} name - Attribute name
     * @returns {boolean} True if attribute exists
     */
    function hasAttribute(element, name) {
        if (!element || !element._isVirtualElement) {
            return false;
        }
        
        return element.attrs && element.attrs.hasOwnProperty(name);
    }

    /**
     * Adds CSS class(es) to element
     * @param {Object} element - Virtual DOM element
     * @param {string} className - Class name(s) to add (space-separated)
     */
    function addClass(element, className) {
        if (!element || !element._isVirtualElement) {
            throw new Error('addClass: element must be a virtual element');
        }
        
        if (!className) return;
        
        const currentClass = getAttribute(element, 'class') || '';
        const classesToAdd = className.split(' ').filter(cls => cls.trim());
        const currentClasses = currentClass.split(' ').filter(cls => cls.trim());
        
        classesToAdd.forEach(cls => {
            if (!currentClasses.includes(cls)) {
                currentClasses.push(cls);
            }
        });
        
        setAttribute(element, 'class', currentClasses.join(' '));
    }

    /**
     * Removes CSS class(es) from element
     * @param {Object} element - Virtual DOM element
     * @param {string} className - Class name(s) to remove (space-separated)
     */
    function removeClass(element, className) {
        if (!element || !element._isVirtualElement) {
            throw new Error('removeClass: element must be a virtual element');
        }
        
        if (!className) return;
        
        const currentClass = getAttribute(element, 'class') || '';
        const classesToRemove = className.split(' ').filter(cls => cls.trim());
        let currentClasses = currentClass.split(' ').filter(cls => cls.trim());
        
        classesToRemove.forEach(cls => {
            currentClasses = currentClasses.filter(currentCls => currentCls !== cls);
        });
        
        if (currentClasses.length > 0) {
            setAttribute(element, 'class', currentClasses.join(' '));
        } else {
            removeAttribute(element, 'class');
        }
    }

    /**
     * Toggles CSS class on element
     * @param {Object} element - Virtual DOM element
     * @param {string} className - Class name to toggle
     */
    function toggleClass(element, className) {
        if (hasClass(element, className)) {
            removeClass(element, className);
        } else {
            addClass(element, className);
        }
    }

    /**
     * Checks if element has CSS class
     * @param {Object} element - Virtual DOM element
     * @param {string} className - Class name to check
     * @returns {boolean} True if element has class
     */
    function hasClass(element, className) {
        if (!element || !element._isVirtualElement || !className) {
            return false;
        }
        
        const currentClass = getAttribute(element, 'class') || '';
        const currentClasses = currentClass.split(' ').filter(cls => cls.trim());
        
        return currentClasses.includes(className.trim());
    }

    /**
     * Sets inline style on element
     * @param {Object} element - Virtual DOM element
     * @param {string|Object} property - Style property name or style object
     * @param {string} value - Style value (if property is string)
     */
    function setStyle(element, property, value) {
        if (!element || !element._isVirtualElement) {
            throw new Error('setStyle: element must be a virtual element');
        }
        
        if (typeof property === 'object') {
            // Set multiple styles from object
            Object.keys(property).forEach(prop => {
                setStyle(element, prop, property[prop]);
            });
            return;
        }
        
        const currentStyle = getAttribute(element, 'style') || '';
        const styles = parseStyleString(currentStyle);
        styles[property] = value;
        
        const newStyleString = Object.keys(styles)
            .map(prop => `${prop}: ${styles[prop]}`)
            .join('; ');
            
        setAttribute(element, 'style', newStyleString);
    }

    /**
     * Gets inline style from element
     * @param {Object} element - Virtual DOM element
     * @param {string} property - Style property name
     * @returns {string} Style value
     */
    function getStyle(element, property) {
        if (!element || !element._isVirtualElement) {
            return undefined;
        }
        
        const currentStyle = getAttribute(element, 'style') || '';
        const styles = parseStyleString(currentStyle);
        
        return styles[property];
    }

    /**
     * Parses style string into object
     * @param {string} styleString - CSS style string
     * @returns {Object} Style object
     */
    function parseStyleString(styleString) {
        const styles = {};
        if (!styleString) return styles;
        
        styleString.split(';').forEach(rule => {
            const colonIndex = rule.indexOf(':');
            if (colonIndex > 0) {
                const property = rule.substring(0, colonIndex).trim();
                const value = rule.substring(colonIndex + 1).trim();
                if (property && value) {
                    styles[property] = value;
                }
            }
        });
        
        return styles;
    }

    // Export the attribute management functions
    const DOMAttributes = {
        setAttribute,
        getAttribute,
        removeAttribute,
        hasAttribute,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        setStyle,
        getStyle
    };

    // Make available globally
    if (typeof window !== 'undefined') {
        window.miniDOMAttributes = DOMAttributes;
    }

    // Support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DOMAttributes;
    }

})();
