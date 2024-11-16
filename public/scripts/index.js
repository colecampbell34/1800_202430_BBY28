 // Array of images and corresponding text
 const slides = [
          { image: '/images/wecan.png', text: '' },
          { image: '/images/traveltogether.jpg', text: 'Travel Together'},
          { image: '/images/wedding.jpg', text: 'Plan Wedding Together' },
          { image: '/images/Business-setup.jpg', text: 'Build Up Business Together'},
          { image: '/images/save.svg', text: '' }
        ];
      
        let currentSlideIndex = 0;
        const slideshowContainer = document.getElementById('slideshow-container');
        const slideshowText = document.getElementById('slideshow-text');
      
        let intervalId; // Store the interval ID
      
        // Function to change the background image and text
        function changeSlide() {
          const slide = slides[currentSlideIndex];
          slideshowContainer.style.backgroundImage = `url('${slide.image}')`;
          slideshowText.textContent = slide.text; // Update the text
      
          currentSlideIndex++;
      

          // If it's the last slide, stop the interval and show the button
          if (currentSlideIndex === slides.length) {
                    clearInterval(intervalId); // Stop slideshow
                    myButton.style.display = 'block'; // the button appears
          }
          }
    
      
        // Initial display of the first image and text
        changeSlide();
      
        // Set an interval to change the image and text every 3 seconds
        intervalId = setInterval(changeSlide, 2000);

