/* ═══════════════════════════════════════════
   The Growth Hacker — script.js - by @lipehuaman
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────
     1. SPEECH BUBBLE ORBIT
     ───────────────────────────────────────── */

  var bubbles     = Array.from(document.querySelectorAll('.bubble'));
  var bubbleAngle = 0;
  var SPEED       = 0.005;

  function updateBubbles() {
    var scene = document.getElementById('bubbleScene');
    if (!scene) { requestAnimationFrame(updateBubbles); return; }

    var sw = scene.offsetWidth;
    var sh = scene.offsetHeight;
    if (sw === 0 || sh === 0) { requestAnimationFrame(updateBubbles); return; }

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

      /* ── Tail: solo si existe en el HTML ── */
      var tail = bub.querySelector('.bubble-tail');
      if (tail) {
        var dx = cx - bx;
        var dy = cy - by;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var nx = dx / dist;
        var ny = dy / dist;
        var hw = bw / 2;
        var hh = bh / 2;
        var tx = (nx !== 0) ? hw / Math.abs(nx) : Infinity;
        var ty = (ny !== 0) ? hh / Math.abs(ny) : Infinity;
        var t  = Math.min(tx, ty);
        var edgeX = hw + nx * t;
        var edgeY = hh + ny * t;
        var deg = Math.atan2(ny, nx) * (180 / Math.PI) + 90;
        tail.style.left            = (edgeX - 12) + 'px';
        tail.style.top             = (edgeY - 12) + 'px';
        tail.style.transformOrigin = '12px 12px';
        tail.style.transform       = 'rotate(' + deg + 'deg)';
      }
    });

    bubbleAngle += SPEED;
    requestAnimationFrame(updateBubbles);
  }

  updateBubbles();


  /* ─────────────────────────────────────────
     2. DRAGGABLE STICKERS — GSAP
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

      /* ── FUNNEL CHARACTER ── */
var funnelAnim = lottie.loadAnimation({
  container:  document.getElementById('funnelLottie'),
  renderer:   'svg',
  loop:       false,
  autoplay:   false,
  path:       './Assets/Funnel_ch.json'
});

funnelAnim.addEventListener('DOMLoaded', function () {
  // Play idle (frames 0-79) on loop
  funnelAnim.playSegments([0, 79], true);
  funnelAnim.loop = true;

  var funnelEl = document.getElementById('funnelChar');

  // Float animation
  gsap.to(funnelEl, {
    y:        '+=14',
    duration: 2.2,
    ease:     'sine.inOut',
    yoyo:     true,
    repeat:   -1
  });

  // Draggable
  Draggable.create(funnelEl, {
    type: 'x,y',
    edgeResistance: 0.6,
    onPress: function () {
      gsap.killTweensOf(funnelEl);
      gsap.to(funnelEl, { scale: 1.05, duration: 0.1 });
      funnelEl.style.zIndex = 999;
      // Ojos cerrados
      funnelAnim.loop = false;
      funnelAnim.playSegments([80, 110], true);
    },
    onRelease: function () {
      gsap.to(funnelEl, { scale: 1, duration: 0.15 });
      // Vuelve al idle
      funnelAnim.loop = true;
      funnelAnim.playSegments([0, 79], true);
      // Retoma float
      gsap.to(funnelEl, {
        y:        '+=14',
        duration: 2.2,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1
      });
    }
  });

  // Ojos siguen el mouse
  var svg = funnelEl.querySelector('svg');

  window.addEventListener('mousemove', function (e) {
    if (!svg) return;
    var rect   = funnelEl.getBoundingClientRect();
    var charCX = rect.left + rect.width  / 2;
    var charCY = rect.top  + rect.height / 2;

    var dx   = e.clientX - charCX;
    var dy   = e.clientY - charCY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var maxMove = 5; // px máx que se mueve la pupila

    var mx = (dx / Math.max(dist, 1)) * Math.min(dist * 0.08, maxMove);
    var my = (dy / Math.max(dist, 1)) * Math.min(dist * 0.08, maxMove);

    // Las pupilas son las capas 2 y 5 (índice 1 y 4 en el array)
    var lottieInstance = funnelAnim.renderer.elements;
    if (!lottieInstance) return;

    // Mueve las pupilas via transform en el SVG
    var pupils = svg.querySelectorAll('[data-name="Pupila izquierda"], [data-name="Pupila derecha"]');
    pupils.forEach(function (p) {
      p.style.transform = 'translate(' + mx + 'px, ' + my + 'px)';
    });
  });
});

/* ── KEYWORD CHARACTER ── */
var keywrdAnim = lottie.loadAnimation({
  container:  document.getElementById('keywrdLottie'),
  renderer:   'svg',
  loop:       false,
  autoplay:   false,
  path:       './Assets/Keywrd_ch.json'
});

keywrdAnim.addEventListener('DOMLoaded', function () {
  keywrdAnim.playSegments([0, 79], true);
  keywrdAnim.loop = true;

  var keywrdEl = document.getElementById('keywrdChar');

  gsap.to(keywrdEl, {
    y:        '+=14',
    duration: 2.6,
    ease:     'sine.inOut',
    yoyo:     true,
    repeat:   -1,
    delay:    0.4
  });

  Draggable.create(keywrdEl, {
    type: 'x,y',
    edgeResistance: 0.6,
    onPress: function () {
      gsap.killTweensOf(keywrdEl);
      gsap.to(keywrdEl, { scale: 1.05, duration: 0.1 });
      keywrdEl.style.zIndex = 999;
      keywrdAnim.loop = false;
      keywrdAnim.playSegments([80, 110], true);
    },
    onRelease: function () {
      gsap.to(keywrdEl, { scale: 1, duration: 0.15 });
      keywrdAnim.loop = true;
      keywrdAnim.playSegments([0, 79], true);
      gsap.to(keywrdEl, {
        y:        '+=14',
        duration: 2.6,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1
      });
    }
  });

  var keywrdSvg = keywrdEl.querySelector('svg');
  window.addEventListener('mousemove', function (e) {
    if (!keywrdSvg) return;
    var rect   = keywrdEl.getBoundingClientRect();
    var charCX = rect.left + rect.width  / 2;
    var charCY = rect.top  + rect.height / 2;
    var dx     = e.clientX - charCX;
    var dy     = e.clientY - charCY;
    var dist   = Math.sqrt(dx * dx + dy * dy);
    var maxMove = 5;
    var mx = (dx / Math.max(dist, 1)) * Math.min(dist * 0.08, maxMove);
    var my = (dy / Math.max(dist, 1)) * Math.min(dist * 0.08, maxMove);
    var pupils = keywrdSvg.querySelectorAll('[data-name="Pupila izquierda"], [data-name="Pupila derecha"]');
    pupils.forEach(function (p) {
      p.style.transform = 'translate(' + mx + 'px, ' + my + 'px)';
    });
  });
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
    if (totalH === 0) return;

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

    var mid = 60;
    var amp = 26;
var d   = 'M ' + mid + ' ' + dotYs[0] + ' ';

dotYs.forEach(function (y, i) {
  if (i === 0) return; // salta el primer dot, ya empezamos ahí
  var prevY  = dotYs[i - 1];
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

  setTimeout(buildPath, 400);
  window.addEventListener('load', function () { setTimeout(buildPath, 100); });
  window.addEventListener('resize', function () { setTimeout(buildPath, 150); });

  function onScroll() {
    if (!pathFill) return;
    if (!pathFill._len) { buildPath(); return; }

    var inner   = document.querySelector('.journey-inner');
    if (!inner) return;
    var rect    = inner.getBoundingClientRect();
    var totalH  = inner.offsetHeight;
    var trigger = window.innerHeight * 0.6;
    var pct     = Math.min(Math.max((trigger - rect.top) / totalH, 0), 1);

    pathFill.style.strokeDashoffset = pathFill._len * (1 - pct);

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