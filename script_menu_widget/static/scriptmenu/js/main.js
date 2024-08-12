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
        $("#scripts-menu-draggable").resizable({
            handles: "all",
            resize: handleWidgetResize
        }).draggable({
            handle: ".scripts-menu-window-header",
            containment: "window"
        });

        $(".scripts-menu-maximize-btn").on('click', function() {
            $("#scripts-menu-draggable").toggleClass("maximized");
            handleWidgetResize();
        });

        $(".scripts-menu-close-btn").on('click', function() {
            $("#scripts-menu-draggable").hide();
        });

        if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
            $("#scripts-menu-uploadButton").show().on('click', function(event) {
                event.preventDefault();
                openScriptUploadWindow($(this).data('url'));
            });
        }

        $("#scripts-menu-draggable").hide();
    }

    function handleWidgetResize() {
        var widget = $("#scripts-menu-draggable");
        var isSmall = widget.width() < 500 || widget.height() < 500;
        var searchBar = $("#scripts-menu-searchBar");

        if (isSmall) {
            $(".subdirectory-header").hide();
            $(".script-card").addClass('small');
            searchBar.addClass('small').attr('placeholder', 'Search...');
            $(".script-card-content").empty();
            $(".directory").addClass('small');
            $("#scripts-menu-uploadButton").hide();
        } else {
            $(".subdirectory-header").show();
            $(".script-card").removeClass('small');
            searchBar.removeClass('small').attr('placeholder', 'Search scripts...');
            ScriptMenu.updateScriptCardContent();
            $(".directory").removeClass('small');
            if (WEBCLIENT.current_admin_privileges.indexOf("WriteScriptRepo") > -1) {
                $("#scripts-menu-uploadButton").show();
            }
        }

        recalculateScroll();
    }

    function recalculateScroll() {
        $('.tabcontent').each(function() {
            var $tabContent = $(this);
            var containerHeight = $('#scripts-menu-draggable').height() - $('.scripts-menu-window-header').outerHeight() - $('.scripts-menu-tabs').outerHeight();
            $tabContent.height(containerHeight + 20).css('overflow-y', 'scroll');
        });
    }

    // Pass recalculateScroll to ScriptMenu instead of adding to window
    ScriptMenu.setRecalculateScroll(recalculateScroll);

    $(document).ready(function() {
        initializeUI();

        ScriptMenu.fetchScriptMenu($("#scripts-menu-draggable").data("url"), {
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
                $("#scripts-menu-draggable").html("<p>Error loading script menu.</p>");
                console.error("Error fetching script menu:", error);
            }
        });

        $(window).on('resize', handleWidgetResize);

        $("#scripts-menu-draggable").on('click', '.script-card, .script-card-content img, #scripts-menu-searchResults .search-result', function(event) {
            event.preventDefault();
            var scriptUrl = $(this).closest('.script-card').data('url');
            openScriptWindow(scriptUrl);
        });

        var debounceSearch = _.debounce(ScriptSearch.search, 150);
        $("#scripts-menu-searchBar").on('input focus', debounceSearch);

        // Expose showScriptWidget function
        window.showScriptWidget = function() {
            $("#scripts-menu-draggable").show();
            handleWidgetResize();
            ScriptMenu.getScriptMenuData();
        };
    });
})(jQueryNoConflict);