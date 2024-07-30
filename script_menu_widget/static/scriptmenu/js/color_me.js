// color_me.js

const directoryColors = [
    "rgb(51, 107, 135)", "rgb(42, 49, 50)", "rgb(34, 85, 51)", "rgb(105, 105, 105)", 
    "rgb(105, 105, 105)","rgb(51, 107, 135)", "rgb(42, 49, 50)", "rgb(34, 85, 51)"
];

// Function to lighten a color
function lightenColor(color, percent) {
    console.log(`Lightening color: ${color} by ${percent}%`);
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length !== 3) {
        console.error(`Invalid color format: ${color}`);
        return color;
    }
    const num = rgb.map(Number);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, num[0] + amt);
    const G = Math.min(255, num[1] + amt);
    const B = Math.min(255, num[2] + amt);
    const lightenedColor = `rgb(${R}, ${G}, ${B})`;
    console.log(`Resulting lightened color: ${lightenedColor}`);
    return lightenedColor;
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