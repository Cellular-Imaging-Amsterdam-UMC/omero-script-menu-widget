var jQueryNoConflict = jQuery.noConflict(true);

jQueryNoConflict(document).ready(function($) {
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

    // Function to fetch and render the script menu
    function fetchScriptMenu() {
        var url = $("#draggable").data("url"); // Get the URL from the data attribute

        console.log("Fetching script menu from URL:", url);

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

    // Function to build the script menu HTML
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
                var scriptName = item.name.replace('.py', ''); // Remove the '.py' suffix
                html += '<div class="script-card"><a href="/webclient/script_ui/' + item.id + '/" class="script-link" data-id="' + item.id + '">' + scriptName + '</a></div>';
            }
        });
        return html;
    }

    // Function to open a tab
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

    // Function to search scripts
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

    // Fetch and render the script menu on page load
    fetchScriptMenu();

    // Bind click event to script links to use OME.openScriptWindow
    $("#draggable").on('click', 'a.script-link', function(event) {
        event.stopPropagation(); // Prevent the event from bubbling up
        event.preventDefault(); // Prevent the default link behavior
        OME.openScriptWindow(event); // Call the function to open the script window
    });

    // Function to handle special behaviors based on widget size
    function handleWidgetResize() {
        var widget = $("#draggable");
        if (widget.width() < 500 || widget.height() < 500) {
            $(".subdirectory-header").hide(); // Hide subdirectory headers
            $(".script-card").css({
                height: 'auto', // Adjust height to fit content
                padding: '10px' // Reduce padding
            });
            $("#searchBar").css({
                width: '100px' // Narrower width for smaller widget
            });
        } else {
            $(".subdirectory-header").show(); // Show subdirectory headers
            $(".script-card").css({
                height: '150px', // Restore original height
                padding: '20px' // Restore original padding
            });
            $("#searchBar").css({
                width: '' // Reset to default width
            });
        }
    }

    // Bind the resize event to handleWidgetResize function
    $("#draggable").on('resize', handleWidgetResize);

    // Initial call to handleWidgetResize to set the correct state on load
    $(window).on('load', function() {
        handleWidgetResize();
    });
});
