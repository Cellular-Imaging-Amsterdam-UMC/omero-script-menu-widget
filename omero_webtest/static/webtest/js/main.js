var jQueryNoConflict = jQuery.noConflict(true);

jQueryNoConflict(document).ready(function($) {
    $("#draggable").draggable().resizable();

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
                    var omeroHtml = buildScriptMenuHtml(response.filter(folder => folder.name === "omero"));
                    var biomeroHtml = buildScriptMenuHtml(response.filter(folder => folder.name === "biomero"));

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
            if (item.id) {
                // Leaf node (script)
                html += '<div class="script-card"><a href="/webclient/script_ui/' + item.id + '/" class="script-link">' + item.name + '</a></div>';
            } else {
                // Directory node
                html += '<div class="subdirectory-header">' + item.name + '</div>';
                html += '<div class="script-cards-container">' + buildScriptMenuHtml(item.ul) + '</div>';
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
});
