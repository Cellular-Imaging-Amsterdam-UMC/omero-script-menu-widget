// main.js

var jQueryNoConflict = jQuery.noConflict(true);

jQueryNoConflict(document).ready(function($) {
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
                            .on('click', function(event) { openTab(event, folderName); });
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
                    openTab(null, response[0].name);

                    // Call these functions after all content is added
                    handleWidgetResize();
                    recalculateScroll();
                    applyColorsToDirectories();
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
        var html = '';
        var looseScripts = [];

        scriptMenu.forEach(function(item) {
            if (item.ul) {
                // Directory node
                var directoryName = item.name.replace(/_/g, ' '); // Replace underscores with spaces
                html += '<div class="directory">';
                html += '<div class="subdirectory-header">' + directoryName + '</div>';
                html += '<div class="script-cards-container">' + buildScriptMenuHtml(item.ul) + '</div>';
                html += '</div>';
            } else if (item.id) {
                // Leaf node (script)
                var scriptName = item.name.replace('.py', '').replace(/_/g, ' '); // Remove the '.py' suffix and replace underscores with spaces
                var content = scriptCardContent[item.id] || ''; // Get the content from scriptCardContent
                looseScripts.push('<div class="script-card custom-script-card" data-id="' + item.id + '" data-url="/webclient/script_ui/' + item.id + '/">' + scriptName + '<div class="script-card-content">' + content + '</div></div>');
            }
        });

        // If there are loose scripts and it's a main directory, add them to a subdirectory called ♥
        if (looseScripts.length > 0 && isMainDirectory) {
            html += '<div class="directory">';
            html += '<div class="subdirectory-header">&hearts;</div>'; // Using HTML entity for heart symbol
            html += '<div class="script-cards-container">' + looseScripts.join('') + '</div>';
            html += '</div>';
        } else {
            html += looseScripts.join('');
        }

        return html;
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
            $("#uploadButton").hide(); // Hide the button in small version
        } else {
            // Large version
            $(".subdirectory-header").show();
            $(".script-card").removeClass('small');
            searchBar.removeClass('small');
            searchBar.attr('placeholder', 'Search scripts...'); // Change placeholder for large version
            updateScriptCardContent();
            $(".directory").removeClass('small');
            $("#uploadButton").show(); // Show the button in large version
        }

        recalculateScroll();
    }

    /**
     * Recalculates the scroll for tab content.
     */
    function recalculateScroll() {
        $('.tabcontent').each(function() {
            var $tabContent = $(this);
            $tabContent.css('height', ''); // Reset height
            var contentHeight = $tabContent[0].scrollHeight;
            var containerHeight = $('#draggable').height() - $('.window-header').outerHeight() - $('.tabs').outerHeight();
            $tabContent.height(containerHeight);
            
            if (contentHeight > containerHeight) {
                $tabContent.css('overflow-y', 'scroll');
            } else {
                $tabContent.css('overflow-y', 'auto');
            }
        });
    }

    /**
     * Opens a tab and displays its content.
     * @param {Event} event - The click event.
     * @param {string} tabId - The ID of the tab to open.
     */
    window.openTab = function(event, tabId) {
        $('.tabcontent').hide();
        $('.tablink').removeClass('active');
        $('#' + tabId).show();
        if (event) {
            $(event.currentTarget).addClass('active');
        } else {
            $('.tablink').first().addClass('active');
        }
        recalculateScroll();
    }

    /**
     * Searches for scripts based on user input.
     */
    window.searchScripts = function() {
        var input, filter, scriptCards, i;
        input = document.getElementById("searchBar");
        filter = input.value.toLowerCase();
        scriptCards = document.getElementsByClassName("script-card");
        for (i = 0; i < scriptCards.length; i++) {
            if (scriptCards[i].innerHTML.toLowerCase().indexOf(filter) > -1) {
                scriptCards[i].style.display = "";
            } else {
                scriptCards[i].style.display = "none";
            }
        }
    }

    /**
     * Opens a script window.
     * @param {string} scriptUrl - The URL of the script to open.
     */
    function openScriptWindow(scriptUrl) {
        var event = {
            target: {
                href: scriptUrl
            }
        };
        OME.openScriptWindow(event, 800, 600);
    }

    // Initial Calls
    initializeUI();
    fetchScriptMenu();

    // Bind the resize event to handleWidgetResize function
    $("#draggable").on('resize', handleWidgetResize);

    // Initial call to handleWidgetResize to set the correct state on load
    $(window).on('load', function() {
        handleWidgetResize();
    });

    // Call handleWidgetResize on initial load to set the correct size
    handleWidgetResize();

    // Bind click event to script cards and their content
    $("#draggable").on('click', '.script-card, .script-card-content img', function(event) {
        event.preventDefault();
        var scriptUrl = $(this).closest('.script-card').data('url');
        openScriptWindow(scriptUrl);
    });
});