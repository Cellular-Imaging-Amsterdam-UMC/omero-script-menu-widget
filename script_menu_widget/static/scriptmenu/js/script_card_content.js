// script_card_content.js


const scriptCardContent = {
    1: '<span>This script processes a CSV file, using it to "populate" an OMERO.table, with one row per Image, Well or ROI. The table data can then be displayed in the OMERO clients. For full details of the supported CSV format, see https://github.com/ome/omero-metadata/#populate\n\nAuthors: Emil Rozbicki, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk</span>',
    2: '<span>Generates regions of interest from the measurement files associated with a plate\n\nThis script is executed by the server on initial import, and should typically not need to be run by users.</span>',
    3: '<span>This script analyzes Kymograph images, which have Line or PolyLine ROIs that track moving objects. It generates a table of the speed of movement, saved as an Excel / CSV file.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    4: '<span>This script processes Images, which have Line or PolyLine ROIs and outputs the data as CSV files, for plotting in e.g. Excel.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    5: '<span>This script processes Images, which have Line or PolyLine ROIs to create kymographs.\nKymographs are created in the form of new OMERO Images, with single Z and T, same sizeC as input.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    6: '<span>Create a figure of movie frames from ROI region of image.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    7: '<span>Create a figure of split-view images.\nSee http://help.openmicroscopy.org/publish.html#figures\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    8: '<span>Export a figure of thumbnails, optionally sorted by tag.\nSee http://help.openmicroscopy.org/publish.html#figures\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    9: '<span>Create a figure of an ROI region as separate zoomed split-channel panels.\nNB: OMERO.insight client provides a nicer UI for this script under "Publishing Options"\nSee http://help.openmicroscopy.org/publish.html#figures\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    10: '<span>Export a figure of a movie, showing a row of frames for each chosen image.\nNB: OMERO.insight client provides a nicer UI for this script under "Publishing Options"\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    11: '<span>Export ROI intensities for selected Images as a CSV file.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk</span>',
    12: '<span>Save multiple images as JPEG, PNG, TIFF or OME-TIFF in a zip file available for download as a batch export. See http://help.openmicroscopy.org/export.html#batch\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.0</span>',
    13: '<span>MakeMovie creates a movie of the image and attaches it to the originating image.\n\nAuthors: Donald MacDonald, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.2.0</span>',
    14: '<span>Remove key-value pairs from Image IDs or by the Dataset IDs. See http://www.openmicroscopy.org/site/support/omero5.2/developers/scripts/user-guide.html for the tutorial that uses this script.\n\nAuthors: Christian Evenhuis, MIF\nContact: https://forum.image.sc/tag/omero</span>',
    15: '<span>This script processes a csv file, attached to a Dataset\n\nAuthors: Christian Evenhuis\nContact: https://forum.image.sc/tag/omero</span>',
    16: '<span>This script reads the metadata attached data set and creates a csv file attached to the Dataset\n\nAuthors: Christian Evenhuis\nContact: https://forum.image.sc/tag/omero</span>',
    17: '<span>Create new Images from existing images, applying an x, y and z shift to each channel independently. See http://help.openmicroscopy.org/scripts.html\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.2.0</span>',
    18: '<span>Crop an Image using Rectangular ROIs, to create a new Image for each ROI. ROIs that extend across Z and T will crop according to the Z and T limits of each ROI. If you choose to "make an image stack" from all the ROIs, the script will create a single new Z-stack image with a single plane from each ROI. ROIs that are "Big", typically over 3k x 3k pixels will create "tiled" images using the specified tile size.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 5.3.0</span>',
    19: '<span>Take a Dataset of Images and put them in a new Plate, arranging them into rows or columns as desired. Optionally add the Plate to a new or existing Screen. See http://help.openmicroscopy.org/scripts.html\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.2</span>',
    20: '<span>For Screen/Plate/Well data, this script moves your Annotations from Images to their parent Wells. If you are an Admin, this will also move annotations that other users have added, creating links that belong to the same users.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 5.3.0</span>',
    21: '<span>Combine several single-plane images (or Z-stacks) into one with greater Z, C, T dimensions. See http://help.openmicroscopy.org/scripts.html\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.2.0</span>',
};

function updateScriptCardContent() {
    const scriptCards = document.querySelectorAll('.script-card');
    scriptCards.forEach(scriptCard => {
        const scriptId = scriptCard.getAttribute('data-id');
        const contentDiv = scriptCard.querySelector('.script-card-content');
        if (scriptCardContent[scriptId]) {
            contentDiv.innerHTML = scriptCardContent[scriptId];
        }
    });
}

// Call the function to update script card content when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateScriptCardContent);
