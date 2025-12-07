document.addEventListener('DOMContentLoaded', () => {
  const snowLayer = document.getElementById('snow-layer');
  const ornamentsEl = document.getElementById('ornaments');
  const garlandEl = document.getElementById('garland');
  const treeWrap = document.querySelector('.tree-wrap');
  const starEl = document.querySelector('.star');
  const toggleLightsBtn = document.getElementById('toggleLights');
  const toggleSnowBtn = document.getElementById('toggleSnow');

  // Guard if elements are missing (e.g., before index.html is updated)
  if (!snowLayer || !ornamentsEl || !garlandEl) {
    return;
  }

  // State
  let snowOn = true;
  let snowInterval = null;
  let sparkleInterval = null;

  // Helpers
  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Snow generation
  function createSnowflake() {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    const glyphs = ['❄', '✻', '✼', '•'];
    flake.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    const size = rand(8, 16);
    const duration = rand(6, 12); // seconds
    const left = rand(0, 100); // vw percent-ish

    flake.style.left = `${left}vw`;
    flake.style.fontSize = `${size}px`;
    flake.style.animationDuration = `${duration}s, ${rand(3, 6)}s`;
    flake.style.opacity = String(rand(0.6, 1));

    snowLayer.appendChild(flake);

    // Cleanup after animation
    setTimeout(() => {
      flake.remove();
    }, duration * 1000 + 1000);
  }

  function startSnow() {
    if (snowInterval) return;
    snowInterval = setInterval(() => {
      // burst of multiple flakes for density
      for (let i = 0; i < 3; i++) createSnowflake();
    }, 500);
  }

  function stopSnow() {
    if (snowInterval) {
      clearInterval(snowInterval);
      snowInterval = null;
    }
  }

  // Sparkles near the star
  function createSparkle() {
    if (!treeWrap) return;
    const s = document.createElement('span');
    s.className = 'sparkle';
    // Random offset around center top area (below star)
    const xOffset = (Math.random() - 0.5) * 60; // -30..30px
    const yOffset = Math.random() * 30 + 10; // 10..40px
    s.style.left = `calc(50% + ${xOffset}px)`;
    s.style.top = `${yOffset}px`;
    treeWrap.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
  function startSparkles() {
    if (sparkleInterval) return;
    sparkleInterval = setInterval(createSparkle, 1200);
  }
  function stopSparkles() {
    if (sparkleInterval) {
      clearInterval(sparkleInterval);
      sparkleInterval = null;
    }
  }

  // Ornaments placement (better fits triangular silhouette and layers)
  function setupOrnaments() {
    ornamentsEl.innerHTML = '';
    const width = ornamentsEl.clientWidth || 320;
    const height = ornamentsEl.clientHeight || 300;

    // Responsive ornament density
    const base = Math.round((width * height) / 1800);
    const count = Math.max(18, Math.min(36, base));

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'ornament';

      if (i % 3 === 0) dot.classList.add('blue');
      if (i % 5 === 0) dot.classList.add('gold');
      dot.classList.add(`d${(i % 8) + 1}`);

      // Choose a band (top/mid/bottom) to keep distribution balanced
      const band = i % 3; // 0,1,2
      let yMin = 0.12, yMax = 0.92;
      if (band === 0) { yMin = 0.12; yMax = 0.35; }
      else if (band === 1) { yMin = 0.35; yMax = 0.62; }
      else { yMin = 0.62; yMax = 0.90; }
      const y = rand(yMin, yMax) * height;

      // Triangle width linearly increases with y, but add small inward margin
      const edgePadding = Math.max(10, width * 0.06);
      const maxHalf = width / 2 - edgePadding;
      const t = (y / height); // 0..1 from tip to base
      const halfWidthAtY = Math.max(12, maxHalf * t);
      // Gentle wave so dots aren't in a straight vertical band
      const wave = Math.sin((y / 16) + i) * Math.max(6, width * 0.02);
      const x = width / 2 + rand(-halfWidthAtY, halfWidthAtY) * 0.92 + wave;

      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      ornamentsEl.appendChild(dot);
    }
  }

  // Garland lights positioned along arcs matching layers
  function setupGarland() {
    garlandEl.innerHTML = '';
    const width = garlandEl.clientWidth || 350;
    const height = garlandEl.clientHeight || 320;

    const rows = [
      { y: 0.30, spread: 0.42, sag: 10, count: Math.round(width / 30) },
      { y: 0.50, spread: 0.54, sag: 12, count: Math.round(width / 26) },
      { y: 0.70, spread: 0.66, sag: 14, count: Math.round(width / 24) },
    ];

    rows.forEach((row, idx) => {
      const cx = width / 2;
      const half = (width * row.spread) / 2;
      const yBase = height * row.y + idx * 2;
      const n = Math.max(8, Math.min(18, row.count));
      for (let i = 0; i < n; i++) {
        const light = document.createElement('span');
        light.className = 'light';
        const t = i / (n - 1);
        const x = cx - half + 2 * half * t;
        const y = yBase + Math.sin(t * Math.PI) * row.sag;
        // tiny jitter so they don't look perfectly uniform
        light.style.left = `${x + rand(-1.5, 1.5)}px`;
        light.style.top = `${y + rand(-1.5, 1.5)}px`;
        garlandEl.appendChild(light);
      }
    });
  }

  // Interactions
  toggleLightsBtn?.addEventListener('click', () => {
    document.body.classList.toggle('lights-on');
  });

  toggleSnowBtn?.addEventListener('click', () => {
    snowOn = !snowOn;
    if (snowOn) startSnow(); else stopSnow();
  });

  // Init
  setupOrnaments();
  setupGarland();
  startSnow();
  startSparkles();

  // Responsive re-layout
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      setupOrnaments();
      setupGarland();
    });
  });

  // If page is hidden, pause sparkles to save cycles
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSparkles();
    } else {
      startSparkles();
    }
  });

  // Countdown to Christmas (Dec 25). If passed, target next year.
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  function getTargetChristmas() {
    const now = new Date();
    const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, 11, 25, 0, 0, 0); // Dec is 11
  }
  let targetXmas = getTargetChristmas();

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    if (!elDays || !elHours || !elMins || !elSecs) return;
    const now = new Date();
    if (now > targetXmas) targetXmas = getTargetChristmas();
    const diff = Math.max(0, targetXmas - now);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Simple parallax for mountain layers
  const parallax = document.querySelector('.parallax');
  const layerBack = document.querySelector('.parallax .back');
  const layerMid = document.querySelector('.parallax .mid');
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (layerBack) layerBack.style.transform = `translateY(${y * 0.08}px)`;
      if (layerMid) layerMid.style.transform = `translateY(${y * 0.14}px)`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
});
