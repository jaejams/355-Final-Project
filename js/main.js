
// Function to handle smooth scrolling to the top of the document
function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // --- Scroll-to-Top Button Logic ---
    let mybutton = document.getElementById("myBtn");

    // Show/hide the button based on scroll position
    function scrollFunction() {
        // Use a consistent scroll threshold (e.g., 50px)
        const scrollThreshold = 50; 
        if (document.body.scrollTop > scrollThreshold || document.documentElement.scrollTop > scrollThreshold) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    // Attach scroll listener
    window.onscroll = scrollFunction;

    // NOTE: The click listener for mybutton is handled by the inline onclick="topFunction()" 
    // in index.html for simplicity, but the topFunction definition is here.

    // --- Mobile Navigation Logic ---

    // Function to toggle the visibility of the mobile nav links
    function toggleMobileNavLinks() {
        var navLinks = document.querySelector('.mobile-nav-links');
        // Toggle the 'display' property between 'block' and 'none'
        // Check for 'none' or empty string (default state)
        if (navLinks) {
            navLinks.style.display = (navLinks.style.display == 'none' || navLinks.style.display == '') ? 'block' : 'none';
        }
    }

    const burgerButton = document.querySelector('.burger-button');
    const closeButton = document.querySelector('.close-button');

    // Event listener for the burger button
    if (burgerButton) {
        burgerButton.addEventListener('click', function () {
            toggleMobileNavLinks();
        });
    }

    // Event listener for the close button
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            toggleMobileNavLinks();
        });
    }

    // Optional: Close the menu when a link inside is clicked (for smooth scrolling)
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Wait slightly for the scroll to start before closing
            setTimeout(toggleMobileNavLinks, 500); 
        });
    });
});