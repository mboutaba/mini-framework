/**
 * mini Framework - Main Entry Point
 * A lightweight JavaScript framework with DOM abstraction, state management, event handling, and routing
 * 
 * @version 1.0.0
 * @author PoSSH Framework Team
 */

(function(global) {
    'use strict';

    /**
     * mini Framework Main Object
     */
    const mini = {
        version: '1.0.0',

        // Core modules
        core: null,
        dom: null, // Will be initialized with DOM module
        events: null,
        state: null,
        routing: (typeof require === 'function' ? require('./routing/router.js') : (window && window.mini && window.mini.routing) ? window.mini.routing : null),
        
        // Framework initialization
        init: function() {
            console.log('🚀 mini Framework v' + this.version + ' initializing...');

            // Initialize core modules when they're implemented
            if (this.core && typeof this.core.init === 'function') {
                this.core.init();
            }
            if (this.dom && typeof this.dom.init === 'function') {
                this.dom.init();
            }
            if (this.events && typeof this.events.init === 'function') {
                this.events.init();
            }
            if (this.state && typeof this.state.init === 'function') {
                this.state.init();
            }
            if (this.routing && typeof this.routing.init === 'function') {
                this.routing.init();
            }

            console.log('✅ mini Framework initialized successfully!');
            return this;
        },
        
        // Utility function to check if framework is ready
        isReady: function() {
            return !!(this.core && this.dom && this.events && this.state && this.routing);
        },
        
        // Get framework info
        getInfo: function() {
            return {
                name: 'mini Framework',
                version: this.version,
                modules: {
                    core: !!this.core,
                    dom: !!this.dom,
                    events: !!this.events,
                    state: !!this.state,
                    routing: !!this.routing
                }
            };
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            mini.init();
        });
    } else {
        // DOM is already ready
        setTimeout(function() {
            mini.init();
        }, 0);
    }

    // Expose mini to global scope
    global.mini = mini;

    // Also support CommonJS/Node.js if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = mini;
    }

})(typeof window !== 'undefined' ? window : this);
