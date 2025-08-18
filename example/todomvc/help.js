/**
 * Show help dialog with keyboard shortcuts
 */
function showHelp() {
    // Create help dialog if it doesn't exist
    let helpDialog = document.getElementById('help-dialog');
    if (!helpDialog) {
        helpDialog = document.createElement('div');
        helpDialog.id = 'help-dialog';
        helpDialog.className = 'help-dialog';
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'help-close';
        closeButton.textContent = '×';
        closeButton.onclick = hideHelp;
        helpDialog.appendChild(closeButton);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'help-content';
        content.innerHTML = `
            <h2>TodoMVC Keyboard Shortcuts</h2>
            <table>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd></td>
                    <td>Reset app to initial state</td>
                </tr>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd></td>
                    <td>Export todos to JSON file</td>
                </tr>
                <tr>
                    <td><kbd>Double-click</kbd> on todo</td>
                    <td>Edit todo</td>
                </tr>
                <tr>
                    <td><kbd>Enter</kbd></td>
                    <td>Save edited todo</td>
                </tr>
                <tr>
                    <td><kbd>Escape</kbd></td>
                    <td>Cancel editing</td>
                </tr>
            </table>
            <p>This app was built with kob.js (mini-framework)</p>
        `;
        helpDialog.appendChild(content);
        
        document.body.appendChild(helpDialog);
        
       
    }
    
    // Create overlay
    let overlay = document.getElementById('help-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.className = 'help-overlay';
        overlay.onclick = hideHelp;
        document.body.appendChild(overlay);
    }
    
    // Show dialog and overlay
    helpDialog.classList.add('show');
    overlay.classList.add('show');
}

/**
 * Hide help dialog
 */
function hideHelp() {
    const helpDialog = document.getElementById('help-dialog');
    const overlay = document.getElementById('help-overlay');
    
    if (helpDialog) {
        helpDialog.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('show');
    }
}

/**
 * Add help button to the page
 */
function addHelpButton() {
    const helpButton = document.createElement('button');
    helpButton.className = 'help-button';
    helpButton.textContent = '?';
    helpButton.title = 'Show keyboard shortcuts';

    // Use mini Events system
    if (window.mini && window.mini.events) {
        window.mini.events.onClick(helpButton, showHelp);
    } else {
        // Fallback to onclick if mini Events not available
        helpButton.onclick = showHelp;
    }

    document.body.appendChild(helpButton);

     // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .help-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                max-width: 500px;
                width: 90%;
                display: none;
            }
            
            .help-dialog.show {
                display: block;
                animation: fadeIn 0.3s;
            }
            
            .help-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #777;
            }
            
            .help-content h2 {
                margin-top: 0;
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            
            .help-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            .help-content td {
                padding: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .help-content kbd {
                background-color: #f7f7f7;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
                color: #333;
                display: inline-block;
                font-size: 0.85em;
                font-weight: 700;
                line-height: 1;
                padding: 2px 4px;
                white-space: nowrap;
            }
            
            .help-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #af5b5e;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .help-button:hover {
                background: #cf7a7e;
            }
            
            .help-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                display: none;
            }
            
            .help-overlay.show {
                display: block;
            }
        `;
        document.head.appendChild(style);
        
}

// Add help button when DOM is loaded
function initializeHelp() {
    // Wait for mini Events to be available
    if (window.mini && window.mini.events) {
        addHelpButton();
    } else {
        // Fallback if mini Events not available yet
        setTimeout(initializeHelp, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHelp);
} else {
    initializeHelp();
}

// Make available globally
window.showHelp = showHelp;
window.hideHelp = hideHelp;