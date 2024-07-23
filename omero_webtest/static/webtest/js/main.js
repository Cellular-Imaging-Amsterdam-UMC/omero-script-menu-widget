var jQueryNoConflict = jQuery.noConflict(true);

jQueryNoConflict(document).ready(function($) {
    $("#draggable").draggable().resizable();

    // Function to fetch and render the script menu
    function fetchScriptMenu() {
        var url = $("#draggable").data("url"); // Get the URL from the data attribute
        console.log("Fetching script menu from URL:", url); // Log the URL

        // Make an AJAX GET request to fetch the script menu
        $.ajax({
            url: url,
            type: "GET",
            success: function(response) {
                // Handle the response from the server
                console.log("Script menu fetched successfully:", response);

                // Check the structure of the response
                if (Array.isArray(response)) {
                    var scriptMenuHtml = buildScriptMenuHtml(response);
                    $("#draggable").html(scriptMenuHtml);

                    // Bind click event to script links to use OME.openScriptWindow
                    $("#draggable").on('click', 'a', function(event) {
                        var $a = $(event.target),
                            script_url = $a.attr('href');
                        if (script_url != "#") {
                            // Clicked on script - handled by OME.openScriptWindow
                            event.preventDefault();
                            OME.openScriptWindow(event);
                            return false;
                        }

                        // we have clicked on <a> within a <li>, with sibling <ul>
                        var $li = $a.parent(),
                            $ul = $li.children('ul');
                        if ($li.hasClass('menu_back')) {
                            $li.parent().parent().siblings().show();
                            $li.parent().hide();
                            $li.parent().siblings('a').show();
                        } else {
                            $ul.show();
                            $li.siblings().hide();
                            $a.hide();
                        }
                    });
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
        var html = '<div class="script-menu"><ul>';
        scriptMenu.forEach(function(folder) {
            html += '<li><a href="#" title="' + folder.name + '">' + folder.name + '</a>';
            if (Array.isArray(folder.ul)) {
                html += '<ul>';
                folder.ul.forEach(function(item) {
                    if (item.id) {
                        html += '<li><a href="/webclient/script_ui/' + item.id + '/">' + item.name + '...</a></li>';
                    } else {
                        html += '<li class="menuItem"><a href="#">' + item.name + '</a>';
                        if (Array.isArray(item.ul) && item.ul.length > 0) {
                            html += '<ul>' + buildScriptMenuHtml(item.ul) + '</ul>';
                        }
                        html += '</li>';
                    }
                });
                html += '</ul>';
            }
            html += '</li>';
        });
        html += '</ul></div>';
        return html;
    }

    // Fetch and render the script menu on page load
    fetchScriptMenu();
});