// server_side_browser.js

$(document).ready(function() {
    const columnsDiv = $('#columns');
    const selectedItems = new Set();
    const selectedItemsInfo = {}; // Store additional info for selected files
    let clickTimer = null;

    // Function to get CSRF token from cookies
    function getCSRFToken() {
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach(function(cookie) {
                const cookieTrimmed = cookie.trim();
                if (cookieTrimmed.startsWith('csrftoken=')) {
                    csrfToken = decodeURIComponent(cookieTrimmed.substring('csrftoken='.length));
                }
            });
        }
        return csrfToken;
    }

    // CSRF token for POST requests
    const csrftoken = getCSRFToken();

    // Load the base directory on page load
    loadDirectory('', 0);

    // Event handler for removing items from the selected list
    $(document).on('click', '.remove-item', function(e) {
        e.stopPropagation();
        const filePath = $(this).siblings('.file-info').find('.file-path').text();
        selectedItems.delete(filePath);
        delete selectedItemsInfo[filePath];
        // Remove selected class from file browser
        $(`.file-name[data-path="${filePath}"]`).parent().removeClass('selected');
        updateSelectedItemsList();
    });

    // Load directory contents
    function loadDirectory(path, level = 0) {
        console.log('=== loadDirectory called ===');
        console.log('Path:', path);
        console.log('Level:', level);

        // Use the correct URL pattern from urls.py
        $.getJSON('/databasepages/api/list_dir/', { path: path })
            .done(function(data) {
                console.log('API Response:', data);

                // Remove all columns after the current level
                columnsDiv.children().slice(level).remove();

                // Create a new column
                const column = $('<div>').addClass('column');
                const list = $('<ul>');

                // Add directories first
                data.dirs.forEach(function(dir) {
                    const item = $('<li>')
                        .append($('<span>')
                            .addClass('directory-name')
                            .html('<i class="bi bi-folder"></i> ' + dir.name)
                            .data('path', dir.path)
                            .data('level', level));
                    list.append(item);
                });

                // Add files
                data.files.forEach(function(file) {
                    const item = $('<li>')
                        .append($('<span>')
                            .addClass('file-name')
                            .html('<i class="bi bi-file-earmark"></i> ' + file.name)
                            .data('path', file.path));

                    // Add selected class to li if selected
                    if (selectedItems.has(file.path)) {
                        item.addClass('selected');
                    }

                    list.append(item);
                });

                column.append(list);
                columnsDiv.append(column);

                // Bind click events
                bindClickEvents(column, level);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('L-Drive Access Error:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText
                });
            });
    }

    // Handle single directory click
    function handleDirectoryClick(item, path, level) {
        // Remove 'active-directory' from all li elements at the same level
        item.closest('.column').find('li').removeClass('active-directory');
        // Add active-directory to the parent li element
        item.closest('li').addClass('active-directory');

        // Load the directory contents
        loadDirectory(path, level + 1);
    }

    // Handle double-click on directory
    function handleDirectoryDoubleClick(item, path, level) {
        // Handle as single click first
        handleDirectoryClick(item, path, level);

        // Then, select all immediate files in the directory
        $.getJSON('/databasepages/api/list_dir/', { path: path })
            .done(function(data) {
                if (data.error) {
                    console.error('Error loading directory:', data.error);
                    alert(data.error);
                    return;
                }

                // Select all files in the directory (non-recursive)
                data.files.forEach(function(file) {
                    const filePath = file.path;
                    selectedItems.add(filePath);
                    // Fetch file details
                    fetchFileInfo(filePath);
                });

                // Update the UI to reflect selected files
                const lastColumn = columnsDiv.children().last();
                lastColumn.find('.file-name').each(function() {
                    const filePath = $(this).data('path');
                    if (selectedItems.has(filePath)) {
                        $(this).parent().addClass('selected');
                    }
                });

                updateSelectedItemsList();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to load directory:', errorThrown);
                alert('Failed to load directory contents: ' + errorThrown);
            });
    }

    // Fetch file information from the server
    function fetchFileInfo(filePath) {
        $.getJSON('/databasepages/api/file_info/', { path: filePath })
            .done(function(data) {
                if (data.error) {
                    console.error('Error fetching file info:', data.error);
                    return;
                }
                selectedItemsInfo[filePath] = data;
                updateSelectedItemsList();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch file info:', errorThrown);
                selectedItemsInfo[filePath] = { size: 'Unknown', modified: 'Unknown' };
                updateSelectedItemsList();
            });
    }

    // Update the selected items list
    function updateSelectedItemsList() {
        const selectedItemsSection = $('#selected-items-section');
        selectedItemsSection.empty();

        if (selectedItems.size === 0) {
            selectedItemsSection.append('<p>No files selected.</p>');
            return;
        }

        const list = $('<ul>');

        selectedItems.forEach(function(filePath) {
            const fileInfo = selectedItemsInfo[filePath] || {};
            const listItem = $('<li>');
            const fileInfoDiv = $('<div>').addClass('file-info');

            // File Path and Details in same line
            fileInfoDiv.append($('<span>').addClass('file-path').text(filePath));
            fileInfoDiv.append($('<span>').addClass('file-details')
                .text(`${fileInfo.size || 'Unknown'} | ${fileInfo.modified || 'Unknown'}`));

            // Remove Icon
            const removeIcon = $('<i>').addClass('bi bi-x-circle-fill remove-item');

            listItem.append(fileInfoDiv);
            listItem.append(removeIcon);
            list.append(listItem);
        });

        selectedItemsSection.append(list);
    }

    // Import selected items
    $('#import-button').click(function() {
        if (selectedItems.size === 0) {
            alert('No items selected.');
            return;
        }

        $.ajax({
            url: '/webclient/databasepages/api/import_selected/',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: JSON.stringify({ selected: Array.from(selectedItems) }),
            success: function(response) {
                alert('Selected items have been imported.');
                // Clear selections
                selectedItems.clear();
                for (let key in selectedItemsInfo) delete selectedItemsInfo[key];
                $('.selected').removeClass('selected');
                updateSelectedItemsList();
            },
            error: function(xhr, status, error) {
                console.error('Import error:', error);
                alert('An error occurred during import: ' + error);
            }
        });
    });

    // Clear selected items
    $('#clear-button').click(function() {
        // Clear selections
        selectedItems.clear();
        for (let key in selectedItemsInfo) delete selectedItemsInfo[key];
        $('.selected').removeClass('selected');
        updateSelectedItemsList();
    });

    // Make the separator movable
    let isResizing = false;
    let lastDownY = 0;

    $('#separator').on('mousedown', function(e) {
        isResizing = true;
        lastDownY = e.clientY;
        e.preventDefault();
    });

    $(document).on('mousemove', function(e) {
        if (!isResizing) return;

        const headerHeight = $('.browser-header').outerHeight() || 0; // Account for header height
        const mainContainerOffset = $('#main-container').offset().top;

        // Calculate the new positions
        const deltaY = e.clientY - lastDownY;
        lastDownY = e.clientY;

        let fileBrowserHeight = $('#file-browser-section').height() + deltaY;
        let selectedItemsHeight = $('#selected-items-section').height() - deltaY;

        // Set minimum and maximum heights
        const minHeight = 100; // Minimum height for each section
        const totalHeight = $('#main-container').height() - $('#separator').outerHeight();

        if (fileBrowserHeight < minHeight) {
            fileBrowserHeight = minHeight;
            selectedItemsHeight = totalHeight - minHeight;
        } else if (selectedItemsHeight < minHeight) {
            selectedItemsHeight = minHeight;
            fileBrowserHeight = totalHeight - minHeight;
        }

        $('#file-browser-section').css('height', fileBrowserHeight + 'px');
        $('#selected-items-section').css('height', selectedItemsHeight + 'px');

        e.preventDefault();
    });

    $(document).on('mouseup', function(e) {
        if (isResizing) {
            isResizing = false;
        }
    });

    // Bind click events to directory and file items
    function bindClickEvents(column, level) {
        column.find('li').on('click', function(e) {
            const item = $(this).find('.directory-name, .file-name');
            if (item.length === 0) return;

            const path = item.data('path');

            if (item.hasClass('directory-name')) {
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                    handleDirectoryDoubleClick(item, path, level);
                } else {
                    clickTimer = setTimeout(function() {
                        handleDirectoryClick(item, path, level);
                        clickTimer = null;
                    }, 300);
                }
            } else if (item.hasClass('file-name')) {
                const li = item.parent();
                if (li.hasClass('selected')) {
                    li.removeClass('selected');
                    selectedItems.delete(path);
                    delete selectedItemsInfo[path];
                } else {
                    li.addClass('selected');
                    selectedItems.add(path);
                    fetchFileInfo(path);
                }
                updateSelectedItemsList();
            }
        });
    }
});
