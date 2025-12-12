/* snow-falling.js — lightweight falling snow effect */

(function () {                        // Starts an immediately-invoked function to avoid polluting global scope.
  if (typeof window === 'undefined') return;  // If there's no browser window (e.g., server side), stop running.

  try {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');   // Checks if the user's system prefers reduced motion.
    if (mq && mq.matches) return;     // If true, stop the animation for accessibility.
    
    if (window.__SNOW_FALLING_ACTIVE__) return; // Prevents running the snow effect multiple times.                  
    
    window.__SNOW_FALLING_ACTIVE__ = true;  // Marks snow as active so it won't initialize again.
    
    const container = document.createElement('div'); // Creates a container <div> for the canvas.

    container.className = 'snow-canvas-container'; // Assigns the CSS class to style it.
    
    const canvas = document.createElement('canvas'); // Creates the <canvas> where snow will be drawn.
    
    canvas.className = 'snow-canvas'; // Assigns the styling class.

    container.appendChild(canvas);    // Places the canvas inside the container.
    
    document.body.appendChild(container);// Adds the container into the webpage.
                                      

    const ctx = canvas.getContext('2d'); // Gets the 2D drawing context for drawing snow.
                                     
    let w = 0, h = 0, flakes = [];    // Variables for width, height, and snowflake list.
    const maxFlakes = 120;            // Maximum number of snowflakes allowed.
    const dpr = window.devicePixelRatio || 1; // Adjusts for high-resolution screens (like Retina).

    function resizeCanvas() {         // Function to resize the canvas when the window changes.
      w = window.innerWidth;          // Gets current window width.
      h = window.innerHeight;         // Gets current window height.
      canvas.width = w * dpr;         // Scales canvas width for high-resolution screens.
      canvas.height = h * dpr;        // Scales canvas height.
      canvas.style.width = w + 'px';  // Ensures canvas visually matches window width.
      canvas.style.height = h + 'px'; // Ensures canvas visually matches window height.
      ctx.scale(dpr, dpr);            // Scales drawing to look sharp on high-DPI screens.
    }

    function rand(min, max) {         // Helper function to generate random number.
      return Math.random() * (max - min) + min;
    }

    function createFlake() {          // Creates a single snowflake with random properties.
      const r = rand(0.8, 3.4);       // Random radius (size) of the flake.
      return {
        x: rand(0, w),                // Starting X position.
        y: rand(-h, 0),               // Starting Y position (above the screen).
        r,                            // Size of flake.
        d: rand(0.5, 2),              // Density (affects speed).
        vx: rand(-0.5, 0.5),          // Horizontal speed.
        vy: rand(0.3, 1.2) * (r / 1.8), // Vertical falling speed (larger flakes fall faster).
        tilt: rand(0, Math.PI * 2),   // Tilt/rotation angle.
        rotSpeed: rand(-0.02, 0.02),  // Speed of rotation.
        opacity: rand(0.4, 0.95)      // Transparency of the flake.
      };
    }

    function initFlakes() {           // Initializes the snowflake array.
      flakes = [];                    // Resets the list.
      const target = Math.min(maxFlakes, Math.floor((w / 1000) * maxFlakes)); // Sets flake count based on window size.
                                      
      for (let i = 0; i < target; i++) flakes.push(createFlake());// Creates that many snowflakes.
                                      
    }

    let paused = false;               // Tracks whether animation is paused.
    function animate(time) {          // Main animation loop.
      if (paused) return;             // If paused, stop animating.

      ctx.clearRect(0, 0, w, h);      // Clears the canvas.
      ctx.save();                     // Saves the drawing state.

      flakes.forEach((f, i) => {      // Updates and draws each snowflake.
        f.tilt += f.rotSpeed;         // Updates rotation.
        f.x += f.vx + Math.sin(time / 1000 + f.d) * 0.3; // Adds horizontal drift using sine wave.
                                      
        f.y += f.vy * f.d;            // Moves snowflake down the screen.

        if (f.y > h || f.x < -10 || f.x > w + 10) {         // If flake leaves the screen...
                                      
          flakes[i] = createFlake();  // Replace it with a new flake.
          flakes[i].y = -5;           // Start slightly above the screen.
        }

        ctx.beginPath();              // Starts drawing a shape.
        ctx.globalAlpha = f.opacity;  // Sets transparency.
        ctx.fillStyle = "#fff";       // Sets fill color to white.
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); 
                                      
        ctx.fill();                   // Fills it in.
      });

      ctx.restore();                  // Restores canvas state.
      requestAnimationFrame(animate); // Calls animate again for smooth animation.
    }

    document.addEventListener("visibilitychange", () => { // Pauses when user switches browser tabs.
                                      
      paused = document.hidden;       // Pause if the page is hidden.
      if (!paused) requestAnimationFrame(animate);// Resume animation when visible again.
    });
                                      

    window.addEventListener("resize", () => { // When window resizes:
                                      
      resizeCanvas();                 // Update canvas size.
      initFlakes();                   // Recreate snowflakes.
    });

    resizeCanvas();                   // Set initial canvas size.
    initFlakes();                     // Create initial flakes.
    requestAnimationFrame(animate);   // Start the animation loop.

  } catch (e) {                       // Catches and logs any errors.
    console.error("Snow-Falling Error:", e);
  }
})();
