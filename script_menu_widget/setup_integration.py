import os
import sys
from shutil import copyfile

def main():
    # Get the current Python version
    python_version = f"python{sys.version_info.major}.{sys.version_info.minor}"

    # Step 1: Add the script-menu-widget configuration to OMERO.web
    config_src = os.path.join(os.path.dirname(__file__), '02-script_menu_widget.omero')
    config_dst = '/opt/omero/web/config/02-script_menu_widget.omero'

    try:
        copyfile(config_src, config_dst)
        print(f"Successfully added script-menu-widget configuration: {config_src} -> {config_dst}")
    except Exception as e:
        print(f"Error adding script-menu-widget configuration: {e}")

    # Step 2: Replace the script launch HTML to use the new script menu widget
    src = os.path.join(os.path.dirname(__file__), 'templates', 'scriptmenu', 'webclient_plugins', 'script_launch_head.html')
    dst = os.path.join(f'/opt/omero/web/venv3/lib/{python_version}/site-packages/omeroweb/webclient/templates/webclient/base/includes/script_launch_head.html')

    try:
        copyfile(src, dst)
        print(f"Successfully replaced script launch HTML: {src} -> {dst}")
    except Exception as e:
        print(f"Error replacing script launch HTML: {e}")
