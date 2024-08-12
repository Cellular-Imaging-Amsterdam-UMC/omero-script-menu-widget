// script_menu.js

var ScriptMenu = (function($) {
    var scriptCardContent = {}; // Stores the content for each script card, keyed by script ID
    var recalculateScroll; // Function to recalculate scroll positions, set externally
    var scriptIds = {}; // Stores script IDs for each directory, used for fetching detailed script data
    var pendingDirectories = 0; // Tracks the number of directories still waiting for script data
    var scriptDataFetched = false; // Flag to prevent redundant fetching of script data
    var scriptData = {}; // Stores the fetched detailed script data for each directory

    // Step 1: Fetch the initial script menu structure
    function fetchScriptMenu(url, callbacks) {
        $.ajax({
            url: url,
            type: "GET",
            success: function(response) {
                if (Array.isArray(response)) {
                    // Step 2: Generate the menu content based on the fetched structure
                    generateMenuContent(response);
                    if (callbacks.onSuccess) callbacks.onSuccess(response);
                    // Step 3: Initiate fetching of script details after a short delay
                    if (!scriptDataFetched) {
                        setTimeout(getScriptMenuData, 100);
                    }
                } else {
                    console.error("Unexpected response format:", response);
                    if (callbacks.onError) callbacks.onError("Unexpected response format");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error fetching script menu:", error);
                if (callbacks.onError) callbacks.onError(error);
            }
        });
    }

    // Step 2: Generate the menu content and create the initial structure
    function generateMenuContent(response) {
        // Clear previous script IDs
        scriptIds = {};
        
        var tabContainer = $('#scripts-menu-tabContainer');
        var tabContent = $('#scripts-menu-tabContent');
        
        tabContainer.find('.tab-buttons').remove();
        var tabButtonsContainer = $('<div class="tab-buttons"></div>');
        tabContainer.prepend(tabButtonsContainer);

        response.forEach(function(folder, index) {
            var folderName = folder.name;
            
            var tabButton = $('<button>')
                .addClass('tablink')
                .text(folderName)
                .on('click', function(event) { 
                    $("#searchBar").val('').trigger('input');
                    ScriptSearch.exitSearchMode();
                    openTab(event, folderName); 
                });
            tabButtonsContainer.append(tabButton);
            
            var contentDiv = $('<div>')
                .attr('id', folderName)
                .addClass('tabcontent');
            
            var folderHtml = buildScriptMenuHtml(folder.ul, true);
            contentDiv.html(folderHtml);
            tabContent.append(contentDiv);
        });

        if (response.length > 0) {
            openTab(null, response[0].name);
        }
    }

    // Helper function to build the HTML for the script menu
    // This function is called recursively to handle nested directories
    function buildScriptMenuHtml(scriptMenu, isMainDirectory = false, currentDirectory = '') {
        var htmlParts = [];
        var looseScripts = [];

        scriptMenu.forEach(function(item) {
            if (item.ul) {
                // Directory node
                var directoryName = item.name.replace(/_/g, ' ');
                var newDirectory = currentDirectory ? currentDirectory + '/' + directoryName : directoryName;
                htmlParts.push('<div class="directory">');
                htmlParts.push('<div class="subdirectory-header">' + directoryName + '</div>');
                htmlParts.push('<div class="script-cards-container">' + buildScriptMenuHtml(item.ul, false, newDirectory) + '</div>');
                htmlParts.push('</div>');
            } else if (item.id) {
                // Leaf node (script)
                // Record the script ID with its directory
                if (!scriptIds[currentDirectory]) {
                    scriptIds[currentDirectory] = [];
                }
                scriptIds[currentDirectory].push(item.id);
                
                var scriptName = item.name.replace('.py', '').replace(/_/g, ' ');
                var content = scriptCardContent[item.id] || '';
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
        if (recalculateScroll) recalculateScroll();
    }

    function setRecalculateScroll(func) {
        recalculateScroll = func;
    }

    // Step 3: Fetch detailed script data for each directory
    function getScriptMenuData() {
        if (Object.keys(scriptIds).length === 0) {
            console.warn("No script IDs found. Skipping getScriptMenuData.");
            return;
        }

        pendingDirectories = Object.keys(scriptIds).length;

        // For each directory, fetch the detailed script data
        Object.keys(scriptIds).forEach(function(directory) {
            $.ajax({
                url: '/scriptmenu/get_script_menu/',
                type: 'GET',
                data: { 
                    script_ids: scriptIds[directory].join(','),
                    directory: directory
                },
                success: function(response) {
                    if (response.script_menu) {
                        scriptData[directory] = response.script_menu;
                        // Step 4: Update script cards with fetched data
                        updateScriptCards(response.script_menu, directory);
                    } else {
                        console.warn('No script_menu data in response for ' + directory);
                    }
                    if (response.error_logs && response.error_logs.length > 0) {
                        console.warn('Errors fetching script data for ' + directory + ':');
                        response.error_logs.forEach(function(error) {
                            console.warn(error);
                        });
                    }
                    pendingDirectories--;
                    if (pendingDirectories === 0) {
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching script menu data for ' + directory + ':', error);
                    pendingDirectories--;
                    if (pendingDirectories === 0) {
                    }
                }
            });
        });
    }

    // Step 4: Update script cards with fetched detailed data
    function updateScriptCards(scriptData, directory) {
        scriptData.forEach(function(script) {
            var $card = $('.script-card[data-id="' + script.id + '"]');
            if ($card.length) {
                var content = (script.description || 'No description could be obtained') + '<br>' +
                              '<strong>Authors:</strong> ' + (script.authors || 'Unknown') + '<br>' +
                              '<strong>Version:</strong> ' + (script.version || 'Unknown');
                $card.data('content', content);
                if (!$card.hasClass('small')) {
                    $card.find('.script-card-content').html(content);
                }
                $card.addClass('loaded');
            } else {
                console.warn('Card not found for script ID:', script.id, 'in directory:', directory);
            }
        });
    }

    // Step 5: Update all script card contents (called when widget is enlarged)
    function updateScriptCardContent() {
        $('.script-card').each(function() {
            var $card = $(this);
            var content = $card.data('content');
            if (content) {
                $card.find('.script-card-content').html(content);
            }
        });
    }

    return {
        fetchScriptMenu: fetchScriptMenu,
        openTab: openTab,
        setRecalculateScroll: setRecalculateScroll,
        getScriptMenuData: getScriptMenuData,
        updateScriptCardContent: updateScriptCardContent
    };
})(jQuery);