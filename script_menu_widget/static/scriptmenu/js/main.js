// main.js

var jQueryNoConflict = jQuery.noConflict(true);

// Move these functions outside the document.ready block
function openScriptWindow(scriptUrl) {
    var event = {
        target: {
            href: scriptUrl
        }
    };
    OME.openScriptWindow(event, 800, 600);
}

function openScriptUploadWindow(uploadUrl) {
    var event = {
        target: {
            href: uploadUrl
        }
    };
    OME.openScriptWindow(event, 800, 600);
}

jQueryNoConflict(document).ready(function($) {
    // Add this line to define scriptCardContent
    var scriptCardContent = {};

    // UI Initialization: Set up the draggable and resizable widget
    /**
     * Initializes the UI components of the widget.
     */
    function initializeUI() {
        var originalSize = {
            width: $("#draggable").width(),
            height: $("#draggable").height()
        };

        $("#draggable").resizable({
            handles: "all"
        }).draggable({
            handle: ".window-header",
            containment: "window" // Restrict movement within the window
        });

        // Maximize button functionality
        $(".maximize-btn").on('click', function() {
            $("#draggable").toggleClass("maximized");
            handleWidgetResize(); // Call handleWidgetResize to adjust script card sizes
        });

        // Close button functionality
        $(".close-btn").on('click', function() {
            $("#draggable").hide();
        });

        // Check if user is admin and show the 'Upload Script' button
        if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
            $("#uploadButton").show().on('click', function(event) {
                event.preventDefault();
                openScriptUploadWindow($(this).data('url'));
            });
        }

            // Hide the script menu widget initially
            $("#draggable").hide();
        }

    // Script Menu Handling: Fetch and build the script menu
    /**
     * Fetches the script menu data from the server.
     */
    function fetchScriptMenu() {
        var url = $("#draggable").data("url"); // Get the URL from the data attribute

        // Make an AJAX GET request to fetch the script menu
        $.ajax({
            url: url,
            type: "GET",
            success: function(response) {
                // Handle the response from the server
                console.log("Script menu fetched successfully:", response);

                // Check the structure of the response
                if (Array.isArray(response)) {
                    // Generate tabs and content dynamically
                    var tabContainer = $('#tabContainer');
                    var tabContent = $('#tabContent');
                    
                    // Remove existing tab buttons, but keep the search bar
                    tabContainer.find('.tab-buttons').remove();
                    
                    // Create a new container for tab buttons and insert it before the search bar
                    var tabButtonsContainer = $('<div class="tab-buttons"></div>');
                    tabContainer.prepend(tabButtonsContainer);

                    response.forEach(function(folder, index) {
                        var folderName = folder.name;
                        
                        // Create tab button
                        var tabButton = $('<button>')
                            .addClass('tablink')
                            .text(folderName)
                            .on('click', function(event) { 
                                $("#searchBar").val('').trigger('input');
                                ScriptSearch.exitSearchMode();
                                openTab(event, folderName); 
                            });
                        tabButtonsContainer.append(tabButton);
                        
                        // Create tab content
                        var contentDiv = $('<div>')
                            .attr('id', folderName)
                            .addClass('tabcontent');
                        
                        var folderHtml = buildScriptMenuHtml(folder.ul, true);
                        contentDiv.html(folderHtml);
                        tabContent.append(contentDiv);
                    });

                    // Show the first tab by default
                    if (response.length > 0) {
                        openTab(null, response[0].name);
                    }

                    // Call these functions after all content is added
                    handleWidgetResize();
                    recalculateScroll();
                    if (typeof applyColorsToDirectories === 'function') {
                        applyColorsToDirectories();
                    }
                } else {
                    console.error("Unexpected response format:", response);
                    $("#draggable").html("<p>Error loading script menu.</p>");
                }
            },
            error: function(xhr, status, error) {
                // Handle any errors
                console.error("Error fetching script menu:", error);
                console.log("Status:", status);
                console.log("XHR:", xhr);
                console.log("Response Text:", xhr.responseText);
                $("#draggable").html("<p>Error loading script menu.</p>");
            }
        });
    }

    /**
     * Builds the HTML structure for the script menu.
     * @param {Array} scriptMenu - The script menu data.
     * @param {boolean} isMainDirectory - Indicates if it's the main directory.
     * @returns {string} The generated HTML.
     */
    function buildScriptMenuHtml(scriptMenu, isMainDirectory = false) {
        var htmlParts = [];
        var looseScripts = [];

        scriptMenu.forEach(function(item) {
            if (item.ul) {
                // Directory node
                var directoryName = item.name.replace(/_/g, ' '); // Replace underscores with spaces
                htmlParts.push('<div class="directory">');
                htmlParts.push('<div class="subdirectory-header">' + directoryName + '</div>');
                htmlParts.push('<div class="script-cards-container">' + buildScriptMenuHtml(item.ul) + '</div>');
                htmlParts.push('</div>');
            } else if (item.id) {
                // Leaf node (script)
                var scriptName = item.name.replace('.py', '').replace(/_/g, ' '); // Remove the '.py' suffix and replace underscores with spaces
                var content = scriptCardContent[item.id] || ''; // Get the content from scriptCardContent
                looseScripts.push('<div class="script-card custom-script-card" data-id="' + item.id + '" data-url="/webclient/script_ui/' + item.id + '/">' + scriptName + '<div class="script-card-content">' + content + '</div></div>');
            }
        });

        // If there are loose scripts and it's a main directory, add them to a subdirectory called ♥
        if (looseScripts.length > 0 && isMainDirectory) {
            htmlParts.push('<div class="directory">');
            htmlParts.push('<div class="subdirectory-header">&hearts;</div>'); // Using HTML entity for heart symbol
            htmlParts.push('<div class="script-cards-container">' + looseScripts.join('') + '</div>');
            htmlParts.push('</div>');
        } else {
            htmlParts.push('<div class="script-cards-container">' + looseScripts.join('') + '</div>');
        }

        // Add an extra empty directory at the end of each main directory (tab)
        if (isMainDirectory) {
            htmlParts.push('<div class="directory bottom-dir-spacer-container">');
            htmlParts.push('<div class="bottom-dir-spacer"></div>');
            htmlParts.push('</div>');
        }

        return htmlParts.join('');
    }

    // Utility Functions: Handle widget resizing and scrolling
    /**
     * Handles the resizing of the widget and its components.
     */
    function handleWidgetResize() {
        var widget = $("#draggable");
        var isSmall = widget.width() < 500 || widget.height() < 500;
        var searchBar = $("#searchBar");

        if (isSmall) {
            // Small version
            $(".subdirectory-header").hide();
            $(".script-card").addClass('small');
            searchBar.addClass('small');
            searchBar.attr('placeholder', 'Search...'); // Change placeholder for small version
            $(".script-card-content").empty();
            $(".directory").addClass('small');
            // Always ensure the upload button is visible
            $("#uploadButton").hide();
        } else {
            // Large version
            $(".subdirectory-header").show();
            $(".script-card").removeClass('small');
            searchBar.removeClass('small');
            searchBar.attr('placeholder', 'Search scripts...');
            if (typeof updateScriptCardContent === 'function') {
                updateScriptCardContent();
            }
            $(".directory").removeClass('small');
            // Always ensure the upload button is visible
            if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
                $("#uploadButton").show();
            }
        }

        recalculateScroll();
    }

    /**
     * Recalculates the scroll for tab content.
     */
    function recalculateScroll() {
        $('.tabcontent').each(function() {
            var $tabContent = $(this);
            var containerHeight = $('#draggable').height() - $('.window-header').outerHeight() - $('.tabs').outerHeight();
            
            // Set the height to be slightly larger than the container
            $tabContent.height(containerHeight + 20);
            
            // Always show the scrollbar
            $tabContent.css('overflow-y', 'scroll');
        });
    }

    /**
     * Opens a tab and displays its content.
     * @param {Event} event - The click event.
     * @param {string} tabId - The ID of the tab to open.
     */
    function openTab(event, tabId) {
        $('.tabcontent').hide();
        $('.tablink').removeClass('active');
        $('#' + tabId).show();
        if (event) {
            $(event.currentTarget).addClass('active');
        } else {
            // If no event (initial load), select the tab button by its text content
            $('.tablink').filter(function() {
                return $(this).text() === tabId;
            }).addClass('active');
        }
        recalculateScroll();
    }

    // Initial Calls
    initializeUI();
    fetchScriptMenu();

    // Consolidated resize handling
    $("#draggable").on('resize', handleWidgetResize);
    $(document).ready(handleWidgetResize);

    // Bind click event to script cards and their content
    $("#draggable").on('click', '.script-card, .script-card-content img, #searchResults .search-result', function(event) {
        event.preventDefault();
        var scriptUrl = $(this).closest('.script-card').data('url');
        openScriptWindow(scriptUrl);
    });

    // Connect search functionality with debounce
    var debounceSearch = _.debounce(ScriptSearch.search, 150);
    $("#searchBar").on('input focus', debounceSearch);

    // Function to show the widget
    window.showScriptWidget = function() {
        $("#draggable").show();
        handleWidgetResize();
    };

    // Make openTab and exitSearchMode available to other parts of the application
    window.ScriptMenu = {
        openTab: openTab,
        exitSearchMode: ScriptSearch.exitSearchMode
    };
});