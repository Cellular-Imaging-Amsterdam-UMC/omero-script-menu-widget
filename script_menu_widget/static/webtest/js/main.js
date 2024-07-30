// main.js

var jQueryNoConflict = jQuery.noConflict(true);

jQueryNoConflict(document).ready(function($) {
    // Section 1: UI Initialization and Event Bindings
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

    // Section 2: Script Menu Handling
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
                    var omeroHtml = buildScriptMenuHtml(response.find(folder => folder.name === "omero").ul, true);
                    var biomeroHtml = buildScriptMenuHtml(response.find(folder => folder.name === "biomero").ul, true);

                    $("#omero").html(omeroHtml);
                    $("#biomero").html(biomeroHtml);

                    // Show the default tab (omero)
                    openTab(null, 'omero');

                    // Call handleWidgetResize to adjust script card sizes based on widget size
                    handleWidgetResize();

                    // Apply colors to directories and their script-cards
                    applyColorsToDirectories(); // Call the function from color_me.js
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

    // Section 3: Utility Functions
    function handleWidgetResize() {
        var widget = $("#draggable");
        if (widget.width() < 500 || widget.height() < 500) {
            $(".subdirectory-header").hide(); // Hide subdirectory headers
            $(".script-card").css({
                height: 'auto', // Adjust height to fit content
                padding: '10px', // Reduce padding
                'max-height': '100px' // Set smaller height
            });
            $("#searchBar").css({
                width: '100px' // Narrower width for smaller widget
            });
            // Clear script card content
            $(".script-card-content").empty();
        } else {
            $(".subdirectory-header").show(); // Show subdirectory headers
            $(".script-card").css({
                height: '150px', // Restore original height
                padding: '20px', // Restore original padding
                'max-height': '' // Remove max-height restriction
            });
            $("#searchBar").css({
                width: '' // Reset to default width
            });
            updateScriptCardContent(); // Update script card content when in large state
        }
    }

    window.openTab = function(event, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        if (event) {
            event.currentTarget.className += " active";
        } else {
            document.querySelector(".tablink[onclick=\"openTab(event, '" + tabName + "')\"]").classList.add("active");
        }
    }

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

    // Bind click event to script cards to use OME.openScriptWindow
    $("#draggable").on('click', '.script-card', function(event) {
        event.preventDefault();
        var scriptUrl = $(this).data('url');
        var mockEvent = {
            target: {
                href: scriptUrl
            }
        };
        OME.openScriptWindow(mockEvent, 800, 600);
    });

    // Bind click event to images within script cards
    $("#draggable").on('click', '.script-card-content img', function(event) {
        var scriptCard = $(this).closest('.script-card');
        var scriptUrl = scriptCard.data('url');
        var mockEvent = {
            target: {
                href: scriptUrl
            }
        };
        OME.openScriptWindow(mockEvent, 800, 600);
    });
});