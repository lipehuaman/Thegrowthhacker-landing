/* ═══════════════════════════════════════════
   The Growth Hacker — script.js
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────
     1. SPEECH BUBBLE ORBIT
     Runs independently — no external deps.
     ───────────────────────────────────────── */

  var bubbles     = Array.from(document.querySelectorAll('.bubble'));
  var bubbleAngle = 0;
  var SPEED       = 0.005;

  function updateBubbles() {
    var scene = document.getElementById('bubbleScene');
    if (!scene) { requestAnimationFrame(updateBubbles); return; }

    var sw = scene.offsetWidth;
    var sh = scene.offsetHeight;
    var cx = sw / 2;
    var cy = sh / 2;
    var rx = Math.min(sw * 0.38, 340);
    var ry = Math.min(sh * 0.36, 175);
    var n  = bubbles.length;

    bubbles.forEach(function (bub, i) {
      var angle = (i / n) * Math.PI * 2 + bubbleAngle;
      var bx = cx + rx * Math.cos(angle);
      var by = cy + ry * Math.sin(angle);
      var bw = bub.offsetWidth  || 220;
      var bh = bub.offsetHeight || 90;

      bub.style.left = (bx - bw / 2) + 'px';
      bub.style.top  = (by - bh / 2) + 'px';

      /* ── Tail: always points toward center ── */
      var tail = bub.querySelector('.bubble-tail');
      if (!tail) return;

      // Vector from this bubble's center to scene center
      var dx = cx - bx;
      var dy = cy - by;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Normalised direction
      var nx = dx / dist;
      var ny = dy / dist;

      // Place the tail at the bubble edge closest to center.
      // We find which face (top/right/bottom/left) is nearest to center
      // by projecting the normal onto the bubble rect.
      var edgeX, edgeY;
      var hw = bw / 2;
      var hh = bh / 2;

      // Scale factor to reach the bubble edge along (nx, ny)
      var tx = (nx !== 0) ? hw / Math.abs(nx) : Infinity;
      var ty = (ny !== 0) ? hh / Math.abs(ny) : Infinity;
      var t  = Math.min(tx, ty);

      // Edge point in bubble-local coords (relative to bubble top-left)
      edgeX = hw + nx * t;
      edgeY = hh + ny * t;

      // The tail triangle points "up" by default (border-top).
      // We need it to rotate so it points toward center (angle of nx,ny).
      var deg = Math.atan2(ny, nx) * (180 / Math.PI) + 90; // +90 because default "up" = 270° in atan2

      tail.style.left            = (edgeX - 12) + 'px'; // 12 = half of border-width 12px
      tail.style.top             = (edgeY - 12) + 'px';
      tail.style.transformOrigin = '12px 12px';           // rotate around the center of the triangle base
      tail.style.transform       = 'rotate(' + deg + 'deg)';
    });

    bubbleAngle += SPEED;
    requestAnimationFrame(updateBubbles);
  }

  updateBubbles();


  /* ─────────────────────────────────────────
     2. DRAGGABLE STICKERS — GSAP
     Loaded dynamically so it doesn't block
     anything else if CDN is slow.
     ───────────────────────────────────────── */

  function loadScript(src, cb) {
    var s    = document.createElement('script');
    s.src    = src;
    s.onload = cb;
    s.onerror = function () { console.warn('Failed to load: ' + src); };
    document.head.appendChild(s);
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', function () {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js', function () {

      var stickers = document.querySelectorAll('.sticker');

      // Idle float — pause on drag, resume on release
      stickers.forEach(function (el, i) {
        gsap.to(el, {
          y:        '+=12',
          rotation: (i % 2 === 0 ? '+=' : '-=') + '5',
          duration: 2.4 + i * 0.35,
          ease:     'sine.inOut',
          yoyo:     true,
          repeat:   -1,
          delay:    i * 0.25
        });
      });

      Draggable.create('.sticker', {
        type:           'x,y',
        edgeResistance: 0.6,
        onPress: function () {
          gsap.killTweensOf(this.target);
          gsap.to(this.target, { scale: 1.1, duration: 0.12 });
          this.target.style.zIndex = 999;
        },
        onRelease: function () {
          var el = this.target;
          gsap.to(el, { scale: 1, duration: 0.2 });
          gsap.to(el, {
            y:        '+=12',
            rotation: '+=5',
            duration: 2.8,
            ease:     'sine.inOut',
            yoyo:     true,
            repeat:   -1
          });
        }
      });

    });
  });


  /* ─────────────────────────────────────────
     3. SCROLL-DRIVEN WAVY LINE + STEPS
     ───────────────────────────────────────── */

  var svg      = document.getElementById('waveSvg');
  var pathBg   = document.getElementById('pathBg');
  var pathFill = document.getElementById('pathFill');
  var steps    = document.querySelectorAll('.step');

  function buildPath() {
    var inner = document.querySelector('.journey-inner');
    if (!inner || !svg || !pathBg || !pathFill) return;

    var totalH    = inner.offsetHeight;
    var innerRect = inner.getBoundingClientRect();
    if (totalH === 0) return; // layout not ready yet

    var dotYs = [];
    steps.forEach(function (step) {
      var dot = step.querySelector('.step-dot');
      if (!dot) return;
      var dr = dot.getBoundingClientRect();
      dotYs.push(dr.top - innerRect.top + dr.height / 2);
    });

    if (dotYs.length === 0) return;

    svg.setAttribute('viewBox', '0 0 120 ' + totalH);
    svg.setAttribute('height',  totalH);

    var mid = 60; // centerline of the 120px-wide SVG
    var amp = 26; // wiggle amplitude
    var d   = 'M ' + mid + ' 0 ';

    dotYs.forEach(function (y, i) {
      var prevY  = i === 0 ? 0 : dotYs[i - 1];
      var midY   = (prevY + y) / 2;
      var dir    = i % 2 === 0 ? 1 : -1;
      var wx     = mid + dir * amp;
      d += 'C ' + wx + ' ' + (prevY + (midY - prevY) * 0.35) + ', '
               + wx + ' ' + (midY  + (y    - midY)   * 0.65) + ', '
               + mid + ' ' + y + ' ';
    });

    var lastY = dotYs[dotYs.length - 1];
    d += 'C ' + (mid - 18) + ' ' + (lastY + 40) + ', '
             + (mid + 18) + ' ' + (lastY + 80) + ', '
             + mid + ' ' + totalH;

    pathBg.setAttribute('d',   d);
    pathFill.setAttribute('d', d);

    var len = pathFill.getTotalLength();
    pathFill.style.strokeDasharray  = len;
    pathFill.style.strokeDashoffset = len;
    pathFill._len = len;
  }

  // Wait for fonts + layout before measuring
  setTimeout(buildPath, 400);
  window.addEventListener('resize', function () { setTimeout(buildPath, 150); });

  function onScroll() {
    if (!pathFill || !pathFill._len) return;

    var inner   = document.querySelector('.journey-inner');
    if (!inner) return;
    var rect    = inner.getBoundingClientRect();
    var totalH  = inner.offsetHeight;
    var trigger = window.innerHeight * 0.6;
    var pct     = Math.min(Math.max((trigger - rect.top) / totalH, 0), 1);

    pathFill.style.strokeDashoffset = pathFill._len * (1 - pct);

    // Activate steps when line tip passes each dot
    var innerTop = rect.top + window.pageYOffset;
    var lineTip  = innerTop + pct * totalH;

    steps.forEach(function (step) {
      var dot    = step.querySelector('.step-dot');
      if (!dot) return;
      var dr     = dot.getBoundingClientRect();
      var dotMid = dr.top + dr.height / 2 + window.pageYOffset;
      step.classList.toggle('active', lineTip >= dotMid - 10);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setTimeout(onScroll, 200); });
  onScroll();

});