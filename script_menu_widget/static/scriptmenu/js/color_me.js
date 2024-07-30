// color_me.js

const directoryColors = [
    "rgb(248, 177, 149)", "rgb(204, 82, 122)", "rgb(157, 224, 173)", 
    "rgb(252, 157, 154)", "rgb(110, 181, 192)", "rgb(7, 87, 91)", 
    "rgb(142, 121, 112)", "rgb(83, 112, 114)", "rgb(243, 74, 74)", 
    "rgb(114, 112, 119)", "rgb(51, 107, 135)"
];

// Function to lighten a color
function lightenColor(color, percent) {
    console.log(`Lightening color: ${color} by ${percent}%`);
    const num = parseInt(color.slice(4, -1).split(',').map(c => c.trim()).join(''), 10);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `rgb(${Math.min(255, R)}, ${Math.min(255, G)}, ${Math.min(255, B)})`;
}

// Function to apply colors to directories and their script-cards
function applyColorsToDirectories() {
    console.log("Applying colors to directories...");
    // Assuming directory elements have the class "directory"
    const directories = document.querySelectorAll('.directory');
    directories.forEach((directory, index) => {
        const color = directoryColors[index % directoryColors.length];
        console.log(`Applying color: ${color} to directory index: ${index}`);
        
        // Set background color for the directory
        directory.style.backgroundColor = color;
        
        // Set background colors for the script-cards within the directory
        const scriptCards = directory.querySelectorAll('.script-card');
        scriptCards.forEach((scriptCard) => {
            const lightenedColor = lightenColor(color, 30); // Lighten by 30%
            console.log(`Applying lightened color: ${lightenedColor} to script card`);
            scriptCard.style.backgroundColor = lightenedColor;
        });
    });
}

// Call the function to apply colors when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', applyColorsToDirectories);