// color_me.js

// Define color palettes for directories and their script-cards
// const colorPalettes = [
//     ["#F8B195", "#F67280", "#C06C84", "#6C5B7B", "#355C7D"], // Flat Palette #1
//     ["#99B898", "#FECEAB", "#FF847C", "#E84A5F", "#2A363B"], // Flat Palette #2
//     ["#A8E6CE", "#DCEDC2", "#FFD3B5", "#FFA3A6", "#FF8C94"], // Flat Palette #3
//     ["#A8A7A7", "#CC527A", "#E8175D", "#474747", "#363636"], // Flat Palette #4
//     ["#A7226E", "#EC2049", "#F26B38", "#F7DB4F", "#2F9599"], // Flat Palette #5
//     ["#E1F5C4", "#EDE574", "#F9D423", "#FC913A", "#FF4E50"], // Flat Palette #6
//     ["#E5FCC2", "#9DE0AD", "#45ADA8", "#547980", "#594F4F"], // Flat Palette #7
//     ["#FE4365", "#FC9D9A", "#F9CDAD", "#C8C8A9", "#83AF9B"], // Flat Palette #8
//     ["#FFCCBB", "#6EB5C0", "#006C84", "#E2E8E4"], // Arctic Sunrise
//     ["#003B46", "#07575B", "#66A5AD", "#C4DFE6"], // Cool Blues
//     ["#0F1F38", "#8E7970", "#F55449", "#1B4B5A"], // Exotic & High-Impact
//     ["#2C4A52", "#537072", "#8E9B97", "#F4EBDB"], // Hazy Greys
//     ["#262F34", "#F34A4A", "#F1D3BC", "#615049"], // Shadowy & Dramatic
//     ["#A49592", "#727077", "#EED8C9", "#E99787"], // Smoky Purples
//     ["#90AFC5", "#336B87", "#2A3132", "#763626"]  // Subdued & Professional
// ];

const colorPalettes = [
    ["#F8B195", "#F67280", "#C06C84", "#6C5B7B", "#355C7D"], // Flat Palette #1
    ["#A8A7A7", "#CC527A", "#E8175D", "#474747", "#363636"], // Flat Palette #4
    ["#E5FCC2", "#9DE0AD", "#45ADA8", "#547980", "#594F4F"], // Flat Palette #7
    ["#FE4365", "#FC9D9A", "#F9CDAD", "#C8C8A9", "#83AF9B"], // Flat Palette #8
    ["#FFCCBB", "#6EB5C0", "#006C84", "#E2E8E4"], // Arctic Sunrise
    ["#003B46", "#07575B", "#66A5AD", "#C4DFE6"], // Cool Blues
    ["#0F1F38", "#8E7970", "#F55449", "#1B4B5A"], // Exotic & High-Impact
    ["#2C4A52", "#537072", "#8E9B97", "#F4EBDB"], // Hazy Greys
    ["#262F34", "#F34A4A", "#F1D3BC", "#615049"], // Shadowy & Dramatic
    ["#A49592", "#727077", "#EED8C9", "#E99787"], // Smoky Purples
    ["#90AFC5", "#336B87", "#2A3132", "#763626"]  // Subdued & Professional
];

// Function to apply colors to directories and their script-cards
function applyColorsToDirectories() {
    // Assuming directory elements have the class "directory"
    const directories = document.querySelectorAll('.directory');
    directories.forEach((directory, index) => {
        const palette = colorPalettes[index % colorPalettes.length];
        
        // Set background color for the directory
        directory.style.backgroundColor = palette[0];
        
        // Set background colors for the script-cards within the directory
        const scriptCards = directory.querySelectorAll('.script-card');
        scriptCards.forEach((scriptCard, cardIndex) => {
            scriptCard.style.backgroundColor = palette[(cardIndex + 1) % palette.length];
        });
    });
}

// Call the function to apply colors when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', applyColorsToDirectories);
