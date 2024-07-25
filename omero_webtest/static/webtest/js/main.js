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

        // Minimize button functionality
        $(".minimize-btn").on('click', function() {
            $("#draggable").addClass("minimized").draggable("option", "handle", ".restore-btn");
            $("#draggable").resizable("option", "disabled", true);
            $("#draggable .window-header, #draggable .tabs, #draggable .tabcontent").hide(); // Hide all contents
            $("#draggable").css({
                width: '30px',
                height: '30px'
            });
            if ($(".restore-btn").length === 0) {
                $("#draggable").append('<div class="restore-btn">+</div>');
            }
        });

        // Restore button functionality
        $("#draggable").on('click', '.restore-btn', function() {
            $("#draggable").removeClass("minimized").draggable("option", "handle", ".window-header");
            $("#draggable").resizable("option", "disabled", false);
            $("#draggable .window-header, #draggable .tabs, #draggable .tabcontent").show(); // Show all contents
            $("#draggable").css({
                width: originalSize.width,
                height: originalSize.height
            });
            $(".restore-btn").remove();
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
                    var omeroHtml = buildScriptMenuHtml(response.find(folder => folder.name === "omero").ul);
                    var biomeroHtml = buildScriptMenuHtml(response.find(folder => folder.name === "biomero").ul);

                    $("#omero").html(omeroHtml);
                    $("#biomero").html(biomeroHtml);

                    // Show the default tab (omero)
                    openTab(null, 'omero');

                    // Call handleWidgetResize to adjust script card sizes based on widget size
                    handleWidgetResize();
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

    function buildScriptMenuHtml(scriptMenu) {
        var html = '';
        scriptMenu.forEach(function(item) {
            if (item.ul) {
                // Directory node
                html += '<div class="directory">';
                html += '<div class="subdirectory-header">' + item.name + '</div>';
                html += '<div class="script-cards-container">' + buildScriptMenuHtml(item.ul) + '</div>';
                html += '</div>';
            } else if (item.id) {
                // Leaf node (script)
                var scriptName = item.name.replace('.py', '').replace(/_/g, ' '); // Remove the '.py' suffix and replace underscores with spaces
                html += '<a href="/webclient/script_ui/' + item.id + '/" class="script-card custom-script-card" data-id="' + item.id + '">' + scriptName + '</a>';
            }
        });
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
    $("#draggable").on('click', '.script-card', OME.openScriptWindow);
});