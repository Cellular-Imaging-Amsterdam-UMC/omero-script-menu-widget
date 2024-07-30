// script_card_content.js

const scriptCardContent = {
    1: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    2: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    3: '<span>This script analyzes Kymograph images, which have Line or PolyLine ROIs that track moving objects. It generates a table of the speed of movement, saved as an Excel / CSV file.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    4: '<span>This script processes Images, which have Line or PolyLine ROIs and outputs the data as CSV files, for plotting in e.g. Excel.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    5: '<span>This script processes Images, which have Line or PolyLine ROIs to create kymographs.\nKymographs are created in the form of new OMERO Images, with single Z and T, same sizeC as input.\n\nAuthors: William Moore, OME Team\nContact: ome-users@lists.openmicroscopy.org.uk\nVersion: 4.3.3</span>',
    6: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    7: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    8: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    9: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    10: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    11: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    12: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    13: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    14: '<img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    15: '<img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    16: '<img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    17: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    18: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    19: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    20: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
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
