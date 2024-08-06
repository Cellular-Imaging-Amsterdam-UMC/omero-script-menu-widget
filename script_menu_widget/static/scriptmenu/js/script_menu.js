// script_menu.js

var ScriptMenu = (function($) {
    var scriptCardContent = {};
    var recalculateScroll;
    var scriptIds = [];

    function fetchScriptMenu(url, callbacks) {
        $.ajax({
            url: url,
            type: "GET",
            success: function(response) {
                console.log("Script menu fetched successfully:", response);
                if (Array.isArray(response)) {
                    generateMenuContent(response);
                    if (callbacks.onSuccess) callbacks.onSuccess(response);
                    // Call getScriptMenuData after a short delay to ensure scriptIds are populated
                    setTimeout(getScriptMenuData, 100);
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

    function generateMenuContent(response) {
        // Clear previous script IDs
        scriptIds = [];
        
        var tabContainer = $('#tabContainer');
        var tabContent = $('#tabContent');
        
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

    function buildScriptMenuHtml(scriptMenu, isMainDirectory = false) {
        var htmlParts = [];
        var looseScripts = [];

        scriptMenu.forEach(function(item) {
            if (item.ul) {
                // Directory node
                var directoryName = item.name.replace(/_/g, ' ');
                htmlParts.push('<div class="directory">');
                htmlParts.push('<div class="subdirectory-header">' + directoryName + '</div>');
                htmlParts.push('<div class="script-cards-container">' + buildScriptMenuHtml(item.ul) + '</div>');
                htmlParts.push('</div>');
            } else if (item.id) {
                // Leaf node (script)
                // Record the script ID
                scriptIds.push(item.id);
                
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

    function getScriptMenuData() {
        if (scriptIds.length === 0) {
            console.warn("No script IDs found. Skipping getScriptMenuData.");
            return;
        }

        $.ajax({
            url: '/scriptmenu/get_script_menu/',
            type: 'GET',
            data: { script_ids: scriptIds.join(',') },
            success: function(response) {
                console.log('Script menu data:', response);
                if (response.script_menu) {
                    updateScriptCards(response.script_menu);
                }
                if (response.error_logs && response.error_logs.length > 0) {
                    console.warn('Errors fetching script data:');
                    response.error_logs.forEach(function(error) {
                        console.warn(error);
                        // You might want to update the UI to show these errors
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching script menu data:', error);
            }
        });
    }

    function updateScriptCards(scriptData) {
        scriptData.forEach(function(script) {
            var $card = $('.script-card[data-id="' + script.id + '"]');
            if ($card.length) {
                var content = (script.description || 'No description could be obtained') + '<br>' +
                              '<strong>Authors:</strong> ' + (script.authors || 'Unknown') + '<br>' +
                              '<strong>Version:</strong> ' + (script.version || 'Unknown');
                $card.find('.script-card-content').html(content);
            } else {
                console.warn('Card not found for script ID:', script.id);
            }
        });
    }

    return {
        fetchScriptMenu: fetchScriptMenu,
        openTab: openTab,
        setRecalculateScroll: setRecalculateScroll,
        getScriptMenuData: getScriptMenuData
    };
})(jQuery);