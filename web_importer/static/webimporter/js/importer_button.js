// importer_button.js

(function($) {
    $(document).ready(function () {
        console.log("Importer button script loaded.");

        // Locate the parent element where the button will be inserted
        var parentContainer = $("#script_notifications");

        if (parentContainer.length) {
            console.log("#script_notifications element found.");

            // Create the importer button
            var newButton = $("<button>", {
                id: "importerToggleButton",
                class: "toolbar_button importer_button", // Added 'importer_button' class for styling
            });

            // Create icon element
            var icon = $("<i>", {
                class: "bi bi-cloud-upload", // Bootstrap Icons class
            });

            // Add icon and text to button
            newButton.append(icon);
            newButton.append(document.createTextNode("Import Data")); // Space added for separation

            // Add event listener to open the popup
            newButton.on("click", function () {
                console.log("Importer button clicked.");

                // Check if the dialog already exists
                var existingDialog = $("#importerDialog");
                if (existingDialog.length === 0) {
                    // Create the dialog
                    var dialogContent = $('<div id="importerDialog"></div>');

                    // Load the content into the dialog
                    dialogContent.load('/webimporter/server_side_browser/', function(response, status, xhr) {
                        if (status === "error") {
                            var msg = "Error loading content: ";
                            console.error(msg + xhr.status + " " + xhr.statusText);
                            dialogContent.html("<p>Error loading content.</p>");
                        } else {
                            // Initialize any scripts needed after content load
                            if (typeof initializeFileBrowser === 'function') {
                                initializeFileBrowser();
                            }
                        }
                    });

                    // Open the dialog
                    dialogContent.dialog({
                        modal: false,
                        draggable: true,
                        resizable: true,
                        title: '',
                        dialogClass: 'importer-dialog',
                        position: {
                            my: 'left+355 top+40',
                            at: 'left top',
                            of: window
                        },
                        close: function() {
                            dialogContent.dialog('destroy').remove();
                        },
                        open: function() {
                            $(this).parent().find(".ui-dialog-titlebar").remove();
                        }
                    });
                } else {
                    // Dialog already exists, bring it to front
                    existingDialog.dialog("open");
                }
            });

            // Add the button to the toolbar
            var buttonListItem = $("<li>").append(newButton);
            parentContainer.prepend(buttonListItem);

            console.log("Importer button added to toolbar.");
        } else {
            console.warn("Element with id='script_notifications' not found.");
        }
    });
})(jQuery);
