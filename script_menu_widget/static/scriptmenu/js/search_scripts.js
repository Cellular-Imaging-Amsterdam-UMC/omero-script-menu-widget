// search_scripts.js

var ScriptSearch = (function() {
    function searchScripts() {
        var filter = $("#scripts-menu-searchBar").val().toLowerCase();
        
        if (filter === "") {
            exitSearchMode();
            return;
        }

        enterSearchMode();

        var results = [];
        $(".tabcontent").each(function() {
            var tabId = $(this).attr('id');
            $(this).find(".script-card").each(function() {
                if ($(this).text().toLowerCase().indexOf(filter) > -1) {
                    results.push({
                        tabId: tabId,
                        element: $(this).clone()
                    });
                }
            });
        });

        displaySearchResults(results);
    }

    function enterSearchMode() {
        $('.scripts-menu-tabs button').removeClass('active');
        $('#scripts-menu-tabContent').hide();
        $('#scripts-menu-searchResults').show();
    }

    function exitSearchMode() {
        $('#scripts-menu-searchResults').hide();
        $('#scripts-menu-tabContent').show();
        if ($('.scripts-menu-tabs button.active').length === 0) {
            $('.scripts-menu-tabs button:first').addClass('active').click();
        }
    }

    function displaySearchResults(results) {
        var $searchResults = $('#scripts-menu-searchResults');
        $searchResults.empty();

        if (results.length === 0) {
            $searchResults.append('<p>No results found.</p>');
            return;
        }

        results.forEach(function(result) {
            var $resultItem = $('<div class="search-result"></div>');
            $resultItem.append(result.element);
            $resultItem.prepend('<div class="search-result-tab">From: ' + result.tabId + '</div>');
            $searchResults.append($resultItem);
        });
    }

    return {
        searchScripts: searchScripts,
        exitSearchMode: exitSearchMode
    };
})();