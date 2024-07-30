# Script Menu Widget

The `script_menu_widget` is an extension for OMERO.web that provides an interactive and browsable popup script menu widget, allowing users to easily launch scripts from OMEROweb.

## Features

- **Script Menu Widget**: A user-friendly widget to browse and launch scripts directly from OMEROweb.
- **Enhanced Browsing**: Replaces the traditional script dropdown menu with a more interactive and browsable popup menu.
- **Compatibility**: Compatible with BIOMERO (more details to be provided).

## Requirements

- **Docker**: Ensure you have Docker installed.
- **OMERO.web**: Requires specific Docker file commands, OMERO settings edits, and a list of files that will replace OMERO web files (detailed list to be provided).

## Installation

1. **Docker Setup**: Use the following Dockerfile commands to set up the environment:
    ```dockerfile:web/Dockerfile
    # I will add the docker setup and other requirements later
    ```

2. **OMERO Settings**: Apply the necessary OMERO settings edits (details to be provided).

3. **File Replacements**: Replace the specified OMERO web files with the provided files (detailed list to be provided).

## Configuration

After installation, users need to configure the script menu in the following file:

javascript:web/local_omeroweb_edits/omero-webtest/omero_webtest/static/webtest/js/script_card_content.js

(Note: Detailed configuration steps will be provided later.)

## Use Cases

The `script_menu_widget` is particularly useful in laboratory environments where running scripts is an integral part of the workflow. It simplifies the process of browsing and launching a wide variety of scripts, enhancing productivity and efficiency.

## License

This project is licensed under the AGPL.

## Author

Originally developed by Aleksandra Tarkowska.

---

For more detailed information and updates, please refer to the official documentation (link to be provided).