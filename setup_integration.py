import os
import sys
from shutil import copyfile

def main():
    # Get the current Python version
    python_version = f"python{sys.version_info.major}.{sys.version_info.minor}"

    # Define the source and destination paths
    src = os.path.join(os.path.dirname(__file__), 'templates', 'scriptmenu', 'webclient_plugins', 'script_launch_head.html')
    dst = os.path.join(f'/opt/omero/web/venv3/lib/{python_version}/site-packages/omeroweb/webclient/templates/webclient/base/includes/script_launch_head.html')

    # Perform the file copy, overwriting the destination file if it exists
    try:
        copyfile(src, dst)
        print(f"Successfully copied {src} to {dst}")
    except Exception as e:
        print(f"Error copying file: {e}")
