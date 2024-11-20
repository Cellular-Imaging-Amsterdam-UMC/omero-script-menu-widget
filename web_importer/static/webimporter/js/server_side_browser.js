$(document).ready(function() {
    const columnsDiv = $('#columns');
    const selectedItems = new Set();
    const selectedItemsInfo = {};
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

    const csrftoken = getCSRFToken();

    // Load the base directory on page load
    loadDirectory('', 0);

    // Event handler for removing items from the selected list
    $(document).on('click', '.remove-item', function(e) {
        e.stopPropagation();
        const filePath = $(this).siblings('.file-info').find('.file-path').text();
        selectedItems.delete(filePath);
        delete selectedItemsInfo[filePath];
        $(`.file-name[data-path="${filePath}"]`).parent().removeClass('selected');
        updateSelectedItemsList();
    });

    // Load directory contents
    function loadDirectory(path, level = 0) {
        $.getJSON('/databasepages/api/list_dir/', { path: path })
            .done(function(data) {
                // Remove all columns after the current level
                columnsDiv.children().slice(level).remove();

                // Create a new column
                const column = $('<div>').addClass('column');
                const list = $('<ul>');

                // Add directories
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

                    // Add selected class if selected
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
            .fail(function(jqXHR) {
                console.error('L-Drive Access Error:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText
                });
            });
    }

    // Handle directory clicks
    function handleDirectoryClick(item, path, level) {
        item.closest('.column').find('li').removeClass('active-directory');
        item.closest('li').addClass('active-directory');
        loadDirectory(path, level + 1);
    }

    // Handle double-click on directory
    function handleDirectoryDoubleClick(item, path, level) {
        handleDirectoryClick(item, path, level);
        $.getJSON('/databasepages/api/list_dir/', { path: path })
            .done(function(data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                data.files.forEach(function(file) {
                    const filePath = file.path;
                    selectedItems.add(filePath);
                    fetchFileInfo(filePath);
                });
                const lastColumn = columnsDiv.children().last();
                lastColumn.find('.file-name').each(function() {
                    const filePath = $(this).data('path');
                    if (selectedItems.has(filePath)) {
                        $(this).parent().addClass('selected');
                    }
                });
                updateSelectedItemsList();
            })
            .fail(function(jqXHR, errorThrown) {
                alert('Failed to load directory contents: ' + errorThrown);
            });
    }

    // Fetch file information from the server
    function fetchFileInfo(filePath) {
        $.getJSON('/databasepages/api/file_info/', { path: filePath })
            .done(function(data) {
                if (data.error) {
                    return;
                }
                selectedItemsInfo[filePath] = data;
                updateSelectedItemsList();
            })
            .fail(function() {
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

            fileInfoDiv.append($('<span>').addClass('file-path').text(filePath));
            fileInfoDiv.append($('<span>').addClass('file-details')
                .text(`${fileInfo.size || 'Unknown'} | ${fileInfo.modified || 'Unknown'}`));

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
            success: function() {
                alert('Selected items have been imported.');
                selectedItems.clear();
                selectedItemsInfo = {};
                $('.selected').removeClass('selected');
                updateSelectedItemsList();
            },
            error: function(xhr, error) {
                alert('An error occurred during import: ' + error);
            }
        });
    });

    // Clear selected items
    $('#clear-button').click(function() {
        selectedItems.clear();
        selectedItemsInfo = {};
        $('.selected').removeClass('selected');
        updateSelectedItemsList();
    });

    // Make the separator movable
    let isResizing = false;
    let lastDownY = 0;

    $('#separator-handle').on('mousedown', function(e) {
        isResizing = true;
        lastDownY = e.clientY;
        e.preventDefault();
    });

    $(document).on('mousemove', function(e) {
        if (!isResizing) return;

        const deltaY = e.clientY - lastDownY;
        lastDownY = e.clientY;

        const containerHeight = $('#main-container').height();
        const separatorHeight = $('#separator').outerHeight();

        let fileBrowserHeight = $('#file-browser-section').height() + deltaY;
        let selectedItemsHeight = $('#selected-items-section').height() - deltaY;

        const minHeight = 100;
        const maxFileBrowserHeight = containerHeight - separatorHeight - minHeight;
        const maxSelectedItemsHeight = containerHeight - separatorHeight - minHeight;

        if (fileBrowserHeight < minHeight) {
            fileBrowserHeight = minHeight;
            selectedItemsHeight = containerHeight - separatorHeight - minHeight;
        } else if (selectedItemsHeight < minHeight) {
            selectedItemsHeight = minHeight;
            fileBrowserHeight = containerHeight - separatorHeight - minHeight;
        }

        $('#file-browser-section').height(fileBrowserHeight);
        $('#selected-items-section').height(selectedItemsHeight);

        e.preventDefault();
    });

    $(document).on('mouseup', function() {
        if (isResizing) {
            isResizing = false;
        }
    });

    // Bind click events to directory and file items
    function bindClickEvents(column, level) {
        column.find('li').on('click', function() {
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
