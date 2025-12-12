/* snow-falling.js — lightweight falling snow effect */

(function () {
  if (typeof window === 'undefined') return;

  try {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.matches) return;

    if (window.__SNOW_FALLING_ACTIVE__) return;
    window.__SNOW_FALLING_ACTIVE__ = true;

    const container = document.createElement('div');
    container.className = 'snow-canvas-container';

    const canvas = document.createElement('canvas');
    canvas.className = 'snow-canvas';

    container.appendChild(canvas);
    document.body.appendChild(container);

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, flakes = [];
    const maxFlakes = 120;
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createFlake() {
      const r = rand(0.8, 3.4);
      return {
        x: rand(0, w),
        y: rand(-h, 0),
        r,
        d: rand(0.5, 2),
        vx: rand(-0.5, 0.5),
        vy: rand(0.3, 1.2) * (r / 1.8),
        tilt: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.02, 0.02),
        opacity: rand(0.4, 0.95)
      };
    }

    function initFlakes() {
      flakes = [];
      const target = Math.min(maxFlakes, Math.floor((w / 1000) * maxFlakes));
      for (let i = 0; i < target; i++) flakes.push(createFlake());
    }

    let paused = false;
    function animate(time) {
      if (paused) return;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      flakes.forEach((f, i) => {
        f.tilt += f.rotSpeed;
        f.x += f.vx + Math.sin(time / 1000 + f.d) * 0.3;
        f.y += f.vy * f.d;

        if (f.y > h || f.x < -10 || f.x > w + 10) {
          flakes[i] = createFlake();
          flakes[i].y = -5;
        }

        ctx.beginPath();
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = "#fff";
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      requestAnimationFrame(animate);
    }

    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused) requestAnimationFrame(animate);
    });

    window.addEventListener("resize", () => {
      resizeCanvas();
      initFlakes();
    });

    resizeCanvas();
    initFlakes();
    requestAnimationFrame(animate);

  } catch (e) {
    console.error("Snow-Falling Error:", e);
  }
})();
