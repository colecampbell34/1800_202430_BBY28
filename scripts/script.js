function sayHello() {
    
}
//sayHello();

// Changing font size
let currentFontSize = 16; // Starting font size in pixels

// Function to change the font size by a given amount
function changeFontSize(amount) {
  currentFontSize += amount; // Adjust the current font size
  if (currentFontSize < 12) currentFontSize = 12; // Set minimum font size
  if (currentFontSize > 36) currentFontSize = 36; // Set maximum font size
  document.body.style.fontSize = `${currentFontSize}px`; // Apply new size
}

// Add event listeners to the buttons
document.getElementById('decreaseFont').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default behavior
  changeFontSize(-2); // Decrease font size by 2px
});

document.getElementById('increaseFont').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default behavior
  changeFontSize(2); // Increase font size by 2px
});
// Changing font size

