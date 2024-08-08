// main.js

var jQueryNoConflict = jQuery.noConflict(true);

(function($) {
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

    function initializeUI() {
        $("#draggable").resizable({
            handles: "all",
            resize: handleWidgetResize
        }).draggable({
            handle: ".window-header",
            containment: "window"
        });

        $(".maximize-btn").on('click', function() {
            $("#draggable").toggleClass("maximized");
            handleWidgetResize();
        });

        $(".close-btn").on('click', function() {
            $("#draggable").hide();
        });

        if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
            $("#uploadButton").show().on('click', function(event) {
                event.preventDefault();
                openScriptUploadWindow($(this).data('url'));
            });
        }

        $("#draggable").hide();
    }

    function handleWidgetResize() {
        var widget = $("#draggable");
        var isSmall = widget.width() < 500 || widget.height() < 500;
        var searchBar = $("#searchBar");

        if (isSmall) {
            $(".subdirectory-header").hide();
            $(".script-card").addClass('small');
            searchBar.addClass('small').attr('placeholder', 'Search...');
            $(".script-card-content").empty();
            $(".directory").addClass('small');
            $("#uploadButton").hide();
        } else {
            $(".subdirectory-header").show();
            $(".script-card").removeClass('small');
            searchBar.removeClass('small').attr('placeholder', 'Search scripts...');
            ScriptMenu.updateScriptCardContent();
            $(".directory").removeClass('small');
            if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
                $("#uploadButton").show();
            }
        }

        recalculateScroll();
    }

    function recalculateScroll() {
        $('.tabcontent').each(function() {
            var $tabContent = $(this);
            var containerHeight = $('#draggable').height() - $('.window-header').outerHeight() - $('.tabs').outerHeight();
            $tabContent.height(containerHeight + 20).css('overflow-y', 'scroll');
        });
    }

    // Pass recalculateScroll to ScriptMenu instead of adding to window
    ScriptMenu.setRecalculateScroll(recalculateScroll);

    $(document).ready(function() {
        initializeUI();

        ScriptMenu.fetchScriptMenu($("#draggable").data("url"), {
            onSuccess: function(response) {
                // Delay the resize and scroll recalculation to ensure the DOM is updated
                setTimeout(function() {
                    handleWidgetResize();
                    recalculateScroll();
                    if (typeof applyColorsToDirectories === 'function') {
                        applyColorsToDirectories();
                    }
                }, 0);
            },
            onError: function(error) {
                $("#draggable").html("<p>Error loading script menu.</p>");
                console.error("Error fetching script menu:", error);
            }
        });

        $(window).on('resize', handleWidgetResize);

        $("#draggable").on('click', '.script-card, .script-card-content img, #searchResults .search-result', function(event) {
            event.preventDefault();
            var scriptUrl = $(this).closest('.script-card').data('url');
            openScriptWindow(scriptUrl);
        });

        var debounceSearch = _.debounce(ScriptSearch.search, 150);
        $("#searchBar").on('input focus', debounceSearch);

        // Expose showScriptWidget function
        window.showScriptWidget = function() {
            $("#draggable").show();
            handleWidgetResize();
            ScriptMenu.getScriptMenuData();
        };
    });
})(jQueryNoConflict);