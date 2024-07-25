console.log("scriptLauncher.integrated.js loaded");

// Define OME object if it doesn't exist
if (typeof OME === 'undefined') {
    OME = {};
}

// Add the openScriptWindow function to the OME object
OME.openScriptWindow = function(scriptId) {
    console.log("Opening script window for script ID:", scriptId);
    // Add your logic here to open the script window
    // This might involve making an AJAX call or opening a new window/dialog
    // Example:
    window.open('/webclient/script_ui/' + scriptId + '/', 'Script_' + scriptId, 'height=600,width=600');
};