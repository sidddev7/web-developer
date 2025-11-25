/*!
 * Custom JavaScript for Siddhrajsinh Gohil Portfolio
 * Modern Portfolio Website
 */

(function ($) {
  "use strict";

  // Initialize when DOM is ready
  $(document).ready(function () {
    // Additional custom functionality can be added here
    console.log("Portfolio website loaded successfully!");

    // Fluid Cursor Implementation
    const cursorDot = document.querySelector("[data-cursor-dot]");
    const cursorOutline = document.querySelector("[data-cursor-outline]");

    if (cursorDot && cursorOutline) {
      window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        // Cursor dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Cursor outline follows with animation
        cursorOutline.animate(
          {
            left: `${posX}px`,
            top: `${posY}px`,
          },
          {
            duration: 500,
            fill: "forwards",
          }
        );
      });

      // Add hover effect for interactive elements
      const interactiveElements = document.querySelectorAll(
        "a, button, .btn, input, textarea, select, .social-link, .portfolio-item"
      );

      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          document.body.classList.add("hovering");
        });

        el.addEventListener("mouseleave", () => {
          document.body.classList.remove("hovering");
        });
      });
    }
  });

  // Initialize when window is loaded
  $(window).on("load", function () {
    // Any post-load functionality
  });
})(jQuery);
