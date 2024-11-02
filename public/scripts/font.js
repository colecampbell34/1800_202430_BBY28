// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the saved font size from localStorage or default to 16px
  let currentFontSize = parseInt(localStorage.getItem("fontSize")) || 16;

  // Apply the saved font size on page load
  document.body.style.fontSize = `${currentFontSize}px`;

  // Get slider and display elements
  const fontSizeSlider = document.getElementById("fontSizeSlider");
  const fontSizeValue = document.getElementById("fontSizeValue");

  // Check if elements exist
  if (fontSizeSlider && fontSizeValue) {
    // Update the slider value and display text on page load
    fontSizeSlider.value = currentFontSize;
    fontSizeValue.textContent = currentFontSize;

    // Function to change the font size based on the slider value
    function updateFontSize() {
      currentFontSize = parseInt(fontSizeSlider.value); // Get the slider value
      document.body.style.fontSize = `${currentFontSize}px`; // Apply new font size
      fontSizeValue.textContent = currentFontSize; // Update the displayed size

      // Save the new font size to localStorage
      localStorage.setItem("fontSize", currentFontSize);
    }

    // Add an event listener to the slider to detect changes
    fontSizeSlider.addEventListener("input", updateFontSize);
  } else {
    // this should show on every page without the slider
    console.warn("Slider or display element not found.");
  }
});