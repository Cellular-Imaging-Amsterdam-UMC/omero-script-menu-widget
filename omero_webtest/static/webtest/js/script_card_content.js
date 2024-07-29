// script_card_content.js

const scriptCardContent = {
    1: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    2: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    3: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    4: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    5: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    6: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    7: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    8: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    9: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    10: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    11: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    12: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    13: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    14: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    15: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
    16: '<span>yay it works</span><img src="/static/webtest/img/script-text-play.svg" alt="Script Icon">',
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
