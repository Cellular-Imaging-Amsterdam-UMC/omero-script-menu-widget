import os
import sys
from shutil import copyfile

def main():
    # Get the current Python version
    python_version = f"python{sys.version_info.major}.{sys.version_info.minor}"

    # Step 1: Add the server side browser importer configuration to OMERO.web
    config_src = os.path.join(os.path.dirname(__file__), '07-web-importer.omero')
    config_dst = '/opt/omero/web/config/07-web-importer.omero'

    try:
        copyfile(config_src, config_dst)
        print(f"Successfully added web-importer configuration: {config_src} -> {config_dst}")
    except Exception as e:
        print(f"Error adding web-importer configuration: {e}")

    # Step 2: Replace the importer button
    src = os.path.join(os.path.dirname(__file__), 'templates', 'webimporter', 'webclient_plugins', 'importer_button.html')
    dst = os.path.join(f'/opt/omero/web/venv3/lib/{python_version}/site-packages/omeroweb/webclient/templates/webclient/base/includes/importer_button.html')

    try:
        copyfile(src, dst)
        print(f"Successfully introduced the web importer HTML: {src} -> {dst}")
    except Exception as e:
        print(f"Error introducing the web importer HTML: {e}")
